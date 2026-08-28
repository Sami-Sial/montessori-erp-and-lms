/**
 * @openapi
 * tags:
 *   name: Sync
 *   description: |
 *     Offline-first sync endpoints. Clients (PWA/tablet) queue writes while
 *     offline into IndexedDB, then POST to /sync/push on reconnect.
 *     The server processes each item: simple fields use last-write-wins,
 *     ambiguous conflicts are flagged as CONFLICT for manual review.
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const syncItemSchema = z.object({
  clientId:      z.string().min(1),   // client-side temp ID (for response mapping)
  deviceId:      z.string().min(1),
  entity:        z.enum(['AttendanceRecord', 'Observation', 'StudentProgress', 'LessonPlan']),
  entityId:      z.string().uuid().optional().nullable(),  // null for CREATE
  operation:     z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload:       z.record(z.unknown()),
  clientVersion: z.coerce.number().int().min(1).default(1),
  clientTs:      z.coerce.date(), // client timestamp of the operation
});

const syncPushSchema = z.object({
  items: z.array(syncItemSchema).min(1).max(100),
});

// ─── Entity processors ────────────────────────────────────────────────────────

/**
 * Process a single sync item. Returns { status, entityId, conflictId? }
 */
const processSyncItem = async (item, context) => {
  const { organizationId, actorId } = context;
  const { entity, entityId, operation, payload, clientVersion, clientTs, deviceId } = item;

  try {
    switch (entity) {
      case 'AttendanceRecord':
        return await syncAttendanceRecord({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId });

      case 'Observation':
        return await syncObservation({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId });

      case 'StudentProgress':
        return await syncStudentProgress({ entityId, operation, payload, organizationId, actorId });

      case 'LessonPlan':
        return await syncLessonPlan({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId });

      default:
        return { status: 'FAILED', error: `Unsupported entity: ${entity}` };
    }
  } catch (err) {
    return { status: 'FAILED', error: err.message };
  }
};

// ─── AttendanceRecord sync ────────────────────────────────────────────────────

const syncAttendanceRecord = async ({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId }) => {
  const { studentId, classroomId, date, checkType, method, status, notes } = payload;

  if (operation === 'CREATE' || operation === 'UPDATE') {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceRecord.findFirst({
      where: { studentId, date: normalizedDate, checkType },
    });

    if (existing && operation === 'UPDATE') {
      // Conflict check: if server was updated more recently than client version
      // We use a simple version-based approach via updatedAt comparison
      const serverUpdatedAt = existing.updatedAt.getTime();
      const clientUpdatedAt = new Date(payload.updatedAt ?? 0).getTime();

      if (serverUpdatedAt > clientUpdatedAt && existing.markedByUserId !== actorId) {
        // CONFLICT — log for manual review
        const conflictLog = await prisma.syncLog.create({
          data: {
            organizationId,
            deviceId,
            entity: 'AttendanceRecord',
            entityId: existing.id,
            operation: 'UPDATE',
            resolution: 'MANUAL',
            clientPayload: payload,
            serverPayload: existing,
            resolvedPayload: null,
          },
        });
        return { status: 'CONFLICT', entityId: existing.id, conflictId: conflictLog.id };
      }
    }

    // Last-write-wins for simple attendance fields
    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_date_checkType: { studentId, date: normalizedDate, checkType: checkType ?? 'CHECK_IN' },
      },
      update: { status, method: method ?? 'MANUAL', notes: notes ?? null, markedByUserId: actorId },
      create: {
        organizationId,
        studentId,
        classroomId,
        date: normalizedDate,
        checkType: checkType ?? 'CHECK_IN',
        method: method ?? 'MANUAL',
        status: status ?? 'PRESENT',
        notes: notes ?? null,
        markedByUserId: actorId,
        checkInAt: checkType === 'CHECK_IN' ? new Date() : null,
      },
    });

    await prisma.syncLog.create({
      data: {
        organizationId,
        deviceId,
        entity: 'AttendanceRecord',
        entityId: record.id,
        operation,
        resolution: 'LAST_WRITE_WINS',
        clientPayload: payload,
        serverPayload: record,
        resolvedPayload: record,
        resolvedAt: new Date(),
      },
    });

    return { status: 'SYNCED', entityId: record.id };
  }

  return { status: 'FAILED', error: 'DELETE not supported for attendance via sync' };
};

// ─── Observation sync ─────────────────────────────────────────────────────────

