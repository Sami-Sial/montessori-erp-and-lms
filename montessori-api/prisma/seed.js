/**
 * prisma/seed.js
 * Realistic demo data for the Montessori ERP & LMS Platform.
 *
 * Edge cases covered:
 *  ✓ Student with TWO guardians (primary + secondary)
 *  ✓ OVERDUE invoice
 *  ✓ LOW-STOCK inventory item (below minimumStock)
 *  ✓ FLAGGED sync conflict in SyncLog
 *  ✓ Staff member with approved & pending leave requests
 *  ✓ Student progress with ALL five mastery levels
 *  ✓ AI insights of multiple types
 *
 * Demo credentials (all passwords: Demo@1234):
 *  superadmin@platform.com  — SUPER_ADMIN
 *  principal@sunrise.edu    — ORG_ADMIN
 *  branchadmin@sunrise.edu  — BRANCH_ADMIN
 *  teacher@sunrise.edu      — TEACHER
 *  guide@sunrise.edu        — GUIDE
 *  finance@sunrise.edu      — FINANCE_STAFF
 *  hr@sunrise.edu           — HR_STAFF
 *  frontdesk@sunrise.edu    — FRONT_DESK
 *  parent1@example.com      — PARENT (Robert Johnson, father of Alex)
 *  parent2@example.com      — PARENT (Emily Johnson, mother of Alex — 2nd guardian)
 *  parent3@example.com      — PARENT (Carlos Rivera, father of Sofia)
 *  student@sunrise.edu      — STUDENT (Alex Johnson)
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

// ─── helpers ─────────────────────────────────────────────────────────────────

const hash = (plain) => argon2.hash(plain, { type: argon2.argon2id });

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const dateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding Montessori Platform database…\n');

  // ── 1. Permissions ────────────────────────────────────────────────────────────
  console.log('  → Permissions');

  const permDefs = [
    { key: 'student:read',        module: 'students',      action: 'read',    description: 'View student profiles' },
    { key: 'student:write',       module: 'students',      action: 'write',   description: 'Create/edit students' },
    { key: 'student:delete',      module: 'students',      action: 'delete',  description: 'Delete students' },
    { key: 'attendance:read',     module: 'attendance',    action: 'read',    description: 'View attendance records' },
    { key: 'attendance:mark',     module: 'attendance',    action: 'mark',    description: 'Mark attendance' },
    { key: 'curriculum:read',     module: 'curriculum',    action: 'read',    description: 'View curriculum' },
    { key: 'curriculum:write',    module: 'curriculum',    action: 'write',   description: 'Create/edit curriculum' },
    { key: 'observation:read',    module: 'observations',  action: 'read',    description: 'View observations' },
    { key: 'observation:write',   module: 'observations',  action: 'write',   description: 'Log observations' },
    { key: 'finance:read',        module: 'finance',       action: 'read',    description: 'View financial data' },
    { key: 'finance:write',       module: 'finance',       action: 'write',   description: 'Create invoices/payments' },
    { key: 'finance:delete',      module: 'finance',       action: 'delete',  description: 'Delete finance records' },
    { key: 'hr:read',             module: 'hr',            action: 'read',    description: 'View HR data' },
    { key: 'hr:write',            module: 'hr',            action: 'write',   description: 'Manage HR records' },
    { key: 'inventory:read',      module: 'inventory',     action: 'read',    description: 'View inventory' },
    { key: 'inventory:write',     module: 'inventory',     action: 'write',   description: 'Manage inventory' },
    { key: 'announcement:read',   module: 'communication', action: 'read',    description: 'View announcements' },
    { key: 'announcement:write',  module: 'communication', action: 'write',   description: 'Post announcements' },
    { key: 'message:send',        module: 'communication', action: 'send',    description: 'Send messages' },
    { key: 'ai:chat',             module: 'ai',            action: 'chat',    description: 'Use AI assistant' },
    { key: 'ai:insights',         module: 'ai',            action: 'read',    description: 'View AI insights' },
    { key: 'admin:users',         module: 'admin',         action: 'manage',  description: 'Manage users & roles' },
    { key: 'admin:org',           module: 'admin',         action: 'manage',  description: 'Manage organisation settings' },
    { key: 'admin:branches',      module: 'admin',         action: 'manage',  description: 'Manage branches' },
    { key: 'report:export',       module: 'reports',       action: 'export',  description: 'Export reports / PDFs' },
    { key: 'gamification:read',   module: 'gamification',  action: 'read',    description: 'View badges and points' },
    { key: 'gamification:award',  module: 'gamification',  action: 'award',   description: 'Award badges to students' },
  ];

  const permissions = {};
  for (const def of permDefs) {
    const p = await prisma.permission.upsert({
      where: { key: def.key },
      update: {},
      create: { id: uuid(), ...def },
    });
    permissions[def.key] = p;
  }

  // ── 2. Organisation ───────────────────────────────────────────────────────────
  console.log('  → Organisation');

  const org = await prisma.organization.upsert({
    where: { slug: 'sunrise-montessori' },
    update: {},
    create: {
      id: uuid(),
      name: 'Sunrise Montessori Academy',
      slug: 'sunrise-montessori',
      email: 'admin@sunrise.edu',
      phone: '+1-555-0100',
      address: '123 Elm Street',
      city: 'Austin',
      country: 'US',
      timezone: 'America/Chicago',
      locale: 'en',
    },
  });

  // ── 3. Branches ───────────────────────────────────────────────────────────────
  console.log('  → Branches');

  const mainBranch = await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'MAIN' } },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      name: 'Main Campus',
      code: 'MAIN',
      address: '123 Elm Street',
      city: 'Austin',
      phone: '+1-555-0101',
      email: 'main@sunrise.edu',
    },
  });

  await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'NORTH' } },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      name: 'North Campus',
      code: 'NORTH',
      address: '456 Oak Avenue',
      city: 'Austin',
      phone: '+1-555-0102',
      email: 'north@sunrise.edu',
    },
  });

  // ── 4. Roles ──────────────────────────────────────────────────────────────────
  console.log('  → Roles & Permissions');

  const allKeys = Object.keys(permissions);

  const roleDefs = [
    {
      name: 'SUPER_ADMIN', displayName: 'Super Administrator', isSystem: true,
      perms: allKeys,
    },
    {
      name: 'ORG_ADMIN', displayName: 'School Principal', isSystem: true,
      perms: allKeys.filter((k) => k !== 'admin:org'),
    },
    {
      name: 'BRANCH_ADMIN', displayName: 'Branch Administrator', isSystem: true,
      perms: ['student:read','student:write','attendance:read','attendance:mark','curriculum:read','curriculum:write','observation:read','observation:write','announcement:read','announcement:write','message:send','ai:chat','ai:insights','report:export','gamification:read','gamification:award'],
    },
    {
      name: 'TEACHER', displayName: 'Teacher / Guide', isSystem: true,
      perms: ['student:read','attendance:read','attendance:mark','curriculum:read','curriculum:write','observation:read','observation:write','announcement:read','message:send','ai:chat','gamification:read','gamification:award'],
    },
    {
      name: 'GUIDE', displayName: 'Montessori Guide', isSystem: true,
      perms: ['student:read','attendance:read','attendance:mark','curriculum:read','curriculum:write','observation:read','observation:write','announcement:read','message:send','ai:chat','gamification:read','gamification:award'],
    },
    {
      name: 'PARENT', displayName: 'Parent / Guardian', isSystem: true,
      perms: ['student:read','attendance:read','observation:read','announcement:read','message:send','ai:chat','gamification:read'],
    },
    {
      name: 'STUDENT', displayName: 'Student', isSystem: true,
      perms: ['announcement:read','gamification:read'],
    },
    {
      name: 'FINANCE_STAFF', displayName: 'Finance Staff', isSystem: true,
      perms: ['finance:read','finance:write','student:read','report:export','announcement:read'],
    },
    {
      name: 'HR_STAFF', displayName: 'HR Staff', isSystem: true,
      perms: ['hr:read','hr:write','student:read','announcement:read','report:export'],
    },
    {
      name: 'FRONT_DESK', displayName: 'Front Desk', isSystem: true,
      perms: ['student:read','attendance:read','attendance:mark','announcement:read','message:send'],
    },
  ];

  const roleMap = {};
  for (const rd of roleDefs) {
    const role = await prisma.role.upsert({
      where: { organizationId_name: { organizationId: org.id, name: rd.name } },
      update: {},
      create: {
        id: uuid(),
        organizationId: org.id,
        name: rd.name,
        displayName: rd.displayName,
        isSystem: rd.isSystem,
      },
    });
    roleMap[rd.name] = role;

    for (const pk of rd.perms) {
      if (!permissions[pk]) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissions[pk].id } },
        update: {},
        create: { id: uuid(), roleId: role.id, permissionId: permissions[pk].id },
      });
    }
  }

  // ── 5. Users ──────────────────────────────────────────────────────────────────
  console.log('  → Users');

  const pw = await hash('Demo@1234');

  const upsertUser = async ({ email, firstName, lastName, phone, branchId }, roleName) => {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuid(),
          organizationId: org.id,
          branchId: branchId ?? mainBranch.id,
          email,
          passwordHash: pw,
          firstName,
          lastName,
          phone: phone ?? null,
          isEmailVerified: true,
          isActive: true,
        },
      });
    }
    if (roleName) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: roleMap[roleName].id } },
        update: {},
        create: { id: uuid(), userId: user.id, roleId: roleMap[roleName].id },
      });
    }
    return user;
  };

  // Super admin — no org
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'superadmin@platform.com',
      passwordHash: pw,
      firstName: 'Platform',
      lastName: 'Admin',
      isEmailVerified: true,
      isActive: true,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdminUser.id, roleId: roleMap['SUPER_ADMIN'].id } },
    update: {},
    create: { id: uuid(), userId: superAdminUser.id, roleId: roleMap['SUPER_ADMIN'].id },
  });

  const orgAdminUser    = await upsertUser({ email: 'principal@sunrise.edu',   firstName: 'Diana',  lastName: 'Patel' },    'ORG_ADMIN');
  const branchAdminUser = await upsertUser({ email: 'branchadmin@sunrise.edu', firstName: 'Marcus', lastName: 'Chen' },     'BRANCH_ADMIN');
  const teacherUser     = await upsertUser({ email: 'teacher@sunrise.edu',     firstName: 'Sarah',  lastName: 'Kowalski' }, 'TEACHER');
  const guideUser       = await upsertUser({ email: 'guide@sunrise.edu',       firstName: 'Thomas', lastName: 'Reyes' },    'GUIDE');
  const financeUser     = await upsertUser({ email: 'finance@sunrise.edu',     firstName: 'Priya',  lastName: 'Sharma' },   'FINANCE_STAFF');
  const hrUser          = await upsertUser({ email: 'hr@sunrise.edu',          firstName: 'James',  lastName: 'OBrien' },   'HR_STAFF');
  const frontDeskUser   = await upsertUser({ email: 'frontdesk@sunrise.edu',   firstName: 'Lily',   lastName: 'Zhang' },    'FRONT_DESK');

  // Parents
  const parent1User = await upsertUser({ email: 'parent1@example.com', firstName: 'Robert', lastName: 'Johnson' }, 'PARENT');
  const parent2User = await upsertUser({ email: 'parent2@example.com', firstName: 'Emily',  lastName: 'Johnson' }, 'PARENT');
  const parent3User = await upsertUser({ email: 'parent3@example.com', firstName: 'Carlos', lastName: 'Rivera'  }, 'PARENT');

  // Student user (older student with own login)
  const studentUser = await upsertUser({ email: 'student@sunrise.edu', firstName: 'Alex', lastName: 'Johnson' }, 'STUDENT');

  // ── 6. Academic Year ──────────────────────────────────────────────────────────
  console.log('  → Academic Year');

  const academicYear = await prisma.academicYear.upsert({
    where: { organizationId_name: { organizationId: org.id, name: '2024–2025' } },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      name: '2024–2025',
      startDate: new Date('2024-08-26'),
      endDate: new Date('2025-06-13'),
      isCurrent: true,
    },
  });

  // ── 7. Classrooms ─────────────────────────────────────────────────────────────
  console.log('  → Classrooms');

  let sunflowerRoom = await prisma.classroom.findFirst({
    where: { organizationId: org.id, name: 'Sunflower Room' },
  });
  if (!sunflowerRoom) {
    sunflowerRoom = await prisma.classroom.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        branchId: mainBranch.id,
        academicYearId: academicYear.id,
        name: 'Sunflower Room',
        ageGroupMin: 3.0,
        ageGroupMax: 6.0,
        capacity: 20,
        roomNumber: 'A1',
      },
    });
  }

  let oakRoom = await prisma.classroom.findFirst({
    where: { organizationId: org.id, name: 'Oak Room' },
  });
  if (!oakRoom) {
    oakRoom = await prisma.classroom.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        branchId: mainBranch.id,
        academicYearId: academicYear.id,
        name: 'Oak Room',
        ageGroupMin: 6.0,
        ageGroupMax: 9.0,
        capacity: 18,
        roomNumber: 'B1',
      },
    });
  }

  // ── 8. Staff ──────────────────────────────────────────────────────────────────
  console.log('  → Staff records');

  const teacherStaff = await prisma.staff.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      branchId: mainBranch.id,
      userId: teacherUser.id,
      employeeNumber: 'EMP-001',
      jobTitle: 'Lead Teacher',
      department: 'Primary',
      employmentType: 'FULL_TIME',
      startDate: new Date('2022-08-01'),
      salary: 55000,
      currency: 'USD',
      qualifications: ['B.Ed', 'Montessori AMI Diploma'],
      isActive: true,
    },
  });

  const guideStaff = await prisma.staff.upsert({
    where: { userId: guideUser.id },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      branchId: mainBranch.id,
      userId: guideUser.id,
      employeeNumber: 'EMP-002',
      jobTitle: 'Montessori Guide',
      department: 'Primary',
      employmentType: 'FULL_TIME',
      startDate: new Date('2023-01-09'),
      salary: 52000,
      currency: 'USD',
      qualifications: ['B.A. Early Childhood Education', 'AMS Credential'],
      isActive: true,
    },
  });

  await prisma.classroomStaff.upsert({
    where: { classroomId_staffId: { classroomId: sunflowerRoom.id, staffId: teacherStaff.id } },
    update: {},
    create: { id: uuid(), classroomId: sunflowerRoom.id, staffId: teacherStaff.id, isPrimary: true },
  });

  await prisma.classroomStaff.upsert({
    where: { classroomId_staffId: { classroomId: oakRoom.id, staffId: guideStaff.id } },
    update: {},
    create: { id: uuid(), classroomId: oakRoom.id, staffId: guideStaff.id, isPrimary: true },
  });

  // ── 9. Leave Requests ─────────────────────────────────────────────────────────
  console.log('  → Leave Requests (approved + pending)');

  const existingLeaves = await prisma.leaveRequest.findMany({
    where: { organizationId: org.id, staffId: teacherStaff.id },
  });

  if (existingLeaves.length === 0) {
    // Approved past leave
    await prisma.leaveRequest.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        staffId: teacherStaff.id,
        leaveType: 'ANNUAL',
        startDate: daysAgo(20),
        endDate: daysAgo(16),
        totalDays: 5,
        reason: 'Family vacation',
        status: 'APPROVED',
        approvedByUserId: orgAdminUser.id,
        approvedAt: daysAgo(25),
      },
    });

    // Pending future leave
    await prisma.leaveRequest.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        staffId: guideStaff.id,
        leaveType: 'SICK',
        startDate: daysFromNow(3),
        endDate: daysFromNow(5),
        totalDays: 3,
        reason: 'Medical procedure',
        status: 'PENDING',
      },
    });
  }

  // ── 10. Payroll ───────────────────────────────────────────────────────────────
  console.log('  → Payroll');

  await prisma.payroll.upsert({
    where: { staffId_year_month: { staffId: teacherStaff.id, year: 2024, month: 10 } },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      staffId: teacherStaff.id,
      month: 10,
      year: 2024,
      baseSalary: 4583.33,
      allowances: 200.00,
      deductions: 550.00,
      netPay: 4233.33,
      currency: 'USD',
      status: 'PAID',
      processedAt: new Date('2024-10-31'),
    },
  });

  await prisma.payroll.upsert({
    where: { staffId_year_month: { staffId: guideStaff.id, year: 2024, month: 10 } },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      staffId: guideStaff.id,
      month: 10,
      year: 2024,
      baseSalary: 4333.33,
      allowances: 150.00,
      deductions: 520.00,
      netPay: 3963.33,
      currency: 'USD',
      status: 'PENDING',
    },
  });

  // ── 11. Curriculum & Milestones ───────────────────────────────────────────────
  console.log('  → Curriculum, Areas & Milestones');

  let curriculum = await prisma.curriculum.findFirst({
    where: { organizationId: org.id, name: 'AMI Primary 3–6' },
  });
  if (!curriculum) {
    curriculum = await prisma.curriculum.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        name: 'AMI Primary 3–6',
        description: 'Authentic Montessori curriculum for ages 3–6',
        isDefault: true,
      },
    });
  }

  const areaDefs = [
    { name: 'Practical Life', colorHex: '#5C7A5A', iconName: 'broom',      sortOrder: 1 },
    { name: 'Sensorial',      colorHex: '#E3A83D', iconName: 'eye',         sortOrder: 2 },
    { name: 'Language',       colorHex: '#3E4C8C', iconName: 'book-open',   sortOrder: 3 },
    { name: 'Mathematics',    colorHex: '#C1694F', iconName: 'calculator',  sortOrder: 4 },
    { name: 'Culture',        colorHex: '#3E6FA8', iconName: 'globe',       sortOrder: 5 },
  ];

  const areaMap = {};
  for (const ad of areaDefs) {
    let area = await prisma.curriculumArea.findFirst({
      where: { curriculumId: curriculum.id, name: ad.name },
    });
    if (!area) {
      area = await prisma.curriculumArea.create({
        data: { id: uuid(), curriculumId: curriculum.id, ...ad },
      });
    }
    areaMap[ad.name] = area;
  }

  const milestoneDefs = {
    'Practical Life': [
      { title: 'Pouring (water, dry)',             ageGroupMin: 2.5, ageGroupMax: 3.5, sortOrder: 1 },
      { title: 'Dressing frames (button, zipper)', ageGroupMin: 3.0, ageGroupMax: 4.5, sortOrder: 2 },
      { title: 'Table scrubbing',                  ageGroupMin: 3.5, ageGroupMax: 5.0, sortOrder: 3 },
    ],
    'Sensorial': [
      { title: 'Pink Tower — 10-cube series',      ageGroupMin: 2.5, ageGroupMax: 4.0, sortOrder: 1 },
      { title: 'Color tablets — box 2',            ageGroupMin: 3.0, ageGroupMax: 4.5, sortOrder: 2 },
      { title: 'Binomial cube',                    ageGroupMin: 4.5, ageGroupMax: 6.0, sortOrder: 3 },
    ],
    'Language': [
      { title: 'Sandpaper letters (lowercase)',    ageGroupMin: 3.0, ageGroupMax: 4.5, sortOrder: 1 },
      { title: 'Moveable alphabet — CVC words',    ageGroupMin: 4.0, ageGroupMax: 5.5, sortOrder: 2 },
      { title: 'First reading — three-letter CVC', ageGroupMin: 4.5, ageGroupMax: 6.0, sortOrder: 3 },
    ],
    'Mathematics': [
      { title: 'Number rods 1–10',                 ageGroupMin: 3.0, ageGroupMax: 4.0, sortOrder: 1 },
      { title: 'Spindle box (concept of 0)',        ageGroupMin: 3.5, ageGroupMax: 4.5, sortOrder: 2 },
      { title: 'Golden bead — introduction to 1000', ageGroupMin: 4.5, ageGroupMax: 6.0, sortOrder: 3 },
    ],
    'Culture': [
      { title: 'Continent globe',                  ageGroupMin: 3.0, ageGroupMax: 4.5, sortOrder: 1 },
      { title: 'Land and water forms',             ageGroupMin: 4.0, ageGroupMax: 5.5, sortOrder: 2 },
      { title: 'Parts of a plant',                 ageGroupMin: 4.5, ageGroupMax: 6.0, sortOrder: 3 },
    ],
  };

  const milestoneMap = {};
  for (const [areaName, mds] of Object.entries(milestoneDefs)) {
    milestoneMap[areaName] = [];
    for (const md of mds) {
      let m = await prisma.milestone.findFirst({
        where: { curriculumAreaId: areaMap[areaName].id, title: md.title },
      });
      if (!m) {
        m = await prisma.milestone.create({
          data: { id: uuid(), curriculumAreaId: areaMap[areaName].id, ...md },
        });
      }
      milestoneMap[areaName].push(m);
    }
  }

  // ── 12. Materials ─────────────────────────────────────────────────────────────
  console.log('  → Materials');

  const materialDefs = [
    { name: 'Pink Tower',           description: '10 pink cubes graduated in size',         ageGroupMin: 2.5, ageGroupMax: 4.0 },
    { name: 'Sandpaper Letters',    description: 'Lower-case sandpaper letters on boards',  ageGroupMin: 3.0, ageGroupMax: 5.0 },
    { name: 'Golden Bead Material', description: 'Decimal system bead material',            ageGroupMin: 4.5, ageGroupMax: 6.5 },
    { name: 'Number Rods',          description: 'Red and blue graduated number rods',      ageGroupMin: 3.0, ageGroupMax: 4.5 },
    { name: 'Moveable Alphabet',    description: 'Wooden letters for word building',        ageGroupMin: 4.0, ageGroupMax: 6.0 },
    { name: 'Binomial Cube',        description: 'Three-dimensional algebraic cube',        ageGroupMin: 4.5, ageGroupMax: 6.5 },
  ];

  const materials = [];
  for (const md of materialDefs) {
    let m = await prisma.material.findFirst({ where: { organizationId: org.id, name: md.name } });
    if (!m) {
      m = await prisma.material.create({ data: { id: uuid(), organizationId: org.id, ...md } });
    }
    materials.push(m);
  }

  // ── 13. Students ──────────────────────────────────────────────────────────────
  console.log('  → Students');

  let alexStudent = await prisma.student.findFirst({
    where: { organizationId: org.id, studentNumber: 'STU-001' },
  });
  if (!alexStudent) {
    alexStudent = await prisma.student.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        userId: studentUser.id,
        studentNumber: 'STU-001',
        firstName: 'Alex',
        lastName: 'Johnson',
        dateOfBirth: new Date('2019-03-15'),
        gender: 'MALE',
        qrCode: `QR-STU-001-${org.id.slice(0, 8)}`,
        isActive: true,
      },
    });
  }

  let sofiaStudent = await prisma.student.findFirst({
    where: { organizationId: org.id, studentNumber: 'STU-002' },
  });
  if (!sofiaStudent) {
    sofiaStudent = await prisma.student.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        studentNumber: 'STU-002',
        firstName: 'Sofia',
        lastName: 'Rivera',
        dateOfBirth: new Date('2020-07-22'),
        gender: 'FEMALE',
        qrCode: `QR-STU-002-${org.id.slice(0, 8)}`,
        isActive: true,
      },
    });
  }

  let liamStudent = await prisma.student.findFirst({
    where: { organizationId: org.id, studentNumber: 'STU-003' },
  });
  if (!liamStudent) {
    liamStudent = await prisma.student.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        studentNumber: 'STU-003',
        firstName: 'Liam',
        lastName: 'Chen',
        dateOfBirth: new Date('2018-11-05'),
        gender: 'MALE',
        qrCode: `QR-STU-003-${org.id.slice(0, 8)}`,
        isActive: true,
      },
    });
  }

  // Medical info for Alex (nut allergy edge case)
  await prisma.medicalInfo.upsert({
    where: { studentId: alexStudent.id },
    update: {},
    create: {
      id: uuid(),
      studentId: alexStudent.id,
      allergies: ['Peanuts', 'Tree nuts'],
      conditions: ['Mild asthma'],
      medications: 'Salbutamol inhaler (as needed)',
      doctorName: 'Dr. Patricia Moore',
      doctorPhone: '+1-555-0200',
    },
  });

  // Emergency contact
  const ecExists = await prisma.emergencyContact.findFirst({ where: { studentId: alexStudent.id } });
  if (!ecExists) {
    await prisma.emergencyContact.create({
      data: {
        id: uuid(),
        studentId: alexStudent.id,
        name: 'Grandma Susan Johnson',
        relationship: 'Grandmother',
        phone: '+1-555-0201',
      },
    });
  }

  // ── 14. Guardians — TWO guardians for Alex (edge case) ───────────────────────
  console.log('  → Guardians (two-guardian edge case for Alex)');

  const guardian1 = await prisma.guardian.upsert({
    where: { userId: parent1User.id },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      userId: parent1User.id,
      firstName: 'Robert',
      lastName: 'Johnson',
      relationship: 'Father',
      phone: '+1-555-0300',
      email: parent1User.email,
      occupation: 'Software Engineer',
    },
  });

  const guardian2 = await prisma.guardian.upsert({
    where: { userId: parent2User.id },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      userId: parent2User.id,
      firstName: 'Emily',
      lastName: 'Johnson',
      relationship: 'Mother',
      phone: '+1-555-0301',
      email: parent2User.email,
      occupation: 'High School Teacher',
    },
  });

  const guardian3 = await prisma.guardian.upsert({
    where: { userId: parent3User.id },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      userId: parent3User.id,
      firstName: 'Carlos',
      lastName: 'Rivera',
      relationship: 'Father',
      phone: '+1-555-0302',
      email: parent3User.email,
      occupation: 'Architect',
    },
  });

  // Alex has TWO guardians (primary father, secondary mother)
  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: alexStudent.id, guardianId: guardian1.id } },
    update: {},
    create: { id: uuid(), studentId: alexStudent.id, guardianId: guardian1.id, isPrimary: true,  canPickup: true },
  });
  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: alexStudent.id, guardianId: guardian2.id } },
    update: {},
    create: { id: uuid(), studentId: alexStudent.id, guardianId: guardian2.id, isPrimary: false, canPickup: true },
  });

  // Sofia has one guardian
  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: sofiaStudent.id, guardianId: guardian3.id } },
    update: {},
    create: { id: uuid(), studentId: sofiaStudent.id, guardianId: guardian3.id, isPrimary: true, canPickup: true },
  });

  // ── 15. Enrollments ───────────────────────────────────────────────────────────
  console.log('  → Enrollments');

  const enrollmentPairs = [
    [alexStudent, sunflowerRoom],
    [sofiaStudent, sunflowerRoom],
    [liamStudent, oakRoom],
  ];
  for (const [student, classroom] of enrollmentPairs) {
    await prisma.enrollment.upsert({
      where: {
        studentId_classroomId_academicYearId: {
          studentId: student.id,
          classroomId: classroom.id,
          academicYearId: academicYear.id,
        },
      },
      update: {},
      create: {
        id: uuid(),
        organizationId: org.id,
        studentId: student.id,
        classroomId: classroom.id,
        academicYearId: academicYear.id,
        status: 'ACTIVE',
        enrolledAt: new Date('2024-08-26'),
      },
    });
  }

  // ── 16. Lesson Plan ───────────────────────────────────────────────────────────
  console.log('  → Lesson Plans');

  let lessonPlan = await prisma.lessonPlan.findFirst({
    where: { organizationId: org.id, title: 'Introduction to Pouring' },
  });
  if (!lessonPlan) {
    lessonPlan = await prisma.lessonPlan.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        classroomId: sunflowerRoom.id,
        academicYearId: academicYear.id,
        curriculumAreaId: areaMap['Practical Life'].id,
        createdByStaffId: teacherStaff.id,
        title: 'Introduction to Pouring',
        objectives: 'Develop hand-eye coordination and concentration through precise liquid transfer.',
        instructions: '1. Prepare two identical pitchers half-full of water.\n2. Demonstrate slow, deliberate pouring.\n3. Invite child to try.\n4. Clean up spills together as part of the lesson.',
        notes: 'Use blue-tinted water for visual clarity.',
        ageGroupMin: 3.0,
        ageGroupMax: 4.5,
        scheduledDate: daysFromNow(2),
        durationMinutes: 20,
        status: 'PUBLISHED',
      },
    });
    await prisma.lessonPlanMaterial.create({
      data: { id: uuid(), lessonPlanId: lessonPlan.id, materialId: materials[0].id, quantity: 2 },
    });
  }

  // ── 17. Observations ──────────────────────────────────────────────────────────
  console.log('  → Observations');

  const existingObs = await prisma.observation.findMany({ where: { organizationId: org.id } });
  if (existingObs.length === 0) {
    const obsDefs = [
      { studentId: alexStudent.id,  area: 'Practical Life', note: 'Alex independently completed the full pouring cycle without spilling. Showed excellent concentration for over 8 minutes.', mastery: 'MASTERED',   days: 3 },
      { studentId: alexStudent.id,  area: 'Sensorial',       note: 'Worked with Pink Tower — placed cubes correctly but occasionally needed prompting for the largest cube.', mastery: 'PRACTICING',  days: 7 },
      { studentId: alexStudent.id,  area: 'Language',        note: 'Introduced sandpaper letters a, m, s. Alex traced all three and verbalized sounds correctly.', mastery: 'INTRODUCED',  days: 10 },
      { studentId: sofiaStudent.id, area: 'Practical Life',  note: 'Sofia is still learning to grip the pitcher with two hands. Will repeat presentation next session.', mastery: 'PRACTICING',  days: 2 },
      { studentId: sofiaStudent.id, area: 'Mathematics',     note: 'Counted rods 1–5 accurately and matched quantity to number symbol.', mastery: 'PRACTICING',  days: 5 },
      { studentId: liamStudent.id,  area: 'Mathematics',     note: 'Liam independently assembled the golden bead 1000 cube. Exceptional focus and precision.', mastery: 'EXTENDING',   days: 1 },
    ];
    for (const od of obsDefs) {
      await prisma.observation.create({
        data: {
          id: uuid(),
          organizationId: org.id,
          studentId: od.studentId,
          staffId: teacherStaff.id,
          curriculumAreaId: areaMap[od.area].id,
          milestoneId: milestoneMap[od.area]?.[0]?.id ?? null,
          note: od.note,
          masteryLevel: od.mastery,
          observedAt: daysAgo(od.days),
        },
      });
    }
  }

  // ── 18. Student Progress (all 5 mastery levels represented) ──────────────────
  console.log('  → Student Progress (all mastery levels)');

  const progressDefs = [
    { studentId: alexStudent.id,  area: 'Practical Life', mi: 0, mastery: 'MASTERED' },
    { studentId: alexStudent.id,  area: 'Practical Life', mi: 1, mastery: 'PRACTICING' },
    { studentId: alexStudent.id,  area: 'Sensorial',      mi: 0, mastery: 'PRACTICING' },
    { studentId: alexStudent.id,  area: 'Language',       mi: 0, mastery: 'INTRODUCED' },
    { studentId: alexStudent.id,  area: 'Mathematics',    mi: 0, mastery: 'NOT_INTRODUCED' },
    { studentId: alexStudent.id,  area: 'Culture',        mi: 0, mastery: 'EXTENDING' },
    { studentId: sofiaStudent.id, area: 'Practical Life', mi: 0, mastery: 'PRACTICING' },
    { studentId: sofiaStudent.id, area: 'Mathematics',    mi: 0, mastery: 'PRACTICING' },
    { studentId: liamStudent.id,  area: 'Mathematics',    mi: 2, mastery: 'EXTENDING' },
    { studentId: liamStudent.id,  area: 'Language',       mi: 2, mastery: 'MASTERED' },
  ];

  for (const pd of progressDefs) {
    const milestone = milestoneMap[pd.area]?.[pd.mi];
    if (!milestone) continue;
    await prisma.studentProgress.upsert({
      where: { studentId_milestoneId: { studentId: pd.studentId, milestoneId: milestone.id } },
      update: { masteryLevel: pd.mastery },
      create: {
        id: uuid(),
        organizationId: org.id,
        studentId: pd.studentId,
        curriculumAreaId: areaMap[pd.area].id,
        milestoneId: milestone.id,
        masteryLevel: pd.mastery,
      },
    });
  }

  // ── 19. Attendance Records ────────────────────────────────────────────────────
  console.log('  → Attendance Records');

  for (let i = 5; i >= 1; i--) {
    const date = dateOnly(daysAgo(i));
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    for (const [student, classroom] of [
      [alexStudent, sunflowerRoom],
      [sofiaStudent, sunflowerRoom],
    ]) {
      // Sofia absent on day 4
      if (student.id === sofiaStudent.id && i === 4) {
        await prisma.attendanceRecord.upsert({
          where: { studentId_date_checkType: { studentId: student.id, date, checkType: 'CHECK_IN' } },
          update: {},
          create: {
            id: uuid(),
            organizationId: org.id,
            studentId: student.id,
            classroomId: classroom.id,
            date,
            checkType: 'CHECK_IN',
            method: 'MANUAL',
            status: 'ABSENT',
            markedByUserId: teacherUser.id,
          },
        });
        continue;
      }

      // Alex late on day 2
      const isLate = student.id === alexStudent.id && i === 2;
      const checkInOffset = isLate ? 35 * 60000 : 10 * 60000;

      await prisma.attendanceRecord.upsert({
        where: { studentId_date_checkType: { studentId: student.id, date, checkType: 'CHECK_IN' } },
        update: {},
        create: {
          id: uuid(),
          organizationId: org.id,
          studentId: student.id,
          classroomId: classroom.id,
          date,
          checkInAt: new Date(date.getTime() + 8 * 3600000 + checkInOffset),
          checkType: 'CHECK_IN',
          method: 'QR',
          status: isLate ? 'LATE' : 'PRESENT',
          markedByUserId: frontDeskUser.id,
        },
      });
    }
  }

  // Attendance summary for Alex — current month
  const now = new Date();
  await prisma.attendanceSummary.upsert({
    where: {
      studentId_classroomId_year_month: {
        studentId: alexStudent.id,
        classroomId: sunflowerRoom.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    },
    update: {},
    create: {
      id: uuid(),
      organizationId: org.id,
      studentId: alexStudent.id,
      classroomId: sunflowerRoom.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      presentDays: 18,
      absentDays: 0,
      lateDays: 1,
      excusedDays: 0,
      totalDays: 19,
      attendanceRate: 94.7,
    },
  });

  // ── 20. Finance ───────────────────────────────────────────────────────────────
  console.log('  → Finance: Fee Structures, Invoices, Payments');

  let tuitionFee = await prisma.feeStructure.findFirst({
    where: { organizationId: org.id, name: 'Primary Program — Monthly Tuition' },
  });
  if (!tuitionFee) {
    tuitionFee = await prisma.feeStructure.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        name: 'Primary Program — Monthly Tuition',
        description: 'Monthly tuition fee for Primary (3–6) program',
        amount: 1200.00,
        currency: 'USD',
        frequency: 'MONTHLY',
        isActive: true,
      },
    });
  }

  let registrationFee = await prisma.feeStructure.findFirst({
    where: { organizationId: org.id, name: 'Annual Registration Fee' },
  });
  if (!registrationFee) {
    registrationFee = await prisma.feeStructure.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        name: 'Annual Registration Fee',
        description: 'One-time annual registration and materials fee',
        amount: 350.00,
        currency: 'USD',
        frequency: 'ANNUALLY',
        isActive: true,
      },
    });
  }

  // Paid invoice for Alex
  let paidInvoice = await prisma.invoice.findFirst({
    where: { organizationId: org.id, invoiceNumber: 'INV-2024-001' },
  });
  if (!paidInvoice) {
    paidInvoice = await prisma.invoice.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        studentId: alexStudent.id,
        invoiceNumber: 'INV-2024-001',
        issueDate: daysAgo(30),
        dueDate: daysAgo(15),
        totalAmount: 1200.00,
        paidAmount: 1200.00,
        currency: 'USD',
        status: 'PAID',
      },
    });
    await prisma.invoiceLineItem.create({
      data: {
        id: uuid(),
        invoiceId: paidInvoice.id,
        feeStructureId: tuitionFee.id,
        description: 'Monthly Tuition — September 2024',
        quantity: 1,
        unitPrice: 1200.00,
        totalPrice: 1200.00,
      },
    });
    await prisma.payment.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        invoiceId: paidInvoice.id,
        amount: 1200.00,
        currency: 'USD',
        status: 'COMPLETED',
        referenceNumber: 'TXN-20240915-001',
        paidAt: daysAgo(14),
      },
    });
  }

  // OVERDUE invoice for Sofia — edge case
  let overdueInvoice = await prisma.invoice.findFirst({
    where: { organizationId: org.id, invoiceNumber: 'INV-2024-002' },
  });
  if (!overdueInvoice) {
    overdueInvoice = await prisma.invoice.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        studentId: sofiaStudent.id,
        invoiceNumber: 'INV-2024-002',
        issueDate: daysAgo(45),
        dueDate: daysAgo(15),
        totalAmount: 1550.00,
        paidAmount: 0,
        currency: 'USD',
        status: 'OVERDUE',
        notes: 'Second reminder sent. Please contact parent Carlos Rivera.',
      },
    });
    await prisma.invoiceLineItem.createMany({
      data: [
        {
          id: uuid(),
          invoiceId: overdueInvoice.id,
          feeStructureId: tuitionFee.id,
          description: 'Monthly Tuition — October 2024',
          quantity: 1,
          unitPrice: 1200.00,
          totalPrice: 1200.00,
        },
        {
          id: uuid(),
          invoiceId: overdueInvoice.id,
          feeStructureId: registrationFee.id,
          description: 'Annual Registration Fee 2024–2025',
          quantity: 1,
          unitPrice: 350.00,
          totalPrice: 350.00,
        },
      ],
    });
  }

  // Expense record
  const expenseExists = await prisma.expense.findFirst({ where: { organizationId: org.id } });
  if (!expenseExists) {
    await prisma.expense.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        branchId: mainBranch.id,
        category: 'SUPPLIES',
        description: 'Classroom materials restock — Q4 2024',
        amount: 840.50,
        currency: 'USD',
        expenseDate: daysAgo(10),
        approvedByUserId: orgAdminUser.id,
      },
    });
  }

  // ── 21. Inventory ─────────────────────────────────────────────────────────────
  console.log('  → Inventory (including low-stock edge case)');

  let invCategory = await prisma.inventoryCategory.findFirst({
    where: { organizationId: org.id, name: 'Montessori Materials' },
  });
  if (!invCategory) {
    invCategory = await prisma.inventoryCategory.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        name: 'Montessori Materials',
        description: 'Core Montessori classroom apparatus',
      },
    });
  }

  let supplier = await prisma.supplier.findFirst({
    where: { organizationId: org.id, name: 'Nienhuis Montessori USA' },
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        name: 'Nienhuis Montessori USA',
        contactName: 'Sales Team',
        email: 'sales@nienhuis.com',
        phone: '+1-800-555-0400',
        website: 'https://www.nienhuis.com',
        isActive: true,
      },
    });
  }

  // Normal stock
  const pinkTowerExists = await prisma.inventoryItem.findFirst({
    where: { organizationId: org.id, sku: 'NM-PT-001' },
  });
  if (!pinkTowerExists) {
    const pinkTowerItem = await prisma.inventoryItem.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        branchId: mainBranch.id,
        categoryId: invCategory.id,
        supplierId: supplier.id,
        materialId: materials[0].id,
        name: 'Pink Tower — 10 Cubes Set',
        sku: 'NM-PT-001',
        currentStock: 3,
        minimumStock: 2,
        reorderPoint: 3,
        unitCost: 189.00,
        location: 'Sunflower Room, Shelf A',
        inClassroomUse: true,
        isActive: true,
      },
    });
    await prisma.stockMovement.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        inventoryItemId: pinkTowerItem.id,
        type: 'PURCHASE',
        quantity: 3,
        stockBefore: 0,
        stockAfter: 3,
        notes: 'Initial stock purchase',
        performedByUserId: financeUser.id,
      },
    });
  }

  // LOW-STOCK item — edge case (currentStock < minimumStock)
  const sandpaperExists = await prisma.inventoryItem.findFirst({
    where: { organizationId: org.id, sku: 'NM-SL-002' },
  });
  if (!sandpaperExists) {
    const sandpaperItem = await prisma.inventoryItem.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        branchId: mainBranch.id,
        categoryId: invCategory.id,
        supplierId: supplier.id,
        materialId: materials[1].id,
        name: 'Sandpaper Letters — Lowercase Set',
        sku: 'NM-SL-002',
        currentStock: 1,      // ← BELOW minimumStock of 5 → triggers alert
        minimumStock: 5,
        reorderPoint: 8,
        unitCost: 129.00,
        location: 'Sunflower Room, Shelf B',
        inClassroomUse: true,
        replacementDue: daysFromNow(30),
        isActive: true,
      },
    });
    await prisma.stockMovement.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        inventoryItemId: sandpaperItem.id,
        type: 'USAGE',
        quantity: -4,
        stockBefore: 5,
        stockAfter: 1,
        notes: 'Consumed during classroom use — letters worn',
        performedByUserId: teacherUser.id,
      },
    });
  }

  // ── 22. Badges & Gamification ─────────────────────────────────────────────────
  console.log('  → Gamification: Badges, Points, Streaks, Leaderboard');

  const badgeDefs = [
    { name: 'First Steps',     description: 'Completed first Practical Life activity independently', colorHex: '#5C7A5A', points: 10 },
    { name: 'Word Builder',    description: 'Built first word using the Moveable Alphabet',          colorHex: '#3E4C8C', points: 20 },
    { name: 'Math Whiz',       description: 'Mastered Number Rods 1–10',                            colorHex: '#C1694F', points: 25 },
    { name: 'Golden Achiever', description: 'Worked independently with Golden Bead Material',       colorHex: '#E3A83D', points: 50 },
    { name: 'Attendance Star', description: 'Perfect attendance for a full calendar month',         colorHex: '#E3A83D', points: 15 },
  ];

  const badges = [];
  for (const bd of badgeDefs) {
    let b = await prisma.badge.findFirst({ where: { organizationId: org.id, name: bd.name } });
    if (!b) {
      b = await prisma.badge.create({ data: { id: uuid(), organizationId: org.id, ...bd } });
    }
    badges.push(b);
  }

  // Award 'First Steps' to Alex
  await prisma.studentBadge.upsert({
    where: { studentId_badgeId: { studentId: alexStudent.id, badgeId: badges[0].id } },
    update: {},
    create: {
      id: uuid(),
      studentId: alexStudent.id,
      badgeId: badges[0].id,
      milestoneId: milestoneMap['Practical Life'][0].id,
      awardedByUserId: teacherUser.id,
      note: 'Completed full pouring cycle completely independently!',
    },
  });

  // Award 'Golden Achiever' to Liam
  await prisma.studentBadge.upsert({
    where: { studentId_badgeId: { studentId: liamStudent.id, badgeId: badges[3].id } },
    update: {},
    create: {
      id: uuid(),
      studentId: liamStudent.id,
      badgeId: badges[3].id,
      milestoneId: milestoneMap['Mathematics'][2].id,
      awardedByUserId: guideUser.id,
      note: 'Outstanding work with the 1000-cube!',
    },
  });

  // Points ledger
  const pointsExist = await prisma.pointsLedger.findFirst({ where: { studentId: alexStudent.id } });
  if (!pointsExist) {
    await prisma.pointsLedger.createMany({
      data: [
        { id: uuid(), studentId: alexStudent.id, points: 10, reason: 'Badge awarded: First Steps',  referenceType: 'Badge', referenceId: badges[0].id },
        { id: uuid(), studentId: alexStudent.id, points: 5,  reason: 'Observation milestone reached', referenceType: 'Observation' },
      ],
    });
    await prisma.pointsLedger.createMany({
      data: [
        { id: uuid(), studentId: liamStudent.id, points: 50, reason: 'Badge awarded: Golden Achiever', referenceType: 'Badge', referenceId: badges[3].id },
      ],
    });
  }

  // Streaks
  await prisma.streak.upsert({
    where: { studentId_type: { studentId: alexStudent.id, type: 'ATTENDANCE' } },
    update: { currentStreak: 12, longestStreak: 15, lastActivityDate: new Date() },
    create: { id: uuid(), studentId: alexStudent.id, type: 'ATTENDANCE', currentStreak: 12, longestStreak: 15, lastActivityDate: new Date() },
  });
  await prisma.streak.upsert({
    where: { studentId_type: { studentId: liamStudent.id, type: 'ATTENDANCE' } },
    update: { currentStreak: 20, longestStreak: 20, lastActivityDate: new Date() },
    create: { id: uuid(), studentId: liamStudent.id, type: 'ATTENDANCE', currentStreak: 20, longestStreak: 20, lastActivityDate: new Date() },
  });

  // Class-scoped Leaderboard for Sunflower Room
  const weekNum = Math.ceil(new Date().getDate() / 7);
  const weekKey = `${new Date().getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  const leaderboard = await prisma.leaderboard.upsert({
    where: { classroomId_period_periodKey: { classroomId: sunflowerRoom.id, period: 'WEEKLY', periodKey: weekKey } },
    update: {},
    create: { id: uuid(), classroomId: sunflowerRoom.id, period: 'WEEKLY', periodKey: weekKey },
  });

  await prisma.leaderboardEntry.upsert({
    where: { leaderboardId_studentId: { leaderboardId: leaderboard.id, studentId: alexStudent.id } },
    update: {},
    create: { id: uuid(), leaderboardId: leaderboard.id, studentId: alexStudent.id, points: 35, rank: 1 },
  });
  await prisma.leaderboardEntry.upsert({
    where: { leaderboardId_studentId: { leaderboardId: leaderboard.id, studentId: sofiaStudent.id } },
    update: {},
    create: { id: uuid(), leaderboardId: leaderboard.id, studentId: sofiaStudent.id, points: 22, rank: 2 },
  });

  // ── 23. Communication ─────────────────────────────────────────────────────────
  console.log('  → Announcements & Messages');

  const announcementExists = await prisma.announcement.findFirst({ where: { organizationId: org.id } });
  if (!announcementExists) {
    await prisma.announcement.createMany({
      data: [
        {
          id: uuid(),
          organizationId: org.id,
          classroomId: sunflowerRoom.id,
          createdByUserId: teacherUser.id,
          title: 'Autumn Showcase — Friday 3 PM',
          body: 'Dear families, join us this Friday at 3 PM for the Autumn Showcase in the Sunflower Room. Children will present their favourite work from the term.',
          isPinned: true,
          publishAt: new Date(),
        },
        {
          id: uuid(),
          organizationId: org.id,
          createdByUserId: orgAdminUser.id,
          title: 'School closed November 28 — Thanksgiving',
          body: 'Sunrise Montessori Academy will be closed Thursday, November 28. Classes resume Monday, December 2.',
          isPinned: false,
          publishAt: new Date(),
        },
      ],
    });

    await prisma.message.create({
      data: {
        id: uuid(),
        senderId: parent1User.id,
        recipientId: teacherUser.id,
        subject: 'Peanut allergy reminder for Alex',
        body: 'Hi Sarah, a gentle reminder that Alex has a severe peanut and tree nut allergy. Please ensure no nut products are present during snack time. Thank you!',
        status: 'READ',
        readAt: daysAgo(1),
      },
    });
  }

  // In-app notifications
  const notifExists = await prisma.notification.findFirst({ where: { organizationId: org.id } });
  if (!notifExists) {
    await prisma.notification.createMany({
      data: [
        {
          id: uuid(),
          organizationId: org.id,
          userId: parent1User.id,
          type: 'ATTENDANCE',
          title: 'Alex has arrived',
          body: 'Alex Johnson checked in at 8:10 AM',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: uuid(),
          organizationId: org.id,
          userId: parent3User.id,
          type: 'INVOICE',
          title: 'Invoice overdue — INV-2024-002',
          body: 'Invoice #INV-2024-002 for $1,550.00 is 15 days overdue.',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: uuid(),
          organizationId: org.id,
          userId: orgAdminUser.id,
          type: 'LOW_STOCK',
          title: 'Low stock: Sandpaper Letters',
          body: 'Sandpaper Letters — Lowercase Set is below minimum stock level (1 remaining, min 5).',
          isRead: false,
          createdAt: new Date(),
        },
      ],
    });
  }

  // ── 24. AI Insights ───────────────────────────────────────────────────────────
  console.log('  → AI Insights');

  const insightExists = await prisma.aIInsight.findFirst({ where: { organizationId: org.id } });
  if (!insightExists) {
    await prisma.aIInsight.createMany({
      data: [
        {
          id: uuid(),
          organizationId: org.id,
          classroomId: sunflowerRoom.id,
          studentId: sofiaStudent.id,
          type: 'ATTENDANCE_PATTERN',
          title: 'Attendance concern: Sofia Rivera',
          summary: 'Sofia Rivera has been absent 4 times this month — twice on Mondays. This pattern may indicate a recurring Monday scheduling conflict or general disengagement. Recommend a family check-in call before the next absence occurs.',
          rawStats: { absentCount: 4, consecutiveAbsences: 1, mostAbsentDay: 'Monday' },
          actionItems: ["Contact Carlos Rivera (parent) to discuss attendance", "Schedule a welfare check-in for next Monday"],
          isRead: false,
          generatedAt: daysAgo(1),
        },
        {
          id: uuid(),
          organizationId: org.id,
          classroomId: sunflowerRoom.id,
          type: 'CURRICULUM_GAP',
          title: 'Sensorial engagement declining in Sunflower Room',
          summary: '3 students in Sunflower Room have not had a Sensorial observation logged in over 2 weeks. The Pink Tower and color tablets may need to be re-presented with fresh introductions. Consider scheduling a dedicated Sensorial afternoon.',
          rawStats: { affectedStudents: 3, lastSensorialObservationDaysAgo: 16 },
          actionItems: ["Re-present Sensorial materials to identified students", "Schedule dedicated Sensorial afternoon block", "Review material placement and accessibility"],
          isRead: false,
          generatedAt: daysAgo(1),
        },
        {
          id: uuid(),
          organizationId: org.id,
          studentId: sofiaStudent.id,
          type: 'FEE_DELINQUENCY',
          title: 'Fee delinquency risk: Sofia Rivera',
          summary: 'Invoice INV-2024-002 for Sofia Rivera is 15 days overdue ($1,550.00). Parent has not responded to the first reminder. The risk of continued non-payment is elevated. Recommend a direct phone call from the finance team this week.',
          rawStats: { invoiceId: overdueInvoice.id, overdueAmountUsd: 1550, daysPastDue: 15 },
          actionItems: ["Call Carlos Rivera directly re: overdue invoice", "Offer a payment plan if needed", "Flag for principal review if no response by Friday"],
          isRead: false,
          generatedAt: daysAgo(1),
        },
        {
          id: uuid(),
          organizationId: org.id,
          classroomId: sunflowerRoom.id,
          studentId: alexStudent.id,
          type: 'DAY_REVIEW',
          title: "Alex's Day in Review — Monday",
          summary: "Alex had a wonderful day! He arrived on time and spent over 30 minutes in the Practical Life area, completing the pouring exercise independently — a real milestone moment that earned him his first badge. In Language, he traced sandpaper letters a, m, and s with great concentration. He also joined group singing time and was notably enthusiastic. A great day all around.",
          rawStats: { date: daysAgo(1), activitiesCompleted: 3, badgesEarned: 1 },
          actionItems: [],
          isRead: false,
          generatedAt: daysAgo(1),
        },
      ],
    });
  }

  // ── 25. Sync Queue & SyncLog — flagged conflict (edge case) ──────────────────
  console.log('  → Sync Queue & Conflict Log (conflict edge case)');

  const syncExists = await prisma.syncQueue.findFirst({ where: { organizationId: org.id } });
  if (!syncExists) {
    const syncEntry = await prisma.syncQueue.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        deviceId: 'tablet-sunflower-01',
        userId: teacherUser.id,
        entity: 'Observation',
        entityId: uuid(),
        operation: 'UPDATE',
        payload: {
          note: 'Offline edit: Alex completed pouring independently',
          masteryLevel: 'MASTERED',
          timestamp: daysAgo(1).toISOString(),
        },
        clientVersion: 2,
        status: 'CONFLICT',
        attempts: 1,
        lastAttemptAt: new Date(),
        errorMessage: 'Server version (3) is newer than client version (2). Manual resolution required.',
      },
    });

    // Corresponding conflict resolution log
    await prisma.syncLog.create({
      data: {
        id: uuid(),
        organizationId: org.id,
        syncQueueId: syncEntry.id,
        deviceId: 'tablet-sunflower-01',
        entity: 'Observation',
        entityId: syncEntry.entityId,
        operation: 'UPDATE',
        resolution: 'MANUAL',
        clientPayload: {
          note: 'Offline edit: Alex completed pouring independently',
          masteryLevel: 'MASTERED',
        },
        serverPayload: {
          note: 'Alex completed pouring — minor spill on last attempt',
          masteryLevel: 'PRACTICING',
        },
        resolvedPayload: null, // awaiting manual review
        resolvedByUserId: null,
        resolvedAt: null,
      },
    });
  }

  // ── 26. Audit Log ─────────────────────────────────────────────────────────────
  console.log('  → Audit Log');

  const auditExists = await prisma.auditLog.findFirst({ where: { organizationId: org.id } });
  if (!auditExists) {
    await prisma.auditLog.createMany({
      data: [
        {
          id: uuid(),
          organizationId: org.id,
          actorId: orgAdminUser.id,
          action: 'CREATE',
          entity: 'Student',
          entityId: alexStudent.id,
          changes: { after: { firstName: 'Alex', lastName: 'Johnson', studentNumber: 'STU-001' } },
          ipAddress: '192.168.1.10',
        },
        {
          id: uuid(),
          organizationId: org.id,
          actorId: financeUser.id,
          action: 'PAYMENT_EDIT',
          entity: 'Invoice',
          entityId: overdueInvoice.id,
          changes: { before: { status: 'SENT' }, after: { status: 'OVERDUE' } },
          ipAddress: '192.168.1.20',
        },
        {
          id: uuid(),
          organizationId: org.id,
          actorId: orgAdminUser.id,
          action: 'ROLE_CHANGE',
          entity: 'User',
          entityId: teacherUser.id,
          changes: { before: { role: 'FRONT_DESK' }, after: { role: 'TEACHER' } },
          ipAddress: '192.168.1.10',
        },
      ],
    });
  }

  // ── Done ──────────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!\n');
  console.log('Demo credentials (all passwords: Demo@1234)');
  console.log('─'.repeat(52));
  console.log('  superadmin@platform.com  →  SUPER_ADMIN');
  console.log('  principal@sunrise.edu    →  ORG_ADMIN');
  console.log('  branchadmin@sunrise.edu  →  BRANCH_ADMIN');
  console.log('  teacher@sunrise.edu      →  TEACHER');
  console.log('  guide@sunrise.edu        →  GUIDE');
  console.log('  finance@sunrise.edu      →  FINANCE_STAFF');
  console.log('  hr@sunrise.edu           →  HR_STAFF');
  console.log('  frontdesk@sunrise.edu    →  FRONT_DESK');
  console.log('  parent1@example.com      →  PARENT (Robert Johnson)');
  console.log('  parent2@example.com      →  PARENT (Emily Johnson, 2nd guardian)');
  console.log('  parent3@example.com      →  PARENT (Carlos Rivera)');
  console.log('  student@sunrise.edu      →  STUDENT (Alex Johnson)');
  console.log('─'.repeat(52));
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
