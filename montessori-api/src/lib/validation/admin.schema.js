import { z } from 'zod';

export const academicYearCreateSchema = z.object({
  name: z.string().min(1).max(50),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().default(false),
});

export const academicYearUpdateSchema = academicYearCreateSchema.partial();
