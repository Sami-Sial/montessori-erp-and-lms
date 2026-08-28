/**
 * HR validation schemas — mirror of montessori-api/src/lib/validation/hr.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['ANNUAL','SICK','MATERNITY','PATERNITY','UNPAID','BEREAVEMENT','OTHER']),
  startDate: z.coerce.date(),
  endDate:   z.coerce.date(),
  reason:    z.string().optional().nullable(),
});

export const leaveApprovalSchema = z.object({
  status:          z.enum(['APPROVED','REJECTED']),
  rejectionReason: z.string().optional().nullable(),
});
