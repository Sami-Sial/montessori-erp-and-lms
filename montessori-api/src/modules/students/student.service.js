import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';
import { paginate, paginatedResponse } from '../../lib/pagination.js';
import { writeAuditLog } from '../../middleware/auditLog.js';

// ─── Students ────────────────────────────────────────────────────────────────

export const listStudents = async ({ organizationId, page, pageSize, search, classroomId, status }) => {
  const where = {
    organizationId,
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(classroomId && {
      enrollments: {
        some: {
          classroomId,
          status: 'ACTIVE',
        },
      },
    }),
  };

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      ...paginate(page, pageSize),
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { classroom: { select: { id: true, name: true } } },
          take: 1,
        },
        guardians: {
          where: { isPrimary: true },
          include: {
            guardian: {
              select: { firstName: true, lastName: true, phone: true, relationship: true },
            },
          },
          take: 1,
        },
      },
    }),
  ]);

  return paginatedResponse(students, total, page, pageSize);
};

export const getStudentById = async (id, organizationId) => {
  const student = await prisma.student.findFirst({
    where: { id, deletedAt: null },
    include: {
      enrollments: {
        include: {
          classroom: true,
          academicYear: true,
        },
        orderBy: { enrolledAt: 'desc' },
      },
      guardians: {
        include: {
          guardian: true,
        },
      },
      emergencyContacts: true,
      medicalInfo: true,
      _count: {
        select: { observations: true, badges: true },
      },
    },
  });

  if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
  assertTenantOwnership(student.organizationId, organizationId);

  return student;
};

export const createStudent = async (organizationId, data, actorId) => {
  const { allergies, conditions, medications, doctorName, doctorPhone, ...studentData } = data;

  // Unique student number check
  const existing = await prisma.student.findFirst({
    where: { organizationId, studentNumber: data.studentNumber, deletedAt: null },
  });
  if (existing) {
    throw new AppError('CONFLICT', 'Student number already in use', 409);
  }

  const student = await prisma.$transaction(async (tx) => {
    const s = await tx.student.create({
      data: {
        organizationId,
        ...studentData,
      },
    });

    // Create medical info if provided
    if (allergies || conditions || medications || doctorName || doctorPhone) {
      await tx.medicalInfo.create({
        data: {
          studentId: s.id,
          allergies: allergies ?? [],
          conditions: conditions ?? [],
          medications: medications ?? null,
          doctorName: doctorName ?? null,
          doctorPhone: doctorPhone ?? null,
        },
      });
    }

    return s;
  });

  await writeAuditLog({
    organizationId,
    actorId,
    action: 'CREATE',
    entity: 'Student',
    entityId: student.id,
    changes: { after: studentData },
  });

  return student;
};

export const updateStudent = async (id, organizationId, data, actorId) => {
  const existing = await getStudentById(id, organizationId);

  const { allergies, conditions, medications, doctorName, doctorPhone, ...studentData } = data;

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.student.update({
      where: { id },
      data: studentData,
    });

    // Update or create medical info
    if (allergies !== undefined || conditions !== undefined || medications !== undefined) {
      await tx.medicalInfo.upsert({
        where: { studentId: id },
        update: {
          ...(allergies !== undefined && { allergies }),
          ...(conditions !== undefined && { conditions }),
          ...(medications !== undefined && { medications }),
          ...(doctorName !== undefined && { doctorName }),
          ...(doctorPhone !== undefined && { doctorPhone }),
        },
        create: {
          studentId: id,
          allergies: allergies ?? [],
          conditions: conditions ?? [],
          medications: medications ?? null,
          doctorName: doctorName ?? null,
          doctorPhone: doctorPhone ?? null,
        },
      });
    }

    return s;
  });

  await writeAuditLog({
    organizationId,
    actorId,
    action: 'UPDATE',
    entity: 'Student',
    entityId: id,
    changes: { before: existing, after: data },
  });

  return updated;
};

export const deleteStudent = async (id, organizationId, actorId) => {
  await getStudentById(id, organizationId); // throws if not found / wrong tenant

  await prisma.student.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await writeAuditLog({
    organizationId,
    actorId,
    action: 'DELETE',
    entity: 'Student',
    entityId: id,
  });

  return { message: 'Student deleted' };
};

// ─── Guardians ───────────────────────────────────────────────────────────────

export const addGuardian = async (studentId, organizationId, guardianData, actorId) => {
  await getStudentById(studentId, organizationId);

  const { isPrimary, canPickup, ...profileData } = guardianData;

  // Find or create the guardian user
  let guardianUser = await prisma.user.findUnique({
    where: { email: profileData.email ?? '' },
  });

  const result = await prisma.$transaction(async (tx) => {
    let guardianRecord;

    if (guardianUser) {
      // User exists — find or create guardian profile
      guardianRecord = await tx.guardian.upsert({
        where: { userId: guardianUser.id },
        update: profileData,
        create: {
          organizationId,
          userId: guardianUser.id,
          ...profileData,
        },
      });
    } else {
      // No user account yet — create a placeholder user for the guardian
      // They'll set their password via invite
      const crypto = await import('crypto');
      const tempEmail = profileData.email ?? `guardian-${crypto.default.randomUUID()}@placeholder.internal`;
      guardianUser = await tx.user.create({
        data: {
          organizationId,
          email: tempEmail,
          passwordHash: '', // placeholder — must be set via invite
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone ?? null,
          isActive: false, // inactive until invited
        },
      });

      // Assign PARENT role
      const parentRole = await tx.role.findFirst({
        where: { organizationId, name: 'PARENT' },
      });
      if (parentRole) {
        await tx.userRole.create({
          data: { userId: guardianUser.id, roleId: parentRole.id },
        });
      }

      guardianRecord = await tx.guardian.create({
        data: {
          organizationId,
          userId: guardianUser.id,
          ...profileData,
        },
      });
    }

    const link = await tx.studentGuardian.upsert({
      where: { studentId_guardianId: { studentId, guardianId: guardianRecord.id } },
      update: { isPrimary: isPrimary ?? false, canPickup: canPickup ?? true },
      create: {
        studentId,
        guardianId: guardianRecord.id,
        isPrimary: isPrimary ?? false,
        canPickup: canPickup ?? true,
      },
    });

    return { guardian: guardianRecord, link };
  });

  return result;
};

export const getStudentProgress = async (studentId, organizationId) => {
  await getStudentById(studentId, organizationId);

  const progress = await prisma.studentProgress.findMany({
    where: { studentId },
    include: {
      curriculumArea: true,
      milestone: true,
    },
    orderBy: [{ curriculumArea: { sortOrder: 'asc' } }, { milestone: { sortOrder: 'asc' } }],
  });

  const observations = await prisma.observation.findMany({
    where: { studentId, deletedAt: null },
    include: {
      curriculumArea: { select: { id: true, name: true, colorHex: true } },
      milestone: { select: { id: true, title: true } },
      staff: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { observedAt: 'desc' },
    take: 20,
  });

  return { progress, observations };
};
