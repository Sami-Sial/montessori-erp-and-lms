import { verifyAccessToken } from '../modules/auth/token.service.js';
import { AppError } from './errorHandler.js';

/**
 * Verifies the JWT and attaches the decoded claims to `req.user`.
 *
 * req.user = {
 *   sub:            string   (userId)
 *   email:          string
 *   organizationId: string | null
 *   branchId:       string | null
 *   roles:          string[]
 *   permissions:    string[]
 * }
 */
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  const token = header.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err); // JsonWebTokenError / TokenExpiredError → handled by errorHandler
  }
};

/**
 * Optional authentication — populates req.user if a valid token is present
 * but does NOT reject unauthenticated requests. Use for mixed public/private
 * endpoints (e.g. announcements that guests can preview).
 */
export const authenticateOptional = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
