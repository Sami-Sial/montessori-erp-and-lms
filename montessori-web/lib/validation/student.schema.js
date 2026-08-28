/**
 * Student validation schemas — mirror of montessori-api/src/lib/validation/student.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const studentCreateSchema = z.object({
  studentNumber:  z.string().min(1).max(30),
  firstName:      z.string().min(1).max(50),
  lastName:       z.string().min(1).max(50),
  dateOfBirth:    z.coerce.date(),
  gender:         z.enum(['MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY']).optional(),
  photoUrl:       z.string().url().optional().nullable(),
  bloodGroup:     z.string().max(5).optional().nullable(),
  nationality:    z.string().max(50).optional().nullable(),
  address:        z.string().max(255).optional().nullable(),
  allergies:      z.array(z.string()).optional(),
  conditions:     z.array(z.string()).optional(),
  medications:    z.string().optional().nullable(),
  doctorName:     z.string().optional().nullable(),
  doctorPhone:    z.string().optional().nullable(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const guardianCreateSchema = z.object({
  firstName:    z.string().min(1).max(50),
  lastName:     z.string().min(1).max(50),
  relationship: z.string().min(1).max(50),
  phone:        z.string().optional().nullable(),
  altPhone:     z.string().optional().nullable(),
  email:        z.string().email().optional().nullable(),
  occupation:   z.string().optional().nullable(),
  address:      z.string().optional().nullable(),
  isPrimary:    z.boolean().default(false),
  canPickup:    z.boolean().default(true),
});
