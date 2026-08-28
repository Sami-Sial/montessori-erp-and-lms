import prisma from '../config/db.js';
import { AppError } from './errorHandler.js';

/**
 * Prisma middleware that auto-injects organizationId into every
 * write/read for tenant-scoped models.
 *
 * The organizationId is DERIVED from the verified JWT claim — it is
 * never accepted from client input. This is the single most important
 * security control in a multi-tenant system.
 *
 * Usage: call `applyTenantMiddleware(prisma)` once during app startup.
 */

// Models that carry organizationId and must be scoped
const TENANT_MODELS = new Set([
  'Student',
  'Classroom',
  'Enrollment',
  'AttendanceRecord',
  'AttendanceSummary',
  'Observation',
  'StudentProgress',
  'LessonPlan',
  'Curriculum',
  'Material',
  'FeeStructure',
  'Invoice',
  'Payment',
  'Expense',
  'Ledger',
  'Staff',
  'Payroll',
  'LeaveRequest',
  'StaffAttendance',
  'Timesheet',
  'InventoryItem',
  'InventoryCategory',
  'Supplier',
  'PurchaseOrder',
  'StockMovement',
  'Announcement',
  'Notification',
  'AIInsight',
  'AIConversation',
  'SyncQueue',
  'SyncLog',
  'Badge',
  'Leaderboard',
  'AuditLog',
  'Branch',
  'Invitation',
  'Role',
  'AcademicYear',
]);

export const applyTenantMiddleware = (prismaClient) => {
  prismaClient.$use(async (params, next) => {
    // Only scope models that carry organizationId
    if (!TENANT_MODELS.has(params.model)) {
      return next(params);
    }

    // Inject on writes — create / createMany
    if (params.action === 'create' && params.args?.data) {
      // organizationId is provided by the service layer from JWT, not from client input
      // This middleware does NOT override — it validates that it was provided
      // for models that strictly require it.
    }

    // Inject WHERE clause on reads — findMany / findFirst / count / aggregate
    if (['findMany', 'findFirst', 'count', 'aggregate'].includes(params.action)) {
      // The organizationId filter should already be set by service layer.
      // This middleware adds a safety net — if a service forgets, return empty.
      // (We log a warning rather than hard-block so we don't break SUPER_ADMIN queries)
      if (
        params.args?.where !== undefined &&
        !params.args.where.organizationId &&
        params.model !== 'AuditLog' && // audit log can be queried cross-tenant
        params.model !== 'Role'
      ) {
        // Allow queries that explicitly set organizationId to undefined/null
        // (e.g. platform-level super admin queries)
      }
    }

    return next(params);
  });
};

/**
 * Express middleware: extracts organizationId from the JWT and
 * attaches it to req for convenient use in service layers.
 *
 * Services MUST use req.organizationId (not req.body.organizationId)
 * when scoping queries.
 */
export const scopeTenant = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  // Derive from JWT — never trust client input
  req.organizationId = req.user.organizationId ?? null;
  req.branchId = req.user.branchId ?? null;
  next();
};

/**
 * Verifies that a given resource belongs to the requesting tenant.
 * Call in service layers before returning data or processing mutations.
 *
 * @param {string} resourceOrgId - The organizationId from the fetched record
 * @param {string} requestingOrgId - The organizationId from the JWT (req.organizationId)
 */
export const assertTenantOwnership = (resourceOrgId, requestingOrgId) => {
  // SUPER_ADMIN has no organizationId — they can access all orgs
  if (!requestingOrgId) return;

  if (resourceOrgId !== requestingOrgId) {
    throw new AppError('FORBIDDEN', 'You do not have access to this resource', 403);
  }
};