const syncObservation = async ({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId }) => {
  if (operation === 'CREATE') {
    const staff = await prisma.staff.findFirst({ where: { userId: actorId, organizationId } });
    if (!staff) return { status: 'FAILED', error: 'Staff record not found' };

    const obs = await prisma.observation.create({
      data: {
        organizationId,
        staffId: staff.id,
        studentId: payload.studentId,
        curriculumAreaId: payload.curriculumAreaId,
        milestoneId: payload.milestoneId ?? null,
        note: payload.note ?? '',
        masteryLevel: payload.masteryLevel ?? 'INTRODUCED',
        observedAt: payload.observedAt ? new Date(payload.observedAt) : new Date(),
      },
    });

    // Update StudentProgress
    if (payload.milestoneId) {
      await prisma.studentProgress.upsert({
        where: { studentId_milestoneId: { studentId: payload.studentId, milestoneId: payload.milestoneId } },
        update: { masteryLevel: payload.masteryLevel ?? 'INTRODUCED', lastUpdatedAt: new Date() },
        create: {
          organizationId,
          studentId: payload.studentId,
          curriculumAreaId: payload.curriculumAreaId,
          milestoneId: payload.milestoneId,
          masteryLevel: payload.masteryLevel ?? 'INTRODUCED',
        },
      });
    }

    return { status: 'SYNCED', entityId: obs.id };
  }

  if (operation === 'UPDATE' && entityId) {
    const existing = await prisma.observation.findFirst({ where: { id: entityId, deletedAt: null } });
    if (!existing) return { status: 'FAILED', error: 'Observation not found' };

    // Version conflict detection
    if (payload.clientVersion && existing.updatedAt > new Date(payload.clientUpdatedAt ?? 0)) {
      const conflictLog = await prisma.syncLog.create({
        data: {
          organizationId,
          deviceId,
          entity: 'Observation',
          entityId,
          operation: 'UPDATE',
          resolution: 'MANUAL',
          clientPayload: payload,
          serverPayload: existing,
          resolvedPayload: null,
        },
      });
      return { status: 'CONFLICT', entityId, conflictId: conflictLog.id };
    }

    const updated = await prisma.observation.update({
      where: { id: entityId },
      data: {
        note: payload.note ?? existing.note,
        masteryLevel: payload.masteryLevel ?? existing.masteryLevel,
        curriculumAreaId: payload.curriculumAreaId ?? existing.curriculumAreaId,
        milestoneId: payload.milestoneId ?? existing.milestoneId,
      },
    });

    return { status: 'SYNCED', entityId: updated.id };
  }

  return { status: 'FAILED', error: 'Invalid operation or missing entityId' };
};

// ─── StudentProgress sync ─────────────────────────────────────────────────────

const syncStudentProgress = async ({ entityId, operation, payload, organizationId, actorId }) => {
  if (['CREATE', 'UPDATE'].includes(operation)) {
    const record = await prisma.studentProgress.upsert({
      where: { studentId_milestoneId: { studentId: payload.studentId, milestoneId: payload.milestoneId } },
      update: { masteryLevel: payload.masteryLevel, lastUpdatedAt: new Date() },
      create: {
        organizationId,
        studentId: payload.studentId,
        curriculumAreaId: payload.curriculumAreaId,
        milestoneId: payload.milestoneId,
        masteryLevel: payload.masteryLevel ?? 'INTRODUCED',
      },
    });
    return { status: 'SYNCED', entityId: record.id };
  }
  return { status: 'FAILED', error: 'DELETE not supported via sync' };
};

// ─── LessonPlan sync ──────────────────────────────────────────────────────────

const syncLessonPlan = async ({ entityId, operation, payload, organizationId, actorId, clientVersion, deviceId }) => {
  if (operation === 'CREATE') {
    const staff = await prisma.staff.findFirst({ where: { userId: actorId, organizationId } });
    if (!staff) return { status: 'FAILED', error: 'Staff record not found' };

    const lp = await prisma.lessonPlan.create({
      data: {
        organizationId,
        createdByStaffId: staff.id,
        classroomId: payload.classroomId,
        academicYearId: payload.academicYearId,
        curriculumAreaId: payload.curriculumAreaId,
        title: payload.title ?? 'Offline lesson plan',
        objectives: payload.objectives ?? null,
        instructions: payload.instructions ?? null,
        scheduledDate: payload.scheduledDate ? new Date(payload.scheduledDate) : null,
        status: payload.status ?? 'DRAFT',
      },
    });
    return { status: 'SYNCED', entityId: lp.id };
  }

  if (operation === 'UPDATE' && entityId) {
    const lp = await prisma.lessonPlan.update({
      where: { id: entityId },
      data: {
        title: payload.title,
        objectives: payload.objectives,
        instructions: payload.instructions,
        status: payload.status,
        scheduledDate: payload.scheduledDate ? new Date(payload.scheduledDate) : undefined,
      },
    });
    return { status: 'SYNCED', entityId: lp.id };
  }

  return { status: 'FAILED', error: 'Invalid operation' };
};

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /sync/push:
 *   post:
 *     summary: Push a batch of offline-queued writes to the server
 *     description: |
 *       Clients send up to 100 queued items per request.
 *       Each item is processed independently — partial success is normal.
 *       Results array maps 1:1 to the input items array by position.
 *       Status values: SYNCED | CONFLICT | FAILED
 *     tags: [Sync]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [clientId, deviceId, entity, operation, payload, clientTs]
 *     responses:
 *       200:
 *         description: Results array with status per item
 */
