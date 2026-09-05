/**
 * @openapi
 * tags:
 *   name: HR
 *   description: Staff records, payroll, leave requests and timesheets
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import argon2 from 'argon2';
import crypto from 'crypto';
import { sendEmail } from '../../lib/email.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema, paginate, paginatedResponse } from '../../lib/pagination.js';
import {
  staffCreateSchema,
  leaveRequestSchema,
  leaveApprovalSchema,
  payrollSchema,
  timesheetSchema,
} from '../../lib/validation/hr.schema.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';
import { writeAuditLog } from '../../middleware/auditLog.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Staff ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /hr/staff:
 *   get:
 *     summary: List all staff members
 *     tags: [HR]
 */
router.get(
  '/staff',
  requirePermission('hr:read'),
  validateQuery(paginationSchema.extend({ branchId: z.string().uuid().optional(), isActive: z.coerce.boolean().optional() })),
  async (req, res, next) => {
    try {
      const { page, pageSize, isActive, search } = req.query;
      const where = {
        organizationId: req.organizationId,
        deletedAt: null,
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName:  { contains: search, mode: 'insensitive' } } },
            { employeeNumber: { contains: search, mode: 'insensitive' } },
            { jobTitle: { contains: search, mode: 'insensitive' } },
          ],
        }),
        user: {
          userRoles: {
            some: {
              role: { name: { notIn: ['SUPER_ADMIN', 'STUDENT', 'PARENT'] } }
            }
          }
        }
      };

      const [total, staff] = await Promise.all([
        prisma.staff.count({ where }),
        prisma.staff.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { user: { lastName: 'asc' } },
          include: {
            user: { 
              select: { 
                id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true,
                userRoles: { include: { role: true } }
              } 
            },
          },
        }),
      ]);

      res.json(paginatedResponse(staff, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /hr/staff/{id}:
 *   get:
 *     summary: Get a staff member profile
 *     tags: [HR]
 */
router.get('/staff/:id', requirePermission('hr:read'), async (req, res, next) => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        user: true,
        classrooms: { include: { classroom: { select: { id: true, name: true } } } },
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
        payrolls: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
      },
    });
    if (!staff) throw new AppError('NOT_FOUND', 'Staff member not found', 404);
    assertTenantOwnership(staff.organizationId, req.organizationId);
    res.json(staff);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /hr/staff:
 *   post:
 *     summary: Create a staff record
 *     tags: [HR]
 */
router.post('/staff', requirePermission('hr:write'), validate(staffCreateSchema), async (req, res, next) => {
  try {
    let { firstName, lastName, email, phone, role, ...staffData } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new AppError('CONFLICT', 'Email already in use', 409);

    const existingStaff = await prisma.staff.findFirst({
      where: { organizationId: req.organizationId, employeeNumber: staffData.employeeNumber, deletedAt: null },
    });
    if (existingStaff) throw new AppError('CONFLICT', 'Employee number already in use', 409);

    const password = crypto.randomBytes(8).toString('hex');
    const passwordHash = await argon2.hash(password);

    const staff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          passwordHash,
          role,
          isActive: true,
        },
      });

      return await tx.staff.create({
        data: {
          organizationId: req.organizationId,
          userId: user.id,
          ...staffData,
        },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
    });

    try {
      const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
      await sendEmail({
        to: email,
        subject: `Welcome to ${org?.name || 'Montessori ERP'}`,
        templateName: 'staff-welcome',
        context: {
          firstName,
          loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000/login',
          organizationName: org?.name || 'Montessori ERP',
          email,
          password,
        }
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    res.status(201).json(staff);
  } catch (err) { next(err); }
});

