/**
 * Observation validation schemas
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const observationCreateSchema = z.object({
  studentId:        z.string().uuid(),
  curriculumAreaId: z.string().uuid(),
  milestoneId:      z.string().uuid().optional().nullable(),
  note:             z.string().min(1).max(2000),
  masteryLevel:     z.enum(['NOT_INTRODUCED','INTRODUCED','PRACTICING','MASTERED','EXTENDING']).default('INTRODUCED'),
  observedAt:       z.coerce.date().optional(),
});

export const observationUpdateSchema = observationCreateSchema.partial();
