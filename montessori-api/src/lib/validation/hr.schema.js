import { z } from 'zod';

export const staffCreateSchema = z.object({
  firstName:       z.string().min(1).max(50),
  lastName:        z.string().min(1).max(50),
  email:           z.string().email(),
  phone:           z.string().optional().nullable(),
  role:            z.enum(['TEACHER', 'HR_STAFF', 'FINANCE_STAFF', 'ADMIN', 'FRONT_DESK']).default('TEACHER'),
  employeeNumber:  z.string().min(1).max(30),
  jobTitle:        z.string().min(1).max(100),
  department:      z.string().optional().nullable(),
  employmentType:  z.enum(['FULL_TIME','PART_TIME','CONTRACT','INTERN']).default('FULL_TIME'),
  startDate:       z.coerce.date(),
  endDate:         z.coerce.date().optional().nullable(),
  salary:          z.coerce.number().positive(),
  currency:        z.string().length(3).default('USD'),
  qualifications:  z.array(z.string()).optional(),
  certifications:  z.array(z.string()).optional(),
});

export const leaveRequestSchema = z.object({
  leaveType:  z.enum(['ANNUAL','SICK','MATERNITY','PATERNITY','UNPAID','BEREAVEMENT','OTHER']),
  startDate:  z.coerce.date(),
  endDate:    z.coerce.date(),
  reason:     z.string().optional().nullable(),
});

export const leaveApprovalSchema = z.object({
  status:          z.enum(['APPROVED','REJECTED']),
  rejectionReason: z.string().optional().nullable(),
});

export const payrollSchema = z.object({
  staffId:     z.string().uuid(),
  month:       z.coerce.number().int().min(1).max(12),
  year:        z.coerce.number().int().min(2020).max(2100),
  baseSalary:  z.coerce.number().positive(),
  allowances:  z.coerce.number().min(0).default(0),
  deductions:  z.coerce.number().min(0).default(0),
  currency:    z.string().length(3).default('USD'),
  notes:       z.string().optional().nullable(),
});

export const timesheetSchema = z.object({
  weekStartDate: z.coerce.date(),
  entries: z.array(z.object({
    date:     z.coerce.date(),
    hours:    z.coerce.number().min(0).max(24),
    activity: z.string().optional(),
    notes:    z.string().optional().nullable(),
  })).min(1),
});
