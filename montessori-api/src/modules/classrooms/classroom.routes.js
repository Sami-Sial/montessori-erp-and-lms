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
  branchId:       z.string().uuid(),
  academicYearId: z.string().uuid(),
  name:           z.string().min(1).max(100),
  ageGroupMin:    z.coerce.number().min(0).max(18),
  ageGroupMax:    z.coerce.number().min(0).max(18),
  capacity:       z.coerce.number().int().min(1).max(100).default(25),
  roomNumber:     z.string().optional().nullable(),
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
      },
      include: {
        branch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
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
        branch: true,
        academicYear: true,
        staffAssignments: {
          include: {
            staff: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } } } },
          },
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, photoUrl: true, studentNumber: true, dateOfBirth: true } },
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
    const classroom = await prisma.classroom.create({
      data: { organizationId: req.organizationId, ...req.body },
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

export default router;
