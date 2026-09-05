/**
 * @openapi
 * tags:
 *   name: Curriculum
 *   description: Curriculum areas, milestones, lesson plans and materials
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

// ─── Schemas ─────────────────────────────────────────────────────────────────

const lessonPlanSchema = z.object({
  classroomId:      z.string().uuid(),
  academicYearId:   z.string().uuid(),
  curriculumAreaId: z.string().uuid(),
  title:            z.string().min(1).max(200),
  objectives:       z.string().optional().nullable(),
  instructions:     z.string().optional().nullable(),
  notes:            z.string().optional().nullable(),
  ageGroupMin:      z.coerce.number().optional().nullable(),
  ageGroupMax:      z.coerce.number().optional().nullable(),
  scheduledDate:    z.coerce.date().optional().nullable(),
  durationMinutes:  z.coerce.number().int().optional().nullable(),
  status:           z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'),
  materialIds:      z.array(z.string().uuid()).optional(),
  milestoneId:      z.string().uuid().optional().nullable(),
});

// ─── Curriculum areas ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /curriculum/areas:
 *   get:
 *     summary: List all curriculum areas and their milestones
 *     tags: [Curriculum]
 */
router.get('/areas', requirePermission('curriculum:read'), async (req, res, next) => {
  try {
    const curricula = await prisma.curriculum.findMany({
      where: { organizationId: req.organizationId, deletedAt: null },
      include: {
        areas: {
          include: {
            milestones: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json(curricula);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /curriculum/seed:
 *   post:
 *     summary: Seed default Montessori curriculum for the organization
 *     tags: [Curriculum]
 */

/**
 * @openapi
 * /curriculum:
 *   post:
 *     summary: Create a new curriculum
 *     tags: [Curriculum]
 */
router.post('/', requirePermission('curriculum:write'), validate(z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  targetAgeMin: z.coerce.number().min(0).max(18),
  targetAgeMax: z.coerce.number().min(0).max(18),
})), async (req, res, next) => {
  try {
    const curr = await prisma.curriculum.create({
      data: {
        organizationId: req.organizationId,
        name: req.body.name,
        description: req.body.description,
        targetAgeMin: req.body.targetAgeMin,
        targetAgeMax: req.body.targetAgeMax,
        areas: {
          create: [
            { name: 'Practical Life', colorHex: '#4CAF50', iconName: 'Hand', sortOrder: 0 },
            { name: 'Sensorial', colorHex: '#FF9800', iconName: 'Eye', sortOrder: 1 },
            { name: 'Language', colorHex: '#2196F3', iconName: 'MessageCircle', sortOrder: 2 },
            { name: 'Mathematics', colorHex: '#F44336', iconName: 'Hash', sortOrder: 3 },
            { name: 'Cultural Studies', colorHex: '#9C27B0', iconName: 'Globe', sortOrder: 4 },
          ]
        }
      },
      include: { areas: true }
    });
    res.status(201).json(curr);
  } catch (err) {
    next(err);
  }
});

router.post('/seed', requirePermission('curriculum:write'), async (req, res, next) => {
  try {
    const existing = await prisma.curriculum.count({ where: { organizationId: req.organizationId, deletedAt: null } });
    if (existing > 0) throw new AppError('CONFLICT', 'Curriculum already seeded for this organization', 409);

    const defaultCurricula = [
      { name: 'Toddler Community', targetAgeMin: 1.5, targetAgeMax: 3.0 },
      { name: "Children's House (Primary)", targetAgeMin: 3.0, targetAgeMax: 6.0 },
      { name: 'Lower Elementary', targetAgeMin: 6.0, targetAgeMax: 9.0 },
      { name: 'Upper Elementary', targetAgeMin: 9.0, targetAgeMax: 12.0 },
      { name: 'Adolescent', targetAgeMin: 12.0, targetAgeMax: 15.0 },
    ];

    const coreAreas = [
      { name: 'Practical Life', colorHex: '#4CAF50', iconName: 'Hand' },
      { name: 'Sensorial', colorHex: '#FF9800', iconName: 'Eye' },
      { name: 'Language', colorHex: '#2196F3', iconName: 'MessageCircle' },
      { name: 'Mathematics', colorHex: '#F44336', iconName: 'Hash' },
      { name: 'Cultural Studies', colorHex: '#9C27B0', iconName: 'Globe' },
    ];

    const seeded = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const curr of defaultCurricula) {
        const createdCurr = await tx.curriculum.create({
          data: {
            organizationId: req.organizationId,
            name: curr.name,
            targetAgeMin: curr.targetAgeMin,
            targetAgeMax: curr.targetAgeMax,
            isDefault: true,
            areas: {
              create: coreAreas.map((area, idx) => ({
                name: area.name,
                colorHex: area.colorHex,
                iconName: area.iconName,
                sortOrder: idx,
              })),
            },
          },
        });
        results.push(createdCurr);
      }
      return results;
    });

    res.status(201).json({ message: 'Seeded default Montessori curricula successfully', count: seeded.length });
  } catch (err) {
    next(err);
  }
});

// ─── Lesson plans ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /curriculum/lesson-plans:
 *   get:
 *     summary: List lesson plans for a classroom
 *     tags: [Curriculum]
 */
router.get('/lesson-plans', requirePermission('curriculum:read'), async (req, res, next) => {
  try {
    const { classroomId, status, startDate, endDate } = req.query;
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: {
        organizationId: req.organizationId,
        deletedAt: null,
        ...(classroomId && { classroomId }),
        ...(status && { status }),
        ...(startDate && endDate && {
          scheduledDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        curriculumArea: { select: { id: true, name: true, colorHex: true, iconName: true } },
        materials: {
          include: { material: { select: { id: true, name: true, imageUrl: true } } },
        },
        createdBy: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
        classroom: {
          select: { id: true, name: true }
        }
      },
      orderBy: { scheduledDate: 'asc' },
    });
    res.json(lessonPlans);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /curriculum/lesson-plans/{id}:
 *   get:
 *     summary: Get a single lesson plan
 *     tags: [Curriculum]
 */
router.get('/lesson-plans/:id', requirePermission('curriculum:read'), async (req, res, next) => {
  try {
    const lp = await prisma.lessonPlan.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        curriculumArea: true,
        materials: { include: { material: true } },
        classroom: { select: { id: true, name: true } },
        createdBy: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!lp) throw new AppError('NOT_FOUND', 'Lesson plan not found', 404);
    assertTenantOwnership(lp.organizationId, req.organizationId);
    res.json(lp);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /curriculum/lesson-plans:
 *   post:
 *     summary: Create a lesson plan
 *     tags: [Curriculum]
 */
router.post(
  '/lesson-plans',
  requirePermission('curriculum:write'),
  validate(lessonPlanSchema),
  async (req, res, next) => {
    try {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user.sub, organizationId: req.organizationId },
      });
      if (!staff) throw new AppError('NOT_FOUND', 'Staff record not found for current user', 404);

      const { materialIds, ...lpData } = req.body;

      const lp = await prisma.$transaction(async (tx) => {
        const plan = await tx.lessonPlan.create({
          data: {
            organizationId: req.organizationId,
            createdByStaffId: staff.id,
            ...lpData,
          },
        });

        if (materialIds?.length) {
          await tx.lessonPlanMaterial.createMany({
            data: materialIds.map((materialId) => ({
              lessonPlanId: plan.id,
              materialId,
              quantity: 1,
            })),
            skipDuplicates: true,
          });
        }

        return plan;
      });

      res.status(201).json(lp);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /curriculum/lesson-plans/{id}:
 *   patch:
 *     summary: Update a lesson plan
 *     tags: [Curriculum]
 */
router.patch(
  '/lesson-plans/:id',
  requirePermission('curriculum:write'),
  validate(lessonPlanSchema.partial()),
  async (req, res, next) => {
    try {
      const { materialIds, ...lpData } = req.body;

      const lp = await prisma.$transaction(async (tx) => {
        const plan = await tx.lessonPlan.update({
          where: { id: req.params.id },
          data: lpData,
        });

        if (materialIds !== undefined) {
          await tx.lessonPlanMaterial.deleteMany({ where: { lessonPlanId: plan.id } });
          if (materialIds.length) {
            await tx.lessonPlanMaterial.createMany({
              data: materialIds.map((materialId) => ({
                lessonPlanId: plan.id,
                materialId,
                quantity: 1,
              })),
              skipDuplicates: true,
            });
          }
        }

        return plan;
      });

      res.json(lp);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /curriculum/lesson-plans/{id}:
 *   delete:
 *     summary: Soft-delete a lesson plan
 *     tags: [Curriculum]
 */
router.delete('/lesson-plans/:id', requirePermission('curriculum:write'), async (req, res, next) => {
  try {
    await prisma.lessonPlan.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'Lesson plan deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── Materials ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /curriculum/materials:
 *   get:
 *     summary: List Montessori materials catalog
 *     tags: [Curriculum]
 */
router.get('/materials', requirePermission('curriculum:read'), async (req, res, next) => {
  try {
    const materials = await prisma.material.findMany({
      where: { organizationId: req.organizationId, deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(materials);
  } catch (err) {
    next(err);
  }
});

// ─── Areas and Milestones ──────────────────────────────────────────────────────

router.post('/areas', requirePermission('curriculum:write'), validate(z.object({
  curriculumId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  colorHex: z.string().optional(),
  iconName: z.string().optional(),
})), async (req, res, next) => {
  try {
    const area = await prisma.curriculumArea.create({ data: req.body });
    res.status(201).json(area);
  } catch (err) { next(err); }
});

router.patch('/areas/:id', requirePermission('curriculum:write'), validate(z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  colorHex: z.string().optional(),
  iconName: z.string().optional(),
})), async (req, res, next) => {
  try {
    const area = await prisma.curriculumArea.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(area);
  } catch (err) { next(err); }
});

router.post('/areas/:areaId/milestones', requirePermission('curriculum:write'), validate(z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  ageGroupMin: z.coerce.number().min(0).max(18),
  ageGroupMax: z.coerce.number().min(0).max(18),
})), async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.create({
      data: { ...req.body, curriculumAreaId: req.params.areaId },
    });
    res.status(201).json(milestone);
  } catch (err) { next(err); }
});

router.patch('/milestones/:id', requirePermission('curriculum:write'), validate(z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  ageGroupMin: z.coerce.number().min(0).max(18).optional(),
  ageGroupMax: z.coerce.number().min(0).max(18).optional(),
})), async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(milestone);
  } catch (err) { next(err); }
});

export default router;
