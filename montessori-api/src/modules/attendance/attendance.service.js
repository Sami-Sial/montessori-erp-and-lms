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

  const record = await prisma.attendanceRecord.upsert({
    where: {
      studentId_date_checkType: { studentId, date: normalizedDate, checkType },
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

  const results = await prisma.$transaction(
    records.map(({ studentId, status, notes }) =>
      prisma.attendanceRecord.upsert({
        where: {
          studentId_date_checkType: { studentId, date: normalizedDate, checkType },
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

export const getAttendanceAnalytics = async ({ organizationId, classroomId, month, year }) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      organizationId,
      ...(classroomId && { classroomId }),
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
