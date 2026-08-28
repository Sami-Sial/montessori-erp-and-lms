import { z } from 'zod';

export const inventoryItemSchema = z.object({
  categoryId:    z.string().uuid().optional().nullable(),
  supplierId:    z.string().uuid().optional().nullable(),
  materialId:    z.string().uuid().optional().nullable(),
  branchId:      z.string().uuid().optional().nullable(),
  name:          z.string().min(1).max(200),
  description:   z.string().optional().nullable(),
  sku:           z.string().optional().nullable(),
  unit:          z.string().default('unit'),
  currentStock:  z.coerce.number().int().min(0).default(0),
  minimumStock:  z.coerce.number().int().min(0).default(5),
  reorderPoint:  z.coerce.number().int().min(0).default(10),
  unitCost:      z.coerce.number().positive().optional().nullable(),
  location:      z.string().optional().nullable(),
  inClassroomUse:z.boolean().default(false),
  replacementDue:z.coerce.date().optional().nullable(),
  imageUrl:      z.string().url().optional().nullable(),
});

export const stockMovementSchema = z.object({
  inventoryItemId: z.string().uuid(),
  type:     z.enum(['PURCHASE','USAGE','RETURN','ADJUSTMENT','DISPOSAL']),
  quantity: z.coerce.number().int().refine(n => n !== 0, 'Quantity cannot be zero'),
  notes:    z.string().optional().nullable(),
  referenceType: z.string().optional().nullable(),
  referenceId:   z.string().optional().nullable(),
});

export const purchaseOrderSchema = z.object({
  supplierId:    z.string().uuid(),
  branchId:      z.string().uuid().optional().nullable(),
  orderDate:     z.coerce.date().optional().nullable(),
  expectedDate:  z.coerce.date().optional().nullable(),
  notes:         z.string().optional().nullable(),
  lines: z.array(z.object({
    inventoryItemId: z.string().uuid(),
    quantity:        z.coerce.number().int().positive(),
    unitCost:        z.coerce.number().positive(),
  })).min(1),
});
