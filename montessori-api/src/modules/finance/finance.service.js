import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';
import { paginate, paginatedResponse } from '../../lib/pagination.js';
import { writeAuditLog } from '../../middleware/auditLog.js';

// ─── Invoice number generator ─────────────────────────────────────────────────

const generateInvoiceNumber = async (organizationId) => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { organizationId },
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// ─── Fee Structures ───────────────────────────────────────────────────────────

export const listFeeStructures = async (organizationId) => {
  return prisma.feeStructure.findMany({
    where: { organizationId, deletedAt: null, isActive: true },
    orderBy: { name: 'asc' },
  });
};

export const createFeeStructure = async (organizationId, data) => {
  return prisma.feeStructure.create({
    data: { organizationId, ...data },
  });
};

export const updateFeeStructure = async (id, organizationId, data, actorId) => {
  const existing = await prisma.feeStructure.findFirst({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Fee structure not found', 404);
  assertTenantOwnership(existing.organizationId, organizationId);

  const updated = await prisma.feeStructure.update({ where: { id }, data });

  await writeAuditLog({
    organizationId, actorId, action: 'UPDATE',
    entity: 'FeeStructure', entityId: id,
    changes: { before: existing, after: data },
  });

  return updated;
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const listInvoices = async ({ organizationId, page, pageSize, status, studentId, overdueOnly }) => {
  const now = new Date();
  const where = {
    organizationId,
    deletedAt: null,
    ...(status && { status }),
    ...(studentId && { studentId }),
    ...(overdueOnly && {
      status: { in: ['SENT', 'PARTIALLY_PAID'] },
      dueDate: { lt: now },
    }),
  };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      ...paginate(page, pageSize),
      orderBy: { dueDate: 'asc' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
        lineItems: true,
        payments: { where: { status: 'COMPLETED' }, select: { amount: true, paidAt: true } },
      },
    }),
  ]);

  // Auto-flag overdue invoices
  const processed = invoices.map((inv) => ({
    ...inv,
    isOverdue: ['SENT', 'PARTIALLY_PAID'].includes(inv.status) && new Date(inv.dueDate) < now,
    outstandingAmount: Number(inv.totalAmount) - Number(inv.paidAmount),
  }));

  return paginatedResponse(processed, total, page, pageSize);
};

export const getInvoiceById = async (id, organizationId) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: {
        include: {
          guardians: {
            where: { isPrimary: true },
            include: { guardian: { select: { firstName: true, lastName: true, email: true, phone: true } } },
            take: 1,
          },
        },
      },
      lineItems: true,
      payments: {
        orderBy: { createdAt: 'asc' },
        include: { paymentMethod: { select: { name: true, type: true } } },
      },
    },
  });
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found', 404);
  assertTenantOwnership(invoice.organizationId, organizationId);
  return {
    ...invoice,
    outstandingAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
    isOverdue: ['SENT', 'PARTIALLY_PAID'].includes(invoice.status) && new Date(invoice.dueDate) < new Date(),
  };
};

