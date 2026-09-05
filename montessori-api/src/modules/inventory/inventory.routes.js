/**
 * @openapi
 * tags:
 *   name: Inventory
 *   description: Inventory items, stock movements, purchase orders and low-stock alerts
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema, paginate, paginatedResponse } from '../../lib/pagination.js';
import {
  inventoryItemSchema,
  stockMovementSchema,
  purchaseOrderSchema,
} from '../../lib/validation/inventory.schema.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Inventory Items ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /inventory/items:
 *   get:
 *     summary: List inventory items (with low-stock flag)
 *     tags: [Inventory]
 */
router.get(
  '/items',
  requirePermission('inventory:read'),
  validateQuery(paginationSchema.extend({
    categoryId: z.string().uuid().optional(),
    lowStock:   z.coerce.boolean().optional(),
    inClassroomUse: z.coerce.boolean().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, branchId, categoryId, lowStock, inClassroomUse, search } = req.query;

      const where = {
        organizationId: req.organizationId,
        deletedAt: null,
        isActive: true,
        ...(branchId && { branchId }),
        ...(categoryId && { categoryId }),
        ...(inClassroomUse !== undefined && { inClassroomUse }),
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      };

      const [total, items] = await Promise.all([
        prisma.inventoryItem.count({ where }),
        prisma.inventoryItem.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { name: 'asc' },
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
            material: { select: { id: true, name: true } },
          },
        }),
      ]);

      // Attach low-stock flag and filter if requested
      let processed = items.map((item) => ({
        ...item,
        isLowStock: item.currentStock <= item.minimumStock,
        isReorderNeeded: item.currentStock <= item.reorderPoint,
      }));

      if (lowStock) {
        processed = processed.filter((i) => i.isLowStock);
      }

      res.json(paginatedResponse(processed, lowStock ? processed.length : total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /inventory/items/low-stock:
 *   get:
 *     summary: Quick endpoint — all items below minimum stock level
 *     tags: [Inventory]
 */
router.get('/items/low-stock', requirePermission('inventory:read'), async (req, res, next) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT i.*, c.name as "categoryName", s.name as "supplierName"
      FROM "InventoryItem" i
      LEFT JOIN "InventoryCategory" c ON i."categoryId" = c.id
      LEFT JOIN "Supplier" s ON i."supplierId" = s.id
      WHERE i."organizationId" = ${req.organizationId}
        AND i."deletedAt" IS NULL
        AND i."isActive" = true
        AND i."currentStock" <= i."minimumStock"
      ORDER BY (i."currentStock" - i."minimumStock") ASC
    `;
    res.json(items);
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /inventory/items/{id}:
 *   get:
 *     summary: Get inventory item with movement history
 *     tags: [Inventory]
 */
router.get('/items/:id', requirePermission('inventory:read'), async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        category: true,
        supplier: true,
        material: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!item) throw new AppError('NOT_FOUND', 'Inventory item not found', 404);
    assertTenantOwnership(item.organizationId, req.organizationId);

    res.json({
      ...item,
      isLowStock: item.currentStock <= item.minimumStock,
      isReorderNeeded: item.currentStock <= item.reorderPoint,
    });
  } catch (err) { next(err); }
});

/**
 * @openapi
 * /inventory/items:
 *   post:
 *     summary: Create an inventory item
 *     tags: [Inventory]
 */
router.post('/items', requirePermission('inventory:write'), validate(inventoryItemSchema), async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.create({
      data: { organizationId: req.organizationId, ...req.body },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.patch('/items/:id', requirePermission('inventory:write'), validate(inventoryItemSchema.partial()), async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/items/:id', requirePermission('inventory:write'), async (req, res, next) => {
  try {
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.json({ message: 'Inventory item deleted' });
  } catch (err) { next(err); }
});

// ─── Stock Movements ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /inventory/movements:
 *   post:
 *     summary: Record a stock movement (purchase, usage, adjustment)
 *     tags: [Inventory]
 */
router.post(
  '/movements',
  requirePermission('inventory:write'),
  validate(stockMovementSchema),
  async (req, res, next) => {
    try {
      const { inventoryItemId, type, quantity, notes, referenceType, referenceId } = req.body;

      const item = await prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, deletedAt: null } });
      if (!item) throw new AppError('NOT_FOUND', 'Inventory item not found', 404);
      assertTenantOwnership(item.organizationId, req.organizationId);

      // Determine signed delta (USAGE and DISPOSAL are always negative)
      const isOutbound = ['USAGE', 'DISPOSAL'].includes(type);
      const delta = isOutbound ? -Math.abs(quantity) : Math.abs(quantity);
      const newStock = item.currentStock + delta;

      if (newStock < 0) {
        throw new AppError('CONFLICT', `Insufficient stock: ${item.currentStock} available, ${Math.abs(delta)} requested`, 409);
      }

      const [movement] = await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            organizationId: req.organizationId,
            inventoryItemId,
            type,
            quantity: delta,
            stockBefore: item.currentStock,
            stockAfter: newStock,
            notes: notes ?? null,
            referenceType: referenceType ?? null,
            referenceId: referenceId ?? null,
            performedByUserId: req.user.sub,
          },
        }),
        prisma.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { currentStock: newStock },
        }),
      ]);

      // Return with low-stock warning
      const response = {
        movement,
        currentStock: newStock,
        isLowStock: newStock <= item.minimumStock,
        warning: newStock <= item.minimumStock
          ? `⚠️  Stock for "${item.name}" is now below minimum (${newStock} remaining, min ${item.minimumStock})`
          : null,
      };

      res.status(201).json(response);
    } catch (err) { next(err); }
  }
);

// ─── Categories & Suppliers ───────────────────────────────────────────────────

router.get('/categories', requirePermission('inventory:read'), async (req, res, next) => {
  try {
    const cats = await prisma.inventoryCategory.findMany({
      where: { organizationId: req.organizationId },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
    res.json(cats);
  } catch (err) { next(err); }
});

router.get('/suppliers', requirePermission('inventory:read'), async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { organizationId: req.organizationId, deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (err) { next(err); }
});

router.post('/suppliers', requirePermission('inventory:write'), async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.create({ data: { organizationId: req.organizationId, ...req.body } });
    res.status(201).json(supplier);
  } catch (err) { next(err); }
});

// ─── Purchase Orders ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /inventory/purchase-orders:
 *   get:
 *     summary: List purchase orders
 *     tags: [Inventory]
 */
router.get(
  '/purchase-orders',
  requirePermission('inventory:read'),
  validateQuery(paginationSchema.extend({ status: z.string().optional() })),
  async (req, res, next) => {
    try {
      const { page, pageSize, status } = req.query;
      const where = {
        organizationId: req.organizationId,
        ...(status && { status }),
      };
      const [total, orders] = await Promise.all([
        prisma.purchaseOrder.count({ where }),
        prisma.purchaseOrder.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { createdAt: 'desc' },
          include: {
            supplier: { select: { id: true, name: true } },
            lines: { include: { inventoryItem: { select: { id: true, name: true, sku: true } } } },
          },
        }),
      ]);
      res.json(paginatedResponse(orders, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /inventory/purchase-orders:
 *   post:
 *     summary: Create a purchase order
 *     tags: [Inventory]
 */
router.post(
  '/purchase-orders',
  requirePermission('inventory:write'),
  validate(purchaseOrderSchema),
  async (req, res, next) => {
    try {
      const { supplierId, branchId, orderDate, expectedDate, notes, lines } = req.body;

      const year = new Date().getFullYear();
      const count = await prisma.purchaseOrder.count({ where: { organizationId: req.organizationId } });
      const orderNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
      const totalAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

      const po = await prisma.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.create({
          data: {
            organizationId: req.organizationId,
            supplierId,
            orderNumber,
            status: 'SUBMITTED',
            orderDate: orderDate ? new Date(orderDate) : new Date(),
            expectedDate: expectedDate ? new Date(expectedDate) : null,
            notes: notes ?? null,
            totalAmount,
            createdByUserId: req.user.sub,
          },
        });

        await tx.purchaseOrderLine.createMany({
          data: lines.map((l) => ({
            purchaseOrderId: order.id,
            inventoryItemId: l.inventoryItemId,
            quantity: l.quantity,
            unitCost: l.unitCost,
            totalCost: l.quantity * l.unitCost,
          })),
        });

        return order;
      });

      res.status(201).json(po);
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /inventory/purchase-orders/{id}/receive:
 *   post:
 *     summary: Mark a purchase order as received and update stock
 *     tags: [Inventory]
 */
router.post('/purchase-orders/:id/receive', requirePermission('inventory:write'), async (req, res, next) => {
  try {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id },
      include: { lines: { include: { inventoryItem: true } } },
    });
    if (!po) throw new AppError('NOT_FOUND', 'Purchase order not found', 404);
    assertTenantOwnership(po.organizationId, req.organizationId);

    if (!['SUBMITTED', 'APPROVED', 'ORDERED'].includes(po.status)) {
      throw new AppError('CONFLICT', `Cannot receive a PO with status ${po.status}`, 409);
    }

    await prisma.$transaction([
      // Update PO status
      prisma.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED', receivedDate: new Date() },
      }),
      // Update stock for each line
      ...po.lines.map((line) =>
        prisma.inventoryItem.update({
          where: { id: line.inventoryItemId },
          data: { currentStock: { increment: line.quantity } },
        })
      ),
      // Create stock movements
      ...po.lines.map((line) =>
        prisma.stockMovement.create({
          data: {
            organizationId: req.organizationId,
            inventoryItemId: line.inventoryItemId,
            type: 'PURCHASE',
            quantity: line.quantity,
            stockBefore: line.inventoryItem.currentStock,
            stockAfter: line.inventoryItem.currentStock + line.quantity,
            referenceType: 'PurchaseOrder',
            referenceId: po.id,
            performedByUserId: req.user.sub,
          },
        })
      ),
    ]);

    res.json({ message: 'Purchase order received and stock updated' });
  } catch (err) { next(err); }
});

export default router;
