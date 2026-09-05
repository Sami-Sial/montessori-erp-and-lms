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

// Send reminder notification to parent for an overdue invoice
router.post('/invoices/:id/remind', requirePermission('finance:write'), async (req, res, next) => {
  try {
    const invoice = await financeService.getInvoiceById(req.params.id, req.organizationId);
    // Create an in-app notification for all guardians of the student
    const guardians = await prisma.studentGuardian.findMany({
      where: { studentId: invoice.studentId },
      include: { guardian: { select: { id: true } } },
    });
    if (guardians.length > 0) {
      await prisma.notification.createMany({
        data: guardians.map(g => ({
          organizationId: req.organizationId,
          userId: g.guardian.id,
          type: 'FINANCE_ALERT',
          title: 'Payment Reminder',
          body: `Invoice ${invoice.invoiceNumber} for $${Number(invoice.totalAmount).toFixed(2)} is overdue. Please log in to make a payment.`,
          data: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
        })),
        skipDuplicates: true,
      });
    }
    res.json({ success: true, notified: guardians.length });
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
  '/invoices/batch',
  requirePermission('finance:write'),
  validate(z.object({
    classroomId: z.string().uuid().optional().nullable(),
    feeStructureId: z.string().uuid(),
    dueDate: z.coerce.date(),
  })),
  async (req, res, next) => {
    try {
      res.status(201).json(await financeService.createBatchInvoices(req.organizationId, req.body, req.user.sub));
    } catch (err) { next(err); }
  }
);

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

router.get(
  '/payments',
  requirePermission('finance:read'),
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      res.json(await financeService.listPayments({ organizationId: req.organizationId, ...req.query }));
    } catch (err) { next(err); }
  }
);

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
    const { academicYearId } = req.query;
    res.json(await financeService.getFinanceSummary({
      organizationId: req.organizationId,
      academicYearId
    }));
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /finance/analytics:
 *   get:
 *     summary: Finance analytics for charts
 *     tags: [Finance]
 */
router.get('/analytics', requirePermission('finance:read'), async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    res.json(await financeService.getFinanceAnalytics({
      organizationId: req.organizationId,
      academicYearId
    }));
  } catch (err) { next(err); }
});

// ─── Stripe Checkout ──────────────────────────────────────────────────────────

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});

/**
 * @openapi
 * /finance/invoices/{id}/checkout:
 *   post:
 *     summary: Create a Stripe Checkout session for an invoice
 *     tags: [Finance]
 */
router.post('/invoices/:id/checkout', authenticate, scopeTenant, async (req, res, next) => {
  try {
    const invoice = await financeService.getInvoiceById(req.params.id, req.organizationId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    if (outstanding <= 0) return res.status(400).json({ error: 'Invoice is already paid' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: invoice.currency?.toLowerCase() || 'usd',
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment for ${invoice.student?.firstName ?? ''} ${invoice.student?.lastName ?? ''}`.trim(),
            },
            unit_amount: Math.round(outstanding * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        organizationId: req.organizationId,
      },
      success_url: `${frontendUrl}/parent/billing?status=success&invoice=${invoice.invoiceNumber}`,
      cancel_url: `${frontendUrl}/parent/billing?status=cancelled`,
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    next(err);
  }
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