export const createInvoice = async (organizationId, { studentId, dueDate, currency, notes, lineItems }, actorId) => {
  const invoiceNumber = await generateInvoiceNumber(organizationId);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        organizationId,
        studentId,
        invoiceNumber,
        dueDate,
        currency,
        totalAmount,
        paidAmount: 0,
        notes,
        status: 'SENT',
      },
    });

    await tx.invoiceLineItem.createMany({
      data: lineItems.map((item) => ({
        invoiceId: inv.id,
        feeStructureId: item.feeStructureId ?? null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
    });

    // Write ledger debit entry
    const lastLedger = await tx.ledger.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: { runningBalance: true },
    });
    const prevBalance = Number(lastLedger?.runningBalance ?? 0);
    await tx.ledger.create({
      data: {
        organizationId,
        type: 'DEBIT',
        amount: totalAmount,
        currency,
        description: `Invoice ${invoiceNumber} issued`,
        referenceType: 'Invoice',
        referenceId: inv.id,
        runningBalance: prevBalance + totalAmount,
      },
    });

    return inv;
  });

  await writeAuditLog({
    organizationId, actorId, action: 'CREATE',
    entity: 'Invoice', entityId: invoice.id,
    changes: { after: { invoiceNumber, totalAmount, studentId } },
  });

  return invoice;
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const recordPayment = async (organizationId, data, actorId) => {
  const { invoiceId, amount, currency, paymentMethodId, referenceNumber, notes, paidAt } = data;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
  });
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found', 404);
  assertTenantOwnership(invoice.organizationId, organizationId);

  if (['PAID', 'CANCELLED', 'REFUNDED'].includes(invoice.status)) {
    throw new AppError('CONFLICT', `Invoice is already ${invoice.status.toLowerCase()}`, 409);
  }

  const payment = await prisma.$transaction(async (tx) => {
    const pmt = await tx.payment.create({
      data: {
        organizationId,
        invoiceId,
        amount,
        currency,
        paymentMethodId: paymentMethodId ?? null,
        referenceNumber: referenceNumber ?? null,
        notes: notes ?? null,
        paidAt: paidAt ?? new Date(),
        status: 'COMPLETED',
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + amount;
    const newStatus =
      newPaidAmount >= Number(invoice.totalAmount)
        ? 'PAID'
        : newPaidAmount > 0
        ? 'PARTIALLY_PAID'
        : 'SENT';

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });

    // Write ledger credit entry
    const lastLedger = await tx.ledger.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: { runningBalance: true },
    });
    const prevBalance = Number(lastLedger?.runningBalance ?? 0);
    await tx.ledger.create({
      data: {
        organizationId,
        type: 'CREDIT',
        amount,
        currency,
        description: `Payment for invoice ${invoice.invoiceNumber}`,
        referenceType: 'Payment',
        referenceId: pmt.id,
        runningBalance: prevBalance - amount,
      },
    });

    return pmt;
  });

  await writeAuditLog({
    organizationId, actorId, action: 'PAYMENT_EDIT',
    entity: 'Payment', entityId: payment.id,
    changes: { after: { invoiceId, amount } },
  });

  return payment;
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const listExpenses = async ({ organizationId, page, pageSize, category, startDate, endDate }) => {
  const where = {
    organizationId,
    deletedAt: null,
    ...(category && { category }),
    ...(startDate && endDate && {
      expenseDate: { gte: new Date(startDate), lte: new Date(endDate) },
    }),
  };

  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      ...paginate(page, pageSize),
      orderBy: { expenseDate: 'desc' },
    }),
  ]);

  return paginatedResponse(expenses, total, page, pageSize);
};

export const createExpense = async (organizationId, data, actorId) => {
  const expense = await prisma.expense.create({
    data: { organizationId, approvedByUserId: actorId, ...data },
  });

  // Write ledger debit
  const lastLedger = await prisma.ledger.findFirst({
    where: { organizationId }, orderBy: { createdAt: 'desc' }, select: { runningBalance: true },
  });
  await prisma.ledger.create({
    data: {
      organizationId,
      type: 'DEBIT',
      amount: data.amount,
      currency: data.currency ?? 'USD',
      description: `Expense: ${data.description}`,
      referenceType: 'Expense',
      referenceId: expense.id,
      runningBalance: Number(lastLedger?.runningBalance ?? 0) + data.amount,
    },
  });

  return expense;
};

// ─── Dashboard summary ────────────────────────────────────────────────────────

export const getFinanceSummary = async (organizationId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    totalOutstanding,
    overdueCount,
    collectedThisMonth,
    expensesThisMonth,
  ] = await Promise.all([
    // Total outstanding
    prisma.invoice.aggregate({
      where: { organizationId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] }, deletedAt: null },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    // Overdue count
    prisma.invoice.count({
      where: { organizationId, status: { in: ['SENT', 'PARTIALLY_PAID'] }, dueDate: { lt: now }, deletedAt: null },
    }),
    // Collected this month
    prisma.payment.aggregate({
      where: { organizationId, status: 'COMPLETED', paidAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    // Expenses this month
    prisma.expense.aggregate({
      where: { organizationId, expenseDate: { gte: startOfMonth, lte: endOfMonth }, deletedAt: null },
      _sum: { amount: true },
    }),
  ]);

  const totalOut = Number(totalOutstanding._sum.totalAmount ?? 0) - Number(totalOutstanding._sum.paidAmount ?? 0);
  const collected = Number(collectedThisMonth._sum.amount ?? 0);
  const expenses = Number(expensesThisMonth._sum.amount ?? 0);

  return {
    totalOutstanding: totalOut,
    overdueCount,
    collectedThisMonth: collected,
    expensesThisMonth: expenses,
    netThisMonth: collected - expenses,
  };
};
