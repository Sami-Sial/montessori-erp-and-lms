/**
 * Finance validation schemas — mirror of montessori-api/src/lib/validation/finance.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const feeStructureSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  amount:      z.coerce.number().positive(),
  currency:    z.string().length(3).default('USD'),
  frequency:   z.enum(['MONTHLY', 'TERMLY', 'ANNUALLY', 'ONE_TIME']),
  isActive:    z.boolean().default(true),
});

export const invoiceCreateSchema = z.object({
  studentId: z.string().uuid(),
  dueDate:   z.coerce.date(),
  currency:  z.string().length(3).default('USD'),
  notes:     z.string().optional().nullable(),
  lineItems: z.array(z.object({
    feeStructureId: z.string().uuid().optional().nullable(),
    description:    z.string().min(1),
    quantity:       z.coerce.number().int().min(1).default(1),
    unitPrice:      z.coerce.number().positive(),
  })).min(1),
});

export const paymentCreateSchema = z.object({
  invoiceId:       z.string().uuid(),
  amount:          z.coerce.number().positive(),
  currency:        z.string().length(3).default('USD'),
  paymentMethodId: z.string().uuid().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  notes:           z.string().optional().nullable(),
  paidAt:          z.coerce.date().optional(),
});

export const expenseSchema = z.object({
  branchId:    z.string().uuid().optional().nullable(),
  category:    z.enum(['SALARY','UTILITIES','SUPPLIES','MAINTENANCE','MARKETING','RENT','INSURANCE','TRANSPORT','OTHER']),
  description: z.string().min(1).max(255),
  amount:      z.coerce.number().positive(),
  currency:    z.string().length(3).default('USD'),
  expenseDate: z.coerce.date(),
  receiptUrl:  z.string().url().optional().nullable(),
});
