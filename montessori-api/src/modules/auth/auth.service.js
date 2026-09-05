import argon2 from 'argon2';
import crypto from 'crypto';
import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendMail, emailTemplates } from '../../config/email.js';
import { env } from '../../config/env.js';
import { signAccessToken, issueRefreshToken } from './token.service.js';
import { writeAuditLog } from '../../middleware/auditLog.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Loads a user's roles and resolved permission keys.
 * This is the single source of truth for what goes into the JWT claims.
 */
export const loadUserClaims = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
      }
    }
  });

  const roles = user.userRoles.map((ur) => ur.role.name);
  let permissions = [
    ...new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.key)
      )
    ),
  ];

  if (roles.includes('ORG_ADMIN') || roles.includes('SUPER_ADMIN')) {
    const allPerms = await prisma.permission.findMany();
    permissions = allPerms.map(p => p.key);
  }

  return { roles, permissions };
};

/**
 * Builds the full auth response shape returned to the client.
 */
const buildAuthResponse = async (user, { deviceInfo, ipAddress } = {}) => {
  const { roles, permissions } = await loadUserClaims(user.id);

  const accessToken = signAccessToken(user, roles, permissions);
  const refreshToken = await issueRefreshToken(user.id, { deviceInfo, ipAddress });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
      roles,
      permissions,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

// ─── register org ─────────────────────────────────────────────────────────────

export const registerOrganization = async (data, meta = {}) => {
  const { orgName, orgSlug, branchName, firstName, lastName, email, password, phone } = data;

  // Check for duplicate email / slug
  const [existingUser, existingOrg] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.organization.findUnique({ where: { slug: orgSlug } }),
  ]);

  if (existingUser) throw new AppError('EMAIL_TAKEN', 'Email already in use', 409);
  if (existingOrg) throw new AppError('SLUG_TAKEN', 'Organisation slug already taken', 409);

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  // Create org and admin user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: orgName, slug: orgSlug },
    });

    // Ensure system roles exist for this org
    const orgAdminRole = await tx.role.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'ORG_ADMIN' } },
      update: {},
      create: {
        organizationId: org.id,
        name: 'ORG_ADMIN',
        displayName: 'School Principal',
        isSystem: true,
      },
    });

    const user = await tx.user.create({
      data: {
        organizationId: org.id,
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone ?? null,
        emailVerifyToken: null,
        isEmailVerified: true,
      },
    });

    await tx.userRole.create({
      data: { userId: user.id, roleId: orgAdminRole.id },
    });

    return { org, user, orgAdminRole };
  });

  // Send verification email (non-blocking)
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
  const tmpl = emailTemplates.verifyEmail(`${firstName} ${lastName}`, verifyUrl);
  sendMail({ to: email, ...tmpl }).catch((e) =>
    console.error('[Email] Failed to send verification email:', e.message)
  );

  return buildAuthResponse(result.user, meta);
};

// ─── login ────────────────────────────────────────────────────────────────────

export const login = async ({ email, password }, meta = {}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: true } } }
  });

  if (!user || !user.isActive) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const passwordMatch = await argon2.verify(user.passwordHash, password);
  if (!passwordMatch) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    organizationId: user.organizationId,
    actorId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return buildAuthResponse(user, meta);
};

// ─── refresh ──────────────────────────────────────────────────────────────────

export const refreshAccessToken = async (plain, meta = {}) => {
  const { rotateRefreshToken } = await import('./token.service.js');
  const { userId, newRefreshToken } = await rotateRefreshToken(plain, meta);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw new AppError('UNAUTHORIZED', 'User account inactive', 401);
  }

  const { roles, permissions } = await loadUserClaims(userId);
  const accessToken = signAccessToken(user, roles, permissions);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
      roles,
      permissions,
    },
  };
};

// ─── logout ───────────────────────────────────────────────────────────────────

