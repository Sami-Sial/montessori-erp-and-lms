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

export default router;
