/**
 * Inventory validation schemas — mirror of montessori-api/src/lib/validation/inventory.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const inventoryItemSchema = z.object({
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
  categoryId:    z.string().uuid().optional().nullable(),
  supplierId:    z.string().uuid().optional().nullable(),
  materialId:    z.string().uuid().optional().nullable(),
});

export const stockMovementSchema = z.object({
  inventoryItemId: z.string().uuid(),
  type:     z.enum(['PURCHASE','USAGE','RETURN','ADJUSTMENT','DISPOSAL']),
  quantity: z.coerce.number().int().refine((n) => n !== 0, 'Quantity cannot be zero'),
  notes:    z.string().optional().nullable(),
});