export const logout = async (userId, refreshToken, meta = {}) => {
  const { revokeRefreshToken } = await import('./token.service.js');
  await revokeRefreshToken(refreshToken);

  await writeAuditLog({
    organizationId: null,
    actorId: userId,
    action: 'LOGOUT',
    entity: 'User',
    entityId: userId,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
};

// ─── email verification ───────────────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new AppError('INVALID_TOKEN', 'Verification token is invalid or expired', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });

  return { message: 'Email verified successfully' };
};

// ─── forgot / reset password ──────────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal whether the email exists
  if (!user) return { message: 'If that email exists, a reset link has been sent.' };

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const tmpl = emailTemplates.resetPassword(`${user.firstName} ${user.lastName}`, resetUrl);
  sendMail({ to: email, ...tmpl }).catch((e) =>
    console.error('[Email] Failed to send reset email:', e.message)
  );

  return { message: 'If that email exists, a reset link has been sent.' };
};

export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('INVALID_TOKEN', 'Reset token is invalid or has expired', 400);
  }

  const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  // Revoke all existing refresh tokens for security
  const { revokeAllTokens } = await import('./token.service.js');
  await revokeAllTokens(user.id);

  await writeAuditLog({
    organizationId: user.organizationId,
    actorId: user.id,
    action: 'PASSWORD_RESET',
    entity: 'User',
    entityId: user.id,
  });

  return { message: 'Password reset successfully. Please log in again.' };
};

// ─── change password ──────────────────────────────────────────────────────────

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  const passwordMatch = await argon2.verify(user.passwordHash, currentPassword);
  if (!passwordMatch) {
    throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 401);
  }

  const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { message: 'Password changed successfully' };
};

// ─── invite user ──────────────────────────────────────────────────────────────

export const inviteUser = async (invitedByUser, { email, roleId, branchId, firstName, lastName }, meta = {}) => {
  const { organizationId } = invitedByUser;

  // Validate role belongs to this org
  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId },
  });
  if (!role) throw new AppError('NOT_FOUND', 'Role not found', 404);

  // Check for existing invitation
  const existingInvite = await prisma.invitation.findFirst({
    where: { organizationId, email, status: 'PENDING' },
  });
  if (existingInvite) {
    throw new AppError('CONFLICT', 'An active invitation already exists for this email', 409);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      invitedByUserId: invitedByUser.id,
      email,
      roleId,
      token,
      expiresAt,
    },
  });

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  const inviterName = `${invitedByUser.firstName} ${invitedByUser.lastName}`;
  const inviteUrl = `${env.FRONTEND_URL}/accept-invite?token=${token}`;
  const tmpl = emailTemplates.inviteUser(inviterName, org.name, role.displayName, inviteUrl);

  sendMail({ to: email, ...tmpl }).catch((e) =>
    console.error('[Email] Failed to send invite email:', e.message)
  );

  await writeAuditLog({
    organizationId,
    actorId: invitedByUser.id,
    action: 'INVITE_SENT',
    entity: 'Invitation',
    entityId: invitation.id,
    changes: { after: { email, roleName: role.name } },
    ipAddress: meta.ipAddress,
  });

  return { message: 'Invitation sent', invitationId: invitation.id };
};

// ─── accept invite ────────────────────────────────────────────────────────────

export const acceptInvite = async ({ token, firstName, lastName, password }, meta = {}) => {
  const invitation = await prisma.invitation.findFirst({
    where: { token, status: 'PENDING', expiresAt: { gt: new Date() } },
  });

  if (!invitation) {
    throw new AppError('INVALID_TOKEN', 'Invitation token is invalid or has expired', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    throw new AppError('EMAIL_TAKEN', 'An account with this email already exists', 409);
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        organizationId: invitation.organizationId,
        email: invitation.email,
        passwordHash,
        firstName,
        lastName,
        isEmailVerified: true, // invite = email verified
        isActive: true,
      },
    });

    await tx.userRole.create({
      data: { userId: user.id, roleId: invitation.roleId },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    return user;
  });

  return buildAuthResponse(result, meta);
};

// ─── get current user ─────────────────────────────────────────────────────────

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      phone: true,
      isEmailVerified: true,
      organizationId: true,
      locale: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  const { roles, permissions } = await loadUserClaims(userId);
  return { ...user, roles, permissions };
};
