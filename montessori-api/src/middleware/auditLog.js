import prisma from '../config/db.js';

/**
 * Writes an entry to the AuditLog table.
 * All sensitive actions (role changes, payment edits, data exports,
 * login/logout, password resets) must call this.
 *
 * Non-blocking by design — failures are logged but never crash the request.
 *
 * @param {object} opts
 * @param {string|null}  opts.organizationId
 * @param {string|null}  opts.actorId         - userId performing the action
 * @param {string}       opts.action          - AuditAction enum value
 * @param {string}       opts.entity          - Model name e.g. "Student"
 * @param {string|null}  opts.entityId
 * @param {object|null}  opts.changes         - { before: {}, after: {} }
 * @param {string|null}  opts.ipAddress
 * @param {string|null}  opts.userAgent
 */
export const writeAuditLog = async ({
  organizationId = null,
  actorId = null,
  action,
  entity,
  entityId = null,
  changes = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId,
        actorId,
        action,
        entity,
        entityId,
        changes,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Audit log failures must never break the main request flow
    console.error('[AuditLog] Failed to write audit entry:', err.message);
  }
};

/**
 * Express middleware factory that auto-writes an audit log entry after
 * a successful response for a given action.
 *
 * Usage:
 *   router.delete('/:id', authenticate, auditMiddleware('DELETE', 'Student'), handler)
 */
export const auditMiddleware = (action, entity) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only log on success (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        writeAuditLog({
          organizationId: req.organizationId ?? req.user?.organizationId ?? null,
          actorId: req.user?.sub ?? null,
          action,
          entity,
          entityId: req.params?.id ?? body?.id ?? null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }
      return originalJson(body);
    };

    next();
  };
};
