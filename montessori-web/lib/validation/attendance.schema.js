/**
 * Attendance validation schemas — mirror of montessori-api/src/lib/validation/attendance.schema.js
 * The backend copy is authoritative. If these drift, backend wins.
 */
import { z } from 'zod';

export const markAttendanceSchema = z.object({
  studentId:   z.string().uuid(),
  classroomId: z.string().uuid(),
  date:        z.coerce.date(),
  checkType:   z.enum(['CHECK_IN', 'CHECK_OUT']),
  method:      z.enum(['QR', 'MANUAL', 'BIOMETRIC']).default('MANUAL'),
  status:      z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY']).default('PRESENT'),
  notes:       z.string().optional().nullable(),
});

export const bulkAttendanceSchema = z.object({
  classroomId: z.string().uuid(),
  date:        z.coerce.date(),
  checkType:   z.enum(['CHECK_IN', 'CHECK_OUT']),
  method:      z.enum(['QR', 'MANUAL', 'BIOMETRIC']).default('MANUAL'),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status:    z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY']).default('PRESENT'),
    notes:     z.string().optional().nullable(),
  })).min(1),
});

export const qrScanSchema = z.object({
  qrCode:      z.string().min(1),
  classroomId: z.string().uuid(),
  checkType:   z.enum(['CHECK_IN', 'CHECK_OUT']),
});
