/**
 * @openapi
 * tags:
 *   name: SuperAdmin
 *   description: Platform-level admin endpoints — SUPER_ADMIN only
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requirePermission.js';
import { validate } from '../../middleware/validate.js';
import { paginate, paginatedResponse } from '../../lib/pagination.js';
import { AppError } from '../../middleware/errorHandler.js';
import { writeAuditLog } from '../../middleware/auditLog.js';

const router = Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

// ─── Schemas ─────────────────────────────────────────────────────────────────

const orgCreateSchema = z.object({
  name:     z.string().min(2).max(100),
  slug:     z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers and hyphens only'),
  city:     z.string().optional().nullable(),
  country:  z.string().optional().nullable(),
  email:    z.string().email().optional().nullable(),
  phone:    z.string().optional().nullable(),
  timezone: z.string().default('UTC'),
});

const orgUpdateSchema = orgCreateSchema.partial();

// ─── Platform Stats ───────────────────────────────────────────────────────────

router.get('/stats', async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const [totalOrgs, activeOrgs, totalUsers, totalStudents] = await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null, isActive: true } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.student.count({ 
        where: { 
          deletedAt: null, 
          isActive: true,
          ...(academicYearId && { enrollments: { some: { academicYearId, status: 'ACTIVE' } } })
        } 
      }),
    ]);
    res.json({ totalOrgs, activeOrgs, totalUsers, totalStudents });
  } catch (err) { next(err); }
});

// ─── Chart data ───────────────────────────────────────────────────────────────

router.get('/charts/org-growth', async (req, res, next) => {
  try {
    // Orgs registered per month for last 12 months
    const orgs = await prisma.organization.findMany({
      where: { deletedAt: null, createdAt: { gte: new Date(Date.now() - 365 * 24 * 3600 * 1000) } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthly = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    for (const org of orgs) {
      const d = new Date(org.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthly) monthly[key]++;
    }

    res.json(Object.entries(monthly).map(([month, count]) => ({ month, count })));
  } catch (err) { next(err); }
});

router.get('/charts/users-by-role', async (req, res, next) => {
  try {
    const roleGroups = await prisma.userRole.groupBy({
      by: ['roleId'],
      _count: { userId: true },
    });

    const roles = await prisma.role.findMany({ select: { id: true, name: true, displayName: true } });
    const roleMap = Object.fromEntries(roles.map(r => [r.id, r]));

    const data = roleGroups.map(rg => ({
      role:        roleMap[rg.roleId]?.name ?? 'Unknown',
      displayName: roleMap[rg.roleId]?.displayName ?? 'Unknown',
      count:       rg._count.userId,
    })).sort((a, b) => b.count - a.count);

    res.json(data);
  } catch (err) { next(err); }
});

router.get('/charts/activity', async (req, res, next) => {
  try {
    // Daily observations + attendance for last 30 days
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [observations, attendance] = await Promise.all([
      prisma.observation.groupBy({
        by: ['observedAt'],
        where: { observedAt: { gte: since }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.attendanceRecord.groupBy({
        by: ['date'],
        where: { date: { gte: since }, checkType: 'CHECK_IN' },
        _count: { id: true },
      }),
    ]);

    // Build daily map for last 30 days
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, observations: 0, attendance: 0 };
    }

    for (const o of observations) {
      const key = new Date(o.observedAt).toISOString().slice(0, 10);
      if (days[key]) days[key].observations += o._count.id;
    }
    for (const a of attendance) {
      const key = new Date(a.date).toISOString().slice(0, 10);
      if (days[key]) days[key].attendance += a._count.id;
    }

    res.json(Object.values(days));
  } catch (err) { next(err); }
});

// ─── Organizations CRUD ───────────────────────────────────────────────────────

router.get('/organizations', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 50, search } = req.query;
    const where = {
      deletedAt: null,
      ...(search && { OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]}),
    };
    const [total, orgs] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where, ...paginate(Number(page), Number(pageSize)),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } },
      }),
    ]);
    res.json(paginatedResponse(orgs, total, Number(page), Number(pageSize)));
  } catch (err) { next(err); }
});

router.get('/organizations/:id', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { users: true },
        },
        academicYears: { where: { isCurrent: true }, take: 1 },
      },
    });
    if (!org) throw new AppError('NOT_FOUND', 'Organization not found', 404);

    const studentCount = await prisma.student.count({
      where: { organizationId: org.id, deletedAt: null, isActive: true },
    });

    res.json({
      ...org,
      studentCount,
    });
  } catch (err) { next(err); }
});

router.get('/organizations/:id/users', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search, role, status } = req.query;
    const orgId = req.params.id;

    const where = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'ALL') {
      where.userRoles = { some: { role: { name: role } } };
    }

    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE';
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        ...paginate(Number(page), Number(pageSize)),
        select: {
          id: true, firstName: true, lastName: true, email: true,
          isActive: true, lastLoginAt: true, createdAt: true,
          userRoles: { include: { role: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedUsers = users.map(u => ({
      ...u,
      roles: u.userRoles.map(ur => ur.role.name),
    }));

    res.json(paginatedResponse(formattedUsers, total, Number(page), Number(pageSize)));
  } catch (err) { next(err); }
});

router.post('/organizations', validate(orgCreateSchema), async (req, res, next) => {
  try {
    const existing = await prisma.organization.findUnique({ where: { slug: req.body.slug } });
    if (existing) throw new AppError('CONFLICT', 'Slug already taken', 409);

    const org = await prisma.$transaction(async (tx) => {
      const o = await tx.organization.create({ data: req.body });
      return o;
    });

    await writeAuditLog({
      organizationId: null, actorId: req.user.sub,
      action: 'CREATE', entity: 'Organization', entityId: org.id,
      changes: { after: req.body },
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.status(201).json(org);
  } catch (err) { next(err); }
});

router.patch('/organizations/:id', validate(orgUpdateSchema), async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!org) throw new AppError('NOT_FOUND', 'Organization not found', 404);

    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await writeAuditLog({
      organizationId: org.id, actorId: req.user.sub,
      action: 'UPDATE', entity: 'Organization', entityId: org.id,
      changes: { before: org, after: req.body },
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json(updated);
  } catch (err) { next(err); }
});

router.patch('/organizations/:id/toggle', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!org) throw new AppError('NOT_FOUND', 'Organization not found', 404);

    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { isActive: !org.isActive },
    });

    await writeAuditLog({
      organizationId: org.id, actorId: req.user.sub,
      action: 'UPDATE', entity: 'Organization', entityId: org.id,
      changes: { before: { isActive: org.isActive }, after: { isActive: updated.isActive } },
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/organizations/:id', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!org) throw new AppError('NOT_FOUND', 'Organization not found', 404);

    // Soft delete
    await prisma.organization.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await writeAuditLog({
      organizationId: org.id, actorId: req.user.sub,
      action: 'DELETE', entity: 'Organization', entityId: org.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Organization deleted' });
  } catch (err) { next(err); }
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 30, search, organizationId, role } = req.query;
    const where = {
      deletedAt: null,
      ...(organizationId && { organizationId }),
      ...(role && { userRoles: { some: { role: { name: role } } } }),
      ...(search && { OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ]}),
    };
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, ...paginate(Number(page), Number(pageSize)),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isActive: true, isEmailVerified: true, createdAt: true, lastLoginAt: true,
          organizationId: true,
          organization: { select: { name: true, slug: true } },
          userRoles: { include: { role: { select: { name: true } } } },
        },
      }),
    ]);
    res.json(paginatedResponse(
      users.map(u => ({ ...u, roles: u.userRoles.map(ur => ur.role.name), organizationName: u.organization?.name ?? null })),
      total, Number(page), Number(pageSize)
    ));
  } catch (err) { next(err); }
});

router.patch('/users/:id/toggle', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });

    await writeAuditLog({
      organizationId: user.organizationId, actorId: req.user.sub,
      action: 'UPDATE', entity: 'User', entityId: user.id,
      changes: { before: { isActive: user.isActive }, after: { isActive: updated.isActive } },
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (err) { next(err); }
});

// ─── Audit Log ────────────────────────────────────────────────────────────────

router.get('/audit', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 30, organizationId, action, entity, startDate, endDate } = req.query;
    const where = {
      ...(organizationId && { organizationId }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...(startDate && endDate && {
        createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      }),
    };
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where, ...paginate(Number(page), Number(pageSize)),
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { firstName: true, lastName: true, email: true } },
          organization: { select: { name: true, slug: true } },
        },
      }),
    ]);
    res.json(paginatedResponse(logs, total, Number(page), Number(pageSize)));
  } catch (err) { next(err); }
});

export default router;
