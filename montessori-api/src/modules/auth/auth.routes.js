/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication & multi-tenant onboarding
 */

import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import {
  registerOrgSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  inviteUserSchema,
  acceptInviteSchema,
  changePasswordSchema,
} from '../../lib/validation/auth.schema.js';
import * as authService from './auth.service.js';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new organisation + admin account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orgName, orgSlug, branchName, firstName, lastName, email, password]
 *             properties:
 *               orgName:    { type: string, example: "Sunrise Montessori Academy" }
 *               orgSlug:    { type: string, example: "sunrise-montessori" }
 *               branchName: { type: string, example: "Main Campus" }
 *               firstName:  { type: string, example: "Diana" }
 *               lastName:   { type: string, example: "Patel" }
 *               email:      { type: string, format: email }
 *               password:   { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Organisation and admin user created
 *       409:
 *         description: Email or slug already taken
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerOrgSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.registerOrganization(req.body, meta);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate and receive tokens
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken, refreshToken, user
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.login(req.body, meta);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and get a new access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access + refresh tokens
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.refreshAccessToken(req.body.refreshToken, meta);
      res.json(result);
    } catch (err) {
      if (err.message === 'INVALID_REFRESH_TOKEN') {
        return res.status(401).json({
          error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired', details: null },
        });
      }
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     summary: Verify email address via token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid token
 */
router.get('/verify-email', async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validate(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/accept-invite:
 *   post:
 *     summary: Accept an invitation and create an account
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/accept-invite',
  authRateLimiter,
  validate(acceptInviteSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.acceptInvite(req.body, meta);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Authenticated routes ─────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user with roles and permissions
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user object
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke refresh token (logout)
 *     tags: [Auth]
 */
router.post(
  '/logout',
  authenticate,
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      await authService.logout(req.user.sub, req.body.refreshToken, meta);
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change password (authenticated)
 *     tags: [Auth]
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      const result = await authService.changePassword(req.user.sub, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/invite:
 *   post:
 *     summary: Invite a new user to the organisation
 *     tags: [Auth]
 */
router.post(
  '/invite',
  authenticate,
  validate(inviteUserSchema),
  async (req, res, next) => {
    try {
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.inviteUser(req.user, req.body, meta);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
