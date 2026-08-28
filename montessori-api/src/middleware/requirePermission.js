import { AppError } from './errorHandler.js';

/**
 * Permission-based access control middleware.
 *
 * Usage:
 *   router.post('/attendance', authenticate, requirePermission('attendance:mark'), handler)
 *
 * The permission check is backed by the DB-driven permission set that was
 * resolved at login time and embedded in the JWT claims. The backend is the
 * real enforcement gate; the frontend's useHasPermission hook mirrors this
 * for UI show/hide but is not trusted for security.
 *
 * @param {...string} permissionKeys - One or more permission keys. Access is
 *   granted if the user holds ANY of the listed permissions (OR logic).
 *   Pass an array as the first arg for AND logic.
 */
export const requirePermission = (...permissionKeys) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    const userPerms = req.user.permissions ?? [];

    // Flatten: if first arg is an array, treat as AND (all required)
    if (Array.isArray(permissionKeys[0])) {
      const requiredAll = permissionKeys[0];
      const hasAll = requiredAll.every((p) => userPerms.includes(p));
      if (!hasAll) {
        return next(
          new AppError(
            'FORBIDDEN',
            `You need all of these permissions: ${requiredAll.join(', ')}`,
            403
          )
        );
      }
      return next();
    }

    // OR logic — user needs at least one of the listed permissions
    const hasAny = permissionKeys.some((p) => userPerms.includes(p));
    if (!hasAny) {
      return next(
        new AppError(
          'FORBIDDEN',
          `You do not have permission to perform this action`,
          403,
          { required: permissionKeys }
        )
      );
    }

    next();
  };
};

/**
 * Convenience: require one of the SUPER_ADMIN or ORG_ADMIN roles.
 * Used for platform-level operations where no per-resource permission exists.
 */
export const requireRole = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    const userRoles = req.user.roles ?? [];
    const hasRole = roleNames.some((r) => userRoles.includes(r));

    if (!hasRole) {
      return next(
        new AppError('FORBIDDEN', 'You do not have the required role', 403, { required: roleNames })
      );
    }

    next();
  };
};
