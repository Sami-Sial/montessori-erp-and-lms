import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';
import { notificationsQueue } from '../../jobs/queues.js';

// Lazy-load io to avoid circular dependency with server.js
const getIO = async () => {
  const { io } = await import('../../server.js');
  return io;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const dateOnly = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ─── Mark attendance ─────────────────────────────────────────────────────────

export const markAttendance = async (
  { studentId, classroomId, date, checkType, method, status, notes },
  { organizationId, actorId }
) => {
  const normalizedDate = dateOnly(date);

  // Verify student belongs to this org
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId, deletedAt: null },
    include: {
      guardians: {
        where: { isPrimary: true },
        include: {
          guardian: {
            include: {
              user: { select: { id: true } },
            },
          },
        },
      },
    },
  });
  if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, classroomId, organizationId, status: 'ACTIVE' },
  });
  if (!enrollment) throw new AppError('NOT_FOUND', 'Active enrollment not found', 404);

  const record = await prisma.attendanceRecord.upsert({
    where: {
      enrollmentId_date_checkType: { enrollmentId: enrollment.id, date: normalizedDate, checkType },
    },
    update: {
      status,
      method,
      notes: notes ?? null,
      markedByUserId: actorId,
      ...(checkType === 'CHECK_IN'  && { checkInAt: new Date() }),
      ...(checkType === 'CHECK_OUT' && { checkOutAt: new Date() }),
    },
    create: {
      organizationId,
      enrollmentId: enrollment.id,
      studentId,
      classroomId,
      date: normalizedDate,
      checkType,
      method,
      status,
      notes: notes ?? null,
      markedByUserId: actorId,
      ...(checkType === 'CHECK_IN'  && { checkInAt: new Date() }),
      ...(checkType === 'CHECK_OUT' && { checkOutAt: new Date() }),
    },
  });

  // Emit live update via Socket.IO for the classroom room
  try {
    const io = await getIO();
    io.to(`classroom:${classroomId}`).emit('attendance:update', {
      studentId,
      checkType,
      status,
      timestamp: new Date(),
    });
  } catch {
    // Socket.IO not available during tests
  }

  // Queue parent notification for check-in/check-out
  if (status === 'PRESENT' && student.guardians.length > 0) {
    const primaryGuardian = student.guardians[0].guardian;
    if (primaryGuardian?.user?.id) {
      await notificationsQueue.add('attendance-notify', {
        type: 'ATTENDANCE',
        userId: primaryGuardian.user.id,
        organizationId,
        studentName: `${student.firstName} ${student.lastName}`,
        checkType,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }).catch(() => null);
    }
  }

  return record;
};

// ─── Bulk mark (entire classroom at once) ────────────────────────────────────

export const bulkMarkAttendance = async (
  { classroomId, date, checkType, method, records },
  { organizationId, actorId }
) => {
  const normalizedDate = dateOnly(date);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      organizationId,
      classroomId,
      status: 'ACTIVE',
      studentId: { in: records.map(r => r.studentId) },
    }
  });
  const enrollmentMap = Object.fromEntries(enrollments.map(e => [e.studentId, e.id]));

  const validRecords = records.filter(r => enrollmentMap[r.studentId]);

  const results = await prisma.$transaction(
    validRecords.map(({ studentId, status, notes }) =>
      prisma.attendanceRecord.upsert({
        where: {
          enrollmentId_date_checkType: { enrollmentId: enrollmentMap[studentId], date: normalizedDate, checkType },
        },
        update: {
          status,
          method,
          notes: notes ?? null,
          markedByUserId: actorId,
          ...(checkType === 'CHECK_IN'  && { checkInAt: new Date() }),
          ...(checkType === 'CHECK_OUT' && { checkOutAt: new Date() }),
        },
        create: {
          organizationId,
          enrollmentId: enrollmentMap[studentId],
          studentId,
          classroomId,
          date: normalizedDate,
          checkType,
          method,
          status,
          notes: notes ?? null,
          markedByUserId: actorId,
          ...(checkType === 'CHECK_IN'  && { checkInAt: new Date() }),
          ...(checkType === 'CHECK_OUT' && { checkOutAt: new Date() }),
        },
      })
    )
  );

  // Live update
  try {
    const io = await getIO();
    io.to(`classroom:${classroomId}`).emit('attendance:bulk-update', {
      classroomId,
      checkType,
      count: results.length,
    });
  } catch {}

  return { count: results.length, records: results };
};

// ─── QR check-in ─────────────────────────────────────────────────────────────

