/**
 * @openapi
 * tags:
 *   name: Observations
 *   description: Student observations and progress tracking
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema } from '../../lib/pagination.js';
import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';
import { createUploader } from '../../config/cloudinary.js';

const router = Router();
const mediaUploader = createUploader('observations', ['jpg','jpeg','png','webp','gif']);

router.use(authenticate, scopeTenant);

const observationSchema = z.object({
  studentId:        z.string().uuid(),
  curriculumAreaId: z.string().uuid(),
  milestoneId:      z.string().uuid().optional().nullable(),
  note:             z.string().min(1).max(2000),
  masteryLevel:     z.enum(['NOT_INTRODUCED','INTRODUCED','PRACTICING','MASTERED','EXTENDING']).default('INTRODUCED'),
  observedAt:       z.coerce.date().optional(),
});

const listQuerySchema = paginationSchema.extend({
  studentId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  curriculumAreaId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * @openapi
 * /observations:
 *   get:
 *     summary: List observations (filterable by student, area, date range)
 *     tags: [Observations]
 */
router.get(
  '/',
  requirePermission('observation:read'),
  validateQuery(listQuerySchema),
  async (req, res, next) => {
    try {
      const { page, pageSize, studentId, curriculumAreaId, startDate, endDate } = req.query;

      const where = {
        organizationId: req.organizationId,
        deletedAt: null,
        ...(studentId && { studentId }),
        ...(curriculumAreaId && { curriculumAreaId }),
        ...(startDate && { observedAt: { gte: new Date(startDate) } }),
        ...(endDate && { observedAt: { lte: new Date(endDate) } }),
      };

      const [total, observations] = await Promise.all([
        prisma.observation.count({ where }),
        prisma.observation.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { observedAt: 'desc' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
            curriculumArea: { select: { id: true, name: true, colorHex: true, iconName: true } },
            milestone: { select: { id: true, title: true } },
            staff: { select: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          },
        }),
      ]);

      res.json({
        data: observations,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /observations/{id}:
 *   get:
 *     summary: Get single observation
 *     tags: [Observations]
 */
router.get('/:id', requirePermission('observation:read'), async (req, res, next) => {
  try {
    const obs = await prisma.observation.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        student: true,
        curriculumArea: true,
        milestone: true,
        staff: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!obs) throw new AppError('NOT_FOUND', 'Observation not found', 404);
    assertTenantOwnership(obs.organizationId, req.organizationId);
    res.json(obs);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /observations:
 *   post:
 *     summary: Log a new observation
 *     tags: [Observations]
 */
router.post(
  '/',
  requirePermission('observation:write'),
  validate(observationSchema),
  async (req, res, next) => {
    try {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user.sub, organizationId: req.organizationId },
      });
      if (!staff) throw new AppError('NOT_FOUND', 'Staff record not found', 404);

      const obs = await prisma.observation.create({
        data: {
          organizationId: req.organizationId,
          staffId: staff.id,
          ...req.body,
          observedAt: req.body.observedAt ?? new Date(),
        },
      });

      // Update or create student progress for this milestone
      if (req.body.milestoneId) {
        await prisma.studentProgress.upsert({
          where: {
            studentId_milestoneId: {
              studentId: req.body.studentId,
              milestoneId: req.body.milestoneId,
            },
          },
          update: {
            masteryLevel: req.body.masteryLevel,
            lastUpdatedAt: new Date(),
          },
          create: {
            organizationId: req.organizationId,
            studentId: req.body.studentId,
            curriculumAreaId: req.body.curriculumAreaId,
            milestoneId: req.body.milestoneId,
            masteryLevel: req.body.masteryLevel,
          },
        });
      }

      res.status(201).json(obs);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /observations/{id}/media:
 *   post:
 *     summary: Upload media (photo/video) to an observation
 *     tags: [Observations]
 */
router.post(
  '/:id/media',
  requirePermission('observation:write'),
  mediaUploader.array('media', 5),
  async (req, res, next) => {
    try {
      const obs = await prisma.observation.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!obs) throw new AppError('NOT_FOUND', 'Observation not found', 404);
      assertTenantOwnership(obs.organizationId, req.organizationId);

      if (!req.files?.length) {
        return res.status(400).json({ error: { code: 'NO_FILES', message: 'No media files uploaded', details: null } });
      }

      const newUrls = req.files.map((f) => f.path);
      const updated = await prisma.observation.update({
        where: { id: req.params.id },
        data: { mediaUrls: [...obs.mediaUrls, ...newUrls] },
      });

      res.json({ mediaUrls: updated.mediaUrls });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /observations/{id}:
 *   patch:
 *     summary: Update an observation
 *     tags: [Observations]
 */
router.patch(
  '/:id',
  requirePermission('observation:write'),
  validate(observationSchema.partial()),
  async (req, res, next) => {
    try {
      const obs = await prisma.observation.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(obs);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /observations/{id}:
 *   delete:
 *     summary: Soft-delete an observation
 *     tags: [Observations]
 */
router.delete('/:id', requirePermission('observation:write'), async (req, res, next) => {
  try {
    await prisma.observation.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'Observation deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
