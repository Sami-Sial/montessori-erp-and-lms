import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
import { env } from '../../config/env.js';
import prisma from '../../config/db.js';

// ─── Access token ─────────────────────────────────────────────────────────────

/**
 * Signs a short-lived access token containing the minimal claims the
 * frontend needs to boot the authSlice without an extra /me fetch.
 */
export const signAccessToken = (user, roles, permissions) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId ?? null,
      branchId: user.branchId ?? null,
      roles,       // string[] e.g. ["TEACHER"]
      permissions, // string[] e.g. ["attendance:mark", "student:read"]
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET);

// ─── Refresh token ────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random refresh token, hashes it for
 * storage, and persists the record.  Returns the PLAIN token for the
 * cookie / response body.
 */
export const issueRefreshToken = async (userId, { deviceInfo, ipAddress } = {}) => {
  const plain = crypto.randomBytes(48).toString('base64url');
  const tokenHash = await argon2.hash(plain, { type: argon2.argon2id });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      deviceInfo: deviceInfo ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt,
    },
  });

  return plain;
};

/**
 * Validates a plain refresh token by scanning unhashed DB records and
 * doing a constant-time argon2 verify.  Rotates on success:
 * - Revokes the consumed token
 * - Issues a fresh token
 *
 * Returns { userId, newRefreshToken } or throws.
 */
export const rotateRefreshToken = async (plain, { deviceInfo, ipAddress } = {}) => {
  // Find candidates that are not revoked and not expired
  const candidates = await prisma.refreshToken.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    take: 200, // Safety bound — in practice a user has < 10 active tokens
  });

  let matched = null;
  for (const candidate of candidates) {
    const ok = await argon2.verify(candidate.tokenHash, plain);
    if (ok) { matched = candidate; break; }
  }

  if (!matched) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Revoke consumed token
  await prisma.refreshToken.update({
    where: { id: matched.id },
    data: { revokedAt: new Date() },
  });

  // Issue new token
  const newToken = await issueRefreshToken(matched.userId, { deviceInfo, ipAddress });

  return { userId: matched.userId, newRefreshToken: newToken };
};

/**
 * Revokes all refresh tokens for a user (logout-all-devices).
 */
export const revokeAllTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Revokes a single refresh token by its plain value.
 */
export const revokeRefreshToken = async (plain) => {
  const candidates = await prisma.refreshToken.findMany({
    where: { revokedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  for (const candidate of candidates) {
    const ok = await argon2.verify(candidate.tokenHash, plain);
    if (ok) {
      await prisma.refreshToken.update({
        where: { id: candidate.id },
        data: { revokedAt: new Date() },
      });
      return;
    }
  }
};
