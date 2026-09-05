/**
 * Auth validation schemas — mirror of montessori-api/src/lib/validation/auth.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const registerOrgSchema = z.object({
  orgName:    z.string().min(2).max(100),
  orgSlug:    z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  firstName:  z.string().min(1).max(50),
  lastName:   z.string().min(1).max(50),
  email:      z.string().email(),
  password:   z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
  phone:      z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});

export const inviteUserSchema = z.object({
  email:     z.string().email(),
  roleId:    z.string().uuid(),
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
});

export const acceptInviteSchema = z.object({
  token:     z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  password:  z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});