router.patch('/staff/:id', requirePermission('hr:write'), validate(staffCreateSchema.partial()), async (req, res, next) => {
  try {
    const updated = await prisma.staff.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

// ─── Leave Requests ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /hr/leave-requests:
 *   get:
 *     summary: List leave requests
 *     tags: [HR]
 */
router.get(
  '/leave-requests',
  requirePermission('hr:read'),
  validateQuery(paginationSchema.extend({
    status:  z.string().optional(),
    staffId: z.string().uuid().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, status, staffId } = req.query;
      const where = {
        organizationId: req.organizationId,
        ...(status && { status }),
        ...(staffId && { staffId }),
      };
      const [total, requests] = await Promise.all([
        prisma.leaveRequest.count({ where }),
        prisma.leaveRequest.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { createdAt: 'desc' },
          include: {
            staff: {
              include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            },
          },
        }),
      ]);
      res.json(paginatedResponse(requests, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /hr/leave-requests:
 *   post:
 *     summary: Submit a leave request
 *     tags: [HR]
 */
router.post('/leave-requests', requirePermission('hr:write'), validate(leaveRequestSchema), async (req, res, next) => {
  try {
    // Find the staff record for the current user
    const staff = await prisma.staff.findFirst({
      where: { userId: req.user.sub, organizationId: req.organizationId },
    });
    if (!staff) throw new AppError('NOT_FOUND', 'Staff record not found for current user', 404);

    const { startDate, endDate, leaveType, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const request = await prisma.leaveRequest.create({
      data: {
        organizationId: req.organizationId,
        staffId: staff.id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason: reason ?? null,
        status: 'PENDING',
      },
    });
    res.status(201).json(request);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /hr/leave-requests/{id}/decision:
 *   patch:
 *     summary: Approve or reject a leave request
 *     tags: [HR]
 */
router.patch(
  '/leave-requests/:id/decision',
  requirePermission('hr:write'),
  validate(leaveApprovalSchema),
  async (req, res, next) => {
    try {
      const lr = await prisma.leaveRequest.findFirst({ where: { id: req.params.id } });
      if (!lr) throw new AppError('NOT_FOUND', 'Leave request not found', 404);
      assertTenantOwnership(lr.organizationId, req.organizationId);

      if (lr.status !== 'PENDING') {
        throw new AppError('CONFLICT', `Leave request is already ${lr.status.toLowerCase()}`, 409);
      }

      const updated = await prisma.leaveRequest.update({
        where: { id: req.params.id },
        data: {
          status: req.body.status,
          approvedByUserId: req.user.sub,
          approvedAt: req.body.status === 'APPROVED' ? new Date() : null,
          rejectionReason: req.body.rejectionReason ?? null,
        },
      });

      await writeAuditLog({
        organizationId: req.organizationId,
        actorId: req.user.sub,
        action: 'UPDATE',
        entity: 'LeaveRequest',
        entityId: lr.id,
        changes: { before: { status: 'PENDING' }, after: { status: req.body.status } },
      });

      res.json(updated);
    } catch (err) { next(err); }
  }
);

// ─── Payroll ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /hr/payroll:
 *   get:
 *     summary: List payroll records
 *     tags: [HR]
 */
router.get(
  '/payroll',
  requirePermission('hr:read'),
  validateQuery(paginationSchema.extend({
    staffId: z.string().uuid().optional(),
    year:    z.coerce.number().optional(),
    month:   z.coerce.number().optional(),
    status:  z.string().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, staffId, year, month, status } = req.query;
      const where = {
        organizationId: req.organizationId,
        ...(staffId && { staffId }),
        ...(year && { year }),
        ...(month && { month }),
        ...(status && { status }),
      };
      const [total, payrolls] = await Promise.all([
        prisma.payroll.count({ where }),
        prisma.payroll.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          include: {
            staff: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        }),
      ]);
      res.json(paginatedResponse(payrolls, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /hr/payroll:
 *   post:
 *     summary: Process payroll for a staff member
 *     tags: [HR]
 */
router.post('/payroll', requirePermission('hr:write'), validate(payrollSchema), async (req, res, next) => {
  try {
    const { staffId, month, year, baseSalary, allowances, deductions, currency, notes } = req.body;
    const netPay = baseSalary + allowances - deductions;

    const payroll = await prisma.payroll.upsert({
      where: { staffId_year_month: { staffId, year, month } },
      update: { baseSalary, allowances, deductions, netPay, currency, notes, status: 'PROCESSED', processedAt: new Date() },
      create: {
        organizationId: req.organizationId,
        staffId, month, year, baseSalary, allowances, deductions, netPay, currency,
        notes: notes ?? null, status: 'PROCESSED', processedAt: new Date(),
      },
    });

    await writeAuditLog({
      organizationId: req.organizationId,
      actorId: req.user.sub,
      action: 'CREATE',
      entity: 'Payroll',
      entityId: payroll.id,
      changes: { after: { staffId, month, year, netPay } },
    });

    res.status(201).json(payroll);
  } catch (err) { next(err); }
});

// ─── Timesheets ───────────────────────────────────────────────────────────────

/**
 * @openapi
 * /hr/timesheets:
 *   post:
 *     summary: Submit a timesheet for a week
 *     tags: [HR]
 */
router.post('/timesheets', requirePermission('hr:write'), validate(timesheetSchema), async (req, res, next) => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { userId: req.user.sub, organizationId: req.organizationId },
    });
    if (!staff) throw new AppError('NOT_FOUND', 'Staff record not found', 404);

    const totalHours = req.body.entries.reduce((sum, e) => sum + e.hours, 0);

    const ts = await prisma.timesheet.upsert({
      where: { staffId_weekStartDate: { staffId: staff.id, weekStartDate: new Date(req.body.weekStartDate) } },
      update: { entries: req.body.entries, totalHours, status: 'SUBMITTED', submittedAt: new Date() },
      create: {
        organizationId: req.organizationId,
        staffId: staff.id,
        weekStartDate: new Date(req.body.weekStartDate),
        entries: req.body.entries,
        totalHours,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.status(201).json(ts);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /hr/staff-attendance:
 *   post:
 *     summary: Record staff attendance
 *     tags: [HR]
 */
router.post('/staff-attendance', requirePermission('hr:write'), async (req, res, next) => {
  try {
    const { staffId, date, status, checkInAt, checkOutAt, notes } = req.body;
    const rec = await prisma.staffAttendance.upsert({
      where: { staffId_date: { staffId, date: new Date(date) } },
      update: { status, checkInAt: checkInAt ? new Date(checkInAt) : null, checkOutAt: checkOutAt ? new Date(checkOutAt) : null, notes },
      create: {
        organizationId: req.organizationId,
        staffId, date: new Date(date), status: status ?? 'PRESENT',
        checkInAt: checkInAt ? new Date(checkInAt) : null,
        checkOutAt: checkOutAt ? new Date(checkOutAt) : null,
        notes: notes ?? null,
      },
    });
    res.status(201).json(rec);
  } catch (err) { next(err); }
});

export default router;
