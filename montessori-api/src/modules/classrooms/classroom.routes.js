/**
 * @openapi
 * tags:
 *   name: Classrooms
 *   description: Classroom management
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate } from '../../middleware/validate.js';
import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';

const router = Router();
router.use(authenticate, scopeTenant);

const classroomSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  curriculumId:   z.string().uuid(),
  name:           z.string().min(1).max(100),
  ageGroupMin:    z.coerce.number().min(0).max(18),
  ageGroupMax:    z.coerce.number().min(0).max(18),
  capacity:       z.coerce.number().int().min(1).max(100).default(25),
  roomNumber:     z.string().optional().nullable(),
  studentIds:     z.array(z.string().uuid()).optional(),
  staffIds:       z.array(z.string().uuid()).optional(),
});

/**
 * @openapi
 * /classrooms:
 *   get:
 *     summary: List all classrooms
 *     tags: [Classrooms]
 */
router.get('/', requirePermission('student:read'), async (req, res, next) => {
  try {
    const { branchId, academicYearId } = req.query;
    const classrooms = await prisma.classroom.findMany({
      where: {
        organizationId: req.organizationId,
        deletedAt: null,
        ...(branchId && { branchId }),
        ...(academicYearId && { academicYearId }),
        // If the user is a TEACHER, strictly filter the classrooms they can see
        ...(req.user?.roles?.includes('TEACHER') && {
          staffAssignments: { some: { staff: { userId: req.user.sub } } }
        }),
      },
      include: {
        academicYear: { select: { id: true, name: true } },
        curriculum: { select: { id: true, name: true } },
        staffAssignments: {
          where: { isPrimary: true },
          include: {
            staff: {
              select: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            },
          },
          take: 1,
        },
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /classrooms/{id}:
 *   get:
 *     summary: Get classroom detail with enrolled students
 *     tags: [Classrooms]
 */
router.get('/:id', requirePermission('student:read'), async (req, res, next) => {
  try {
    const classroom = await prisma.classroom.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        academicYear: true,
        curriculum: true,
        staffAssignments: {
          include: {
            staff: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } } } },
          },
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, photoUrl: true, studentNumber: true, dateOfBirth: true, isActive: true, guardians: { include: { guardian: true } } } },
          },
          orderBy: { student: { lastName: 'asc' } },
        },
      },
    });

    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);
    res.json(classroom);
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('curriculum:write'), validate(classroomSchema), async (req, res, next) => {
  try {
    let { academicYearId, studentIds, staffIds, ...rest } = req.body;
    
    if (!academicYearId) {
      const year = await prisma.academicYear.findFirst({ where: { organizationId: req.organizationId, isCurrent: true } });
      if (!year) throw new AppError('BAD_REQUEST', 'No active academic year found in organization', 400);
      academicYearId = year.id;
    }

    const classroom = await prisma.$transaction(async (tx) => {
      const cls = await tx.classroom.create({
        data: { organizationId: req.organizationId, academicYearId, ...rest },
      });

      if (studentIds && studentIds.length > 0) {
        await tx.enrollment.updateMany({
          where: { studentId: { in: studentIds }, status: 'ACTIVE' },
          data: { status: 'INACTIVE' },
        });
        await tx.enrollment.createMany({
          data: studentIds.map(studentId => ({
            organizationId: req.organizationId,
            studentId,
            classroomId: cls.id,
            academicYearId,
            enrolledAt: new Date(),
            status: 'ACTIVE',
          })),
        });
      }

      if (staffIds && staffIds.length > 0) {
        await tx.staffAssignment.createMany({
          data: staffIds.map((staffId, index) => ({
            organizationId: req.organizationId,
            staffId,
            classroomId: cls.id,
            academicYearId,
            isPrimary: index === 0, // make first staff primary
          })),
        });
      }

      return cls;
    });

    res.status(201).json(classroom);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requirePermission('curriculum:write'), validate(classroomSchema.partial()), async (req, res, next) => {
  try {
    const classroom = await prisma.classroom.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(classroom);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requirePermission('curriculum:write'), async (req, res, next) => {
  try {
    const classroom = await prisma.classroom.findFirst({ where: { id: req.params.id } });
    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);
    
    await prisma.classroom.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

const enrollSchema = z.object({
  studentId: z.string().uuid(),
});

router.post('/:id/enroll', requirePermission('curriculum:write'), validate(enrollSchema), async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const classroomId = req.params.id;

    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId } });
    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);
    
    const year = await prisma.academicYear.findFirst({ where: { organizationId: req.organizationId, isCurrent: true } });
    if (!year) throw new AppError('BAD_REQUEST', 'No active academic year found in organization', 400);

    const enrollment = await prisma.$transaction(async (tx) => {
      // Deactivate any existing enrollments for this student
      await tx.enrollment.updateMany({
        where: { studentId, status: 'ACTIVE' },
        data: { status: 'INACTIVE' },
      });
      // Create new active enrollment
      return await tx.enrollment.create({
        data: {
          organizationId: req.organizationId,
          studentId,
          classroomId,
          academicYearId: year.id,
          enrolledAt: new Date(),
          status: 'ACTIVE',
        },
      });
    });

    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/enroll/:studentId', requirePermission('curriculum:write'), async (req, res, next) => {
  try {
    const { id: classroomId, studentId } = req.params;

    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId } });
    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);

    await prisma.enrollment.updateMany({
      where: { classroomId, studentId, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

const assignStaffSchema = z.object({
  staffId: z.string().uuid(),
  isPrimary: z.boolean().optional().default(false),
});

router.post('/:id/staff', requirePermission('curriculum:write'), validate(assignStaffSchema), async (req, res, next) => {
  try {
    const { staffId, isPrimary } = req.body;
    const classroomId = req.params.id;

    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId } });
    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);

    const year = await prisma.academicYear.findFirst({ where: { organizationId: req.organizationId, isCurrent: true } });
    if (!year) throw new AppError('BAD_REQUEST', 'No active academic year found in organization', 400);

    const existing = await prisma.staffAssignment.findFirst({
      where: { classroomId, staffId, academicYearId: year.id },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    // Enforce 1-to-1 Teacher-to-Classroom logic
    // We check if this staff member is a TEACHER
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: { include: { roles: true } } }
    });

    if (!staff) throw new AppError('NOT_FOUND', 'Staff not found', 404);

    const isTeacher = staff.user?.roles?.some(r => r.name === 'TEACHER');
    
    if (isTeacher) {
      const existingAssignment = await prisma.staffAssignment.findFirst({
        where: { staffId, academicYearId: year.id }
      });
      if (existingAssignment) {
        throw new AppError('BAD_REQUEST', 'Teachers can only be assigned to a single classroom per academic year in the Montessori model.', 400);
      }
    }

    const assignment = await prisma.staffAssignment.create({
      data: {
        organizationId: req.organizationId,
        staffId,
        classroomId,
        academicYearId: year.id,
        isPrimary,
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/staff/:staffId', requirePermission('curriculum:write'), async (req, res, next) => {
  try {
    const { id: classroomId, staffId } = req.params;

    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId } });
    if (!classroom) throw new AppError('NOT_FOUND', 'Classroom not found', 404);
    assertTenantOwnership(classroom.organizationId, req.organizationId);

    await prisma.staffAssignment.deleteMany({
      where: { classroomId, staffId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