router.post(
  '/push',
  validate(syncPushSchema),
  async (req, res, next) => {
    try {
      const { items } = req.body;
      const context = { organizationId: req.organizationId, actorId: req.user.sub };

      // Record all items in SyncQueue first
      const queueEntries = await prisma.syncQueue.createMany({
        data: items.map((item) => ({
          organizationId: req.organizationId,
          deviceId: item.deviceId,
          userId: req.user.sub,
          entity: item.entity,
          entityId: item.entityId ?? null,
          operation: item.operation,
          payload: item.payload,
          clientVersion: item.clientVersion ?? 1,
          status: 'PENDING',
          attempts: 1,
          lastAttemptAt: new Date(),
        })),
        skipDuplicates: false,
      });

      // Process each item
      const results = await Promise.all(
        items.map(async (item) => {
          const result = await processSyncItem(item, context);
          return { clientId: item.clientId, ...result };
        })
      );

      // Update sync queue statuses
      const synced   = results.filter((r) => r.status === 'SYNCED').map((r) => r.clientId);
      const conflicts = results.filter((r) => r.status === 'CONFLICT').map((r) => r.clientId);
      const failed   = results.filter((r) => r.status === 'FAILED').map((r) => r.clientId);

      res.json({
        processed: results.length,
        synced: synced.length,
        conflicts: conflicts.length,
        failed: failed.length,
        results,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /sync/pull:
 *   get:
 *     summary: Pull server state changes since a given timestamp
 *     description: |
 *       Returns changed records since `since` timestamp for offline cache hydration.
 *       Used on reconnect to refresh IndexedDB with any server-side changes.
 *     tags: [Sync]
 *     parameters:
 *       - in: query
 *         name: since
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: classroomId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Delta of changed records
 */
router.get(
  '/pull',
  async (req, res, next) => {
    try {
      const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 24 * 3600 * 1000);
      const classroomId = req.query.classroomId;
      const orgId = req.organizationId;

      const [attendance, observations, lessonPlans, students] = await Promise.all([
        prisma.attendanceRecord.findMany({
          where: {
            organizationId: orgId,
            ...(classroomId && { classroomId }),
            updatedAt: { gte: since },
          },
          orderBy: { updatedAt: 'asc' },
          take: 500,
        }),
        prisma.observation.findMany({
          where: {
            organizationId: orgId,
            updatedAt: { gte: since },
            deletedAt: null,
          },
          orderBy: { updatedAt: 'asc' },
          take: 200,
        }),
        prisma.lessonPlan.findMany({
          where: {
            organizationId: orgId,
            ...(classroomId && { classroomId }),
            updatedAt: { gte: since },
            deletedAt: null,
          },
          include: { materials: { include: { material: true } } },
          take: 50,
        }),
        // Today's roster for the classroom
        classroomId ? prisma.enrollment.findMany({
          where: { classroomId, status: 'ACTIVE' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, photoUrl: true, qrCode: true } },
          },
          take: 100,
        }) : Promise.resolve([]),
      ]);

      res.json({
        syncedAt: new Date(),
        since,
        delta: { attendance, observations, lessonPlans, roster: students.map((e) => e.student) },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /sync/conflicts:
 *   get:
 *     summary: List unresolved sync conflicts for manual review
 *     tags: [Sync]
 */
router.get(
  '/conflicts',
  async (req, res, next) => {
    try {
      const conflicts = await prisma.syncLog.findMany({
        where: {
          organizationId: req.organizationId,
          resolution: 'MANUAL',
          resolvedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json(conflicts);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /sync/conflicts/{id}/resolve:
 *   patch:
 *     summary: Manually resolve a sync conflict
 *     tags: [Sync]
 */
router.patch(
  '/conflicts/:id/resolve',
  validate(z.object({
    resolution: z.enum(['SERVER_WINS', 'CLIENT_WINS', 'MANUAL']),
    resolvedPayload: z.record(z.unknown()).optional(),
  })),
  async (req, res, next) => {
    try {
      const conflict = await prisma.syncLog.findFirst({
        where: { id: req.params.id, organizationId: req.organizationId },
      });
      if (!conflict) throw new AppError('NOT_FOUND', 'Conflict not found', 404);
      if (conflict.resolvedAt) throw new AppError('CONFLICT', 'Already resolved', 409);

      const { resolution, resolvedPayload } = req.body;
      const finalPayload = resolution === 'SERVER_WINS'
        ? conflict.serverPayload
        : resolution === 'CLIENT_WINS'
        ? conflict.clientPayload
        : (resolvedPayload ?? conflict.serverPayload);

      await prisma.syncLog.update({
        where: { id: req.params.id },
        data: {
          resolution,
          resolvedPayload: finalPayload,
          resolvedByUserId: req.user.sub,
          resolvedAt: new Date(),
        },
      });

      res.json({ message: 'Conflict resolved', resolution, resolvedPayload: finalPayload });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
