/**
 * @openapi
 * tags:
 *   name: Finance
 *   description: Fee structures, invoices, payments, expenses and ledger
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema } from '../../lib/pagination.js';
import {
  feeStructureSchema,
  invoiceCreateSchema,
  paymentCreateSchema,
  expenseSchema,
} from '../../lib/validation/finance.schema.js';
import * as financeService from './finance.service.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Fee Structures ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /finance/fee-structures:
 *   get:
 *     summary: List all fee structures
 *     tags: [Finance]
 */
router.get('/fee-structures', requirePermission('finance:read'), async (req, res, next) => {
  try {
    res.json(await financeService.listFeeStructures(req.organizationId));
  } catch (err) { next(err); }
});

router.post('/fee-structures', requirePermission('finance:write'), validate(feeStructureSchema), async (req, res, next) => {
  try {
    res.status(201).json(await financeService.createFeeStructure(req.organizationId, req.body));
  } catch (err) { next(err); }
});

router.patch('/fee-structures/:id', requirePermission('finance:write'), validate(feeStructureSchema.partial()), async (req, res, next) => {
  try {
    res.json(await financeService.updateFeeStructure(req.params.id, req.organizationId, req.body, req.user.sub));
  } catch (err) { next(err); }
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

const invoiceListQuery = paginationSchema.extend({
  status:      z.string().optional(),
  studentId:   z.string().uuid().optional(),
  overdueOnly: z.coerce.boolean().optional(),
});

/**
 * @openapi
 * /finance/invoices:
 *   get:
 *     summary: List invoices (filterable by status, student, overdue)
 *     tags: [Finance]
 */
router.get(
  '/invoices',
  requirePermission('finance:read'),
  validateQuery(invoiceListQuery),
  async (req, res, next) => {
    try {
      res.json(await financeService.listInvoices({ organizationId: req.organizationId, ...req.query }));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /finance/invoices/{id}:
 *   get:
 *     summary: Get invoice detail with line items and payment history
 *     tags: [Finance]
 */
router.get('/invoices/:id', requirePermission('finance:read'), async (req, res, next) => {
  try {
    res.json(await financeService.getInvoiceById(req.params.id, req.organizationId));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /finance/invoices:
 *   post:
 *     summary: Create and issue an invoice
 *     tags: [Finance]
 */
router.post(
  '/invoices',
  requirePermission('finance:write'),
  validate(invoiceCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await financeService.createInvoice(req.organizationId, req.body, req.user.sub));
    } catch (err) { next(err); }
  }
);

// ─── Payments ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /finance/payments:
 *   post:
 *     summary: Record a payment against an invoice
 *     tags: [Finance]
 */
router.post(
  '/payments',
  requirePermission('finance:write'),
  validate(paymentCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await financeService.recordPayment(req.organizationId, req.body, req.user.sub));
    } catch (err) { next(err); }
  }
);

// ─── Expenses ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /finance/expenses:
 *   get:
 *     summary: List expenses
 *     tags: [Finance]
 */
router.get(
  '/expenses',
  requirePermission('finance:read'),
  validateQuery(paginationSchema.extend({
    category: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })),
  async (req, res, next) => {
    try {
      res.json(await financeService.listExpenses({ organizationId: req.organizationId, ...req.query }));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /finance/expenses:
 *   post:
 *     summary: Record an expense
 *     tags: [Finance]
 */
router.post('/expenses', requirePermission('finance:write'), validate(expenseSchema), async (req, res, next) => {
  try {
    res.status(201).json(await financeService.createExpense(req.organizationId, req.body, req.user.sub));
  } catch (err) { next(err); }
});

// ─── Dashboard summary ────────────────────────────────────────────────────────

/**
 * @openapi
 * /finance/summary:
 *   get:
 *     summary: Finance dashboard KPIs (outstanding, collected this month, expenses, net)
 *     tags: [Finance]
 */
router.get('/summary', requirePermission('finance:read'), async (req, res, next) => {
  try {
    res.json(await financeService.getFinanceSummary(req.organizationId));
  } catch (err) { next(err); }
});

// ─── Ledger ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /finance/ledger:
 *   get:
 *     summary: General ledger entries
 *     tags: [Finance]
 */
router.get('/ledger', requirePermission('finance:read'), validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const [total, entries] = await Promise.all([
      prisma.ledger.count({ where: { organizationId: req.organizationId } }),
      prisma.ledger.findMany({
        where: { organizationId: req.organizationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ data: entries, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) { next(err); }
});

export default router;