export const qrCheckIn = async ({ qrCode, classroomId, checkType }, { organizationId, actorId }) => {
  const student = await prisma.student.findFirst({
    where: { qrCode, organizationId, deletedAt: null },
  });

  if (!student) {
    throw new AppError('NOT_FOUND', 'QR code not recognised', 404);
  }

  return markAttendance(
    {
      studentId: student.id,
      classroomId,
      date: new Date(),
      checkType,
      method: 'QR',
      status: (() => {
        // Auto late-flag: after 8:30 AM
        const now = new Date();
        const cutoff = new Date(now);
        cutoff.setHours(8, 30, 0, 0);
        return checkType === 'CHECK_IN' && now > cutoff ? 'LATE' : 'PRESENT';
      })(),
    },
    { organizationId, actorId }
  );
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getClassroomAttendance = async ({ classroomId, date, organizationId }) => {
  const normalizedDate = dateOnly(date ?? new Date());

  // Get all active enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { classroomId, organizationId, status: 'ACTIVE' },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, photoUrl: true, studentNumber: true } },
    },
    orderBy: { student: { lastName: 'asc' } },
  });

  // Get attendance records for that day
  const records = await prisma.attendanceRecord.findMany({
    where: {
      classroomId,
      organizationId,
      date: normalizedDate,
    },
  });

  const recordMap = {};
  for (const r of records) {
    if (!recordMap[r.studentId]) recordMap[r.studentId] = {};
    recordMap[r.studentId][r.checkType] = r;
  }

  const roster = enrollments.map(({ student }) => ({
    student,
    checkIn: recordMap[student.id]?.CHECK_IN ?? null,
    checkOut: recordMap[student.id]?.CHECK_OUT ?? null,
    status: recordMap[student.id]?.CHECK_IN?.status ?? 'NOT_MARKED',
  }));

  const summary = {
    total:    roster.length,
    present:  roster.filter(r => r.status === 'PRESENT').length,
    absent:   roster.filter(r => r.status === 'ABSENT').length,
    late:     roster.filter(r => r.status === 'LATE').length,
    notMarked:roster.filter(r => r.status === 'NOT_MARKED').length,
  };

  return { date: normalizedDate, roster, summary };
};

export const getStudentAttendance = async ({ studentId, organizationId, startDate, endDate }) => {
  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId,
      organizationId,
      date: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    },
    orderBy: { date: 'desc' },
  });

  const summary = await prisma.attendanceSummary.findMany({
    where: { studentId, organizationId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return { records, summary };
};

export const getAttendanceAnalytics = async ({ organizationId, classroomId, branchId, month, year }) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      organizationId,
      ...(classroomId && { classroomId }),
      ...(branchId && { classroom: { branchId } }),
      date: { gte: startDate, lte: endDate },
      checkType: 'CHECK_IN',
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Find chronic absence (< 80% attendance)
  const studentStats = {};
  for (const r of records) {
    if (!studentStats[r.studentId]) {
      studentStats[r.studentId] = { student: r.student, present: 0, absent: 0, late: 0, total: 0 };
    }
    studentStats[r.studentId].total++;
    if (r.status === 'PRESENT') studentStats[r.studentId].present++;
    else if (r.status === 'ABSENT') studentStats[r.studentId].absent++;
    else if (r.status === 'LATE') studentStats[r.studentId].late++;
  }

  const chronicallyAbsent = Object.values(studentStats).filter(
    (s) => s.total > 0 && (s.present / s.total) < 0.8
  );

  return {
    period: { month, year, startDate, endDate },
    overall: {
      totalRecords: records.length,
      presentCount: records.filter(r => r.status === 'PRESENT').length,
      absentCount: records.filter(r => r.status === 'ABSENT').length,
      lateCount: records.filter(r => r.status === 'LATE').length,
    },
    studentStats: Object.values(studentStats),
    chronicallyAbsent,
  };
};

export const getAttendanceTrend = async ({ organizationId, branchId, academicYearId }) => {
  let startDate, endDate;
  
  if (academicYearId) {
    const year = await prisma.academicYear.findFirst({ where: { id: academicYearId, organizationId } });
    if (year) {
      startDate = year.startDate;
      endDate = year.endDate;
    }
  }
  
  if (!startDate || !endDate) {
    // Default to last 6 months
    endDate = new Date();
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      organizationId,
      ...(branchId && { classroom: { branchId } }),
      date: { gte: startDate, lte: endDate },
      checkType: 'CHECK_IN',
    },
    select: { date: true, status: true },
  });

  const monthlyData = {};
  
  let current = new Date(startDate);
  while (current <= endDate) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = { present: 0, total: 0, month: monthKey, rate: 0 };
    current.setMonth(current.getMonth() + 1);
  }

  for (const r of records) {
    const monthKey = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        monthlyData[monthKey].present++;
      }
    }
  }

  for (const key in monthlyData) {
    const item = monthlyData[key];
    item.rate = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
  }

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};


export const getAttendanceHistory = async ({ organizationId, classroomId, startDate, endDate, skip = 0, take = 50 }) => {
  const where = { organizationId };
  if (classroomId) where.classroomId = classroomId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [records, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentNumber: true } },
        classroom: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { firstName: 'asc' } }],
      skip: Number(skip),
      take: Number(take),
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return { records, total, skip: Number(skip), take: Number(take) };
};
