/**
 * @openapi
 * tags:
 *   name: Gamification
 *   description: Badges, points, streaks and class-scoped leaderboards
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const badgeSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  iconUrl:     z.string().url().optional().nullable(),
  colorHex:    z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  points:      z.coerce.number().int().min(0).default(10),
  isActive:    z.boolean().default(true),
});

const awardBadgeSchema = z.object({
  studentId:   z.string().uuid(),
  badgeId:     z.string().uuid(),
  milestoneId: z.string().uuid().optional().nullable(),
  note:        z.string().optional().nullable(),
});

// ─── Badges ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /gamification/badges:
 *   get:
 *     summary: List all badges in the organisation
 *     tags: [Gamification]
 */
router.get('/badges', requirePermission('gamification:read'), async (req, res, next) => {
  try {
    const badges = await prisma.badge.findMany({
      where: { organizationId: req.organizationId, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { studentBadges: true } },
      },
    });
    res.json(badges);
  } catch (err) { next(err); }
});

router.post('/badges', requirePermission('gamification:award'), validate(badgeSchema), async (req, res, next) => {
  try {
    const badge = await prisma.badge.create({ data: { organizationId: req.organizationId, ...req.body } });
    res.status(201).json(badge);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /gamification/badges/award:
 *   post:
 *     summary: Award a badge to a student
 *     tags: [Gamification]
 */
router.post('/badges/award', requirePermission('gamification:award'), validate(awardBadgeSchema), async (req, res, next) => {
  try {
    const { studentId, badgeId, milestoneId, note } = req.body;

    // Verify badge belongs to this org
    const badge = await prisma.badge.findFirst({ where: { id: badgeId, organizationId: req.organizationId } });
    if (!badge) throw new AppError('NOT_FOUND', 'Badge not found', 404);

    const studentBadge = await prisma.$transaction(async (tx) => {
      const sb = await tx.studentBadge.upsert({
        where: { studentId_badgeId: { studentId, badgeId } },
        update: {},
        create: {
          studentId,
          badgeId,
          milestoneId: milestoneId ?? null,
          awardedByUserId: req.user.sub,
          note: note ?? null,
        },
      });

      // Add points to ledger
      await tx.pointsLedger.create({
        data: {
          studentId,
          points: badge.points,
          reason: `Badge awarded: ${badge.name}`,
          referenceType: 'Badge',
          referenceId: badgeId,
        },
      });

      // Update streak
      await tx.streak.upsert({
        where: { studentId_type: { studentId, type: 'OBSERVATION_STREAK' } },
        update: {
          currentStreak: { increment: 1 },
          lastActivityDate: new Date(),
        },
        create: {
          studentId,
          type: 'OBSERVATION_STREAK',
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date(),
        },
      });

      // Create notification for student/guardian
      await tx.notification.create({
        data: {
          organizationId: req.organizationId,
          userId: studentId, // if student has user account
          type: 'BADGE',
          title: `🏅 New badge earned: ${badge.name}`,
          body: note ?? badge.description ?? `You earned the ${badge.name} badge!`,
          data: { badgeId, badgeName: badge.name, points: badge.points },
        },
      }).catch(() => null); // Non-fatal if student has no user account

      return sb;
    });

    res.status(201).json({ studentBadge, badge });
  } catch (err) { next(err); }
});

// ─── Student badges & points ──────────────────────────────────────────────────

/**
 * @openapi
 * /gamification/students/{studentId}/badges:
 *   get:
 *     summary: Get all badges earned by a student
 *     tags: [Gamification]
 */
router.get('/students/:studentId/badges', requirePermission('gamification:read'), async (req, res, next) => {
  try {
    const badges = await prisma.studentBadge.findMany({
      where: { studentId: req.params.studentId },
      include: {
        badge: true,
        milestone: { select: { id: true, title: true } },
      },
      orderBy: { awardedAt: 'desc' },
    });
    res.json(badges);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /gamification/students/{studentId}/points:
 *   get:
 *     summary: Get points ledger and total points for a student
 *     tags: [Gamification]
 */
router.get('/students/:studentId/points', requirePermission('gamification:read'), async (req, res, next) => {
  try {
    const [ledger, totals] = await Promise.all([
      prisma.pointsLedger.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.pointsLedger.aggregate({
        where: { studentId: req.params.studentId },
        _sum: { points: true },
      }),
    ]);
    res.json({ totalPoints: totals._sum.points ?? 0, ledger });
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /gamification/students/{studentId}/streaks:
 *   get:
 *     summary: Get streaks for a student
 *     tags: [Gamification]
 */
router.get('/students/:studentId/streaks', requirePermission('gamification:read'), async (req, res, next) => {
  try {
    const streaks = await prisma.streak.findMany({ where: { studentId: req.params.studentId } });
    res.json(streaks);
  } catch (err) { next(err); }
});

// ─── Class-scoped Leaderboard ─────────────────────────────────────────────────

/**
 * @openapi
 * /gamification/classrooms/{classroomId}/leaderboard:
 *   get:
 *     summary: Class-scoped leaderboard (WEEKLY, MONTHLY or TERM)
 *     description: Always class-scoped — never school-wide competitive rankings.
 *     tags: [Gamification]
 */
router.get(
  '/classrooms/:classroomId/leaderboard',
  requirePermission('gamification:read'),
  async (req, res, next) => {
    try {
      const { period = 'WEEKLY', periodKey } = req.query;

      // Derive current period key if not supplied
      const now = new Date();
      let key = periodKey;
      if (!key) {
        if (period === 'WEEKLY') {
          const weekNum = Math.ceil(now.getDate() / 7);
          key = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        } else if (period === 'MONTHLY') {
          key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = `${now.getFullYear()}-T1`;
        }
      }

      const leaderboard = await prisma.leaderboard.findFirst({
        where: {
          classroomId: req.params.classroomId,
          period,
          periodKey: key,
        },
        include: {
          entries: {
            orderBy: { points: 'desc' },
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true, photoUrl: true },
              },
            },
          },
        },
      });

      if (!leaderboard) {
        return res.json({ period, periodKey: key, entries: [], message: 'No leaderboard data for this period yet' });
      }

      // Add rank
      const ranked = leaderboard.entries.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));

      res.json({ ...leaderboard, entries: ranked });
    } catch (err) { next(err); }
  }
);

export default router;
