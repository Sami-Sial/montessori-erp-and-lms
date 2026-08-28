/**
 * aiInsightsWorker.js
 * Nightly BullMQ job that aggregates real school data per organization,
 * calls Grok to generate written insights, and persists them to AIInsight.
 *
 * Runs at 02:00 UTC daily (scheduled in queues.js).
 * Also generates per-student "Day in Review" digests for parents.
 */

import { Worker } from 'bullmq';
import { getBullMQConnection } from '../config/redis.js';
import prisma from '../config/db.js';
import { grokClient, GROK_MODEL } from '../config/grok.js';
import { generateDayReview } from '../modules/ai/ai-service.js';

let connection;
try {
  connection = getBullMQConnection();
} catch {
  console.warn('[AIInsightsWorker] Redis unavailable — worker not started');
}

// ─── Insight generators ────────────────────────────────────────────────────────

/**
 * Calls Grok to turn raw stats into a readable, specific insight.
 * Returns a written summary string.
 */
const generateInsightText = async (insightType, rawStats) => {
  if (!grokClient.apiKey) {
    return `[AI insights require GROK_API_KEY] Raw stats: ${JSON.stringify(rawStats)}`;
  }

  const prompts = {
    ATTENDANCE_PATTERN: `You are a school data analyst. Based on the following attendance data, write ONE specific, actionable insight (2–3 sentences) for the school principal. Focus on patterns, not just numbers. Name specific students if relevant.

Data: ${JSON.stringify(rawStats)}

Write the insight now:`,

    FEE_DELINQUENCY: `You are a school finance advisor. Based on the following fee delinquency data, write ONE specific, actionable insight (2–3 sentences) for the finance team. Be specific about amounts and which families to contact.

Data: ${JSON.stringify(rawStats)}

Write the insight now:`,

    CURRICULUM_GAP: `You are a Montessori curriculum specialist. Based on the following student progress data, write ONE specific, actionable insight (2–3 sentences) for the classroom teacher. Identify which curriculum areas need attention and suggest concrete next steps.

Data: ${JSON.stringify(rawStats)}

Write the insight now:`,

    ENGAGEMENT_TREND: `You are a Montessori educator. Based on the following engagement and observation data, write ONE specific, actionable insight (2–3 sentences) for the classroom guide. Note positive trends and areas for attention.

Data: ${JSON.stringify(rawStats)}

Write the insight now:`,
  };

  const prompt = prompts[insightType] ?? `Summarize this school data in 2–3 sentences: ${JSON.stringify(rawStats)}`;

  try {
    const response = await grokClient.chat.completions.create({
      model: GROK_MODEL,
      messages: [
        { role: 'system', content: 'You write clear, specific, actionable insights for Montessori school administrators and teachers. Always ground insights in the specific data provided.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 256,
    });
    return response.choices[0].message.content?.trim() ?? '';
  } catch (err) {
    console.error('[AIInsightsWorker] Grok API error:', err.message);
    return `Unable to generate AI summary. Raw data: ${JSON.stringify(rawStats).slice(0, 200)}`;
  }
};

// ─── Per-organisation insight generation ─────────────────────────────────────

const runInsightsForOrg = async (org) => {
  const orgId = org.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  // ── 1. Attendance patterns per classroom ─────────────────────────────────
  const classrooms = await prisma.classroom.findMany({
    where: { organizationId: orgId, isActive: true, deletedAt: null },
    select: { id: true, name: true },
  });

  for (const classroom of classrooms) {
    const records = await prisma.attendanceRecord.findMany({
      where: {
        organizationId: orgId,
        classroomId: classroom.id,
        date: { gte: thirtyDaysAgo },
        checkType: 'CHECK_IN',
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (records.length === 0) continue;

    // Students with attendance rate < 80%
    const byStudent = {};
    for (const r of records) {
      if (!byStudent[r.studentId]) byStudent[r.studentId] = { student: r.student, present: 0, total: 0, absent: 0 };
      byStudent[r.studentId].total++;
      if (r.status === 'PRESENT') byStudent[r.studentId].present++;
      else if (r.status === 'ABSENT') byStudent[r.studentId].absent++;
    }

    const atRisk = Object.values(byStudent).filter(
      (s) => s.total >= 5 && s.present / s.total < 0.8
    );

    if (atRisk.length > 0) {
      const rawStats = {
        classroom: classroom.name,
        period: '30 days',
        atRiskStudents: atRisk.map((s) => ({
          name: `${s.student.firstName} ${s.student.lastName}`,
          attendanceRate: Math.round((s.present / s.total) * 100),
          absentDays: s.absent,
          totalDays: s.total,
        })),
      };

      const summary = await generateInsightText('ATTENDANCE_PATTERN', rawStats);

      await prisma.aIInsight.create({
        data: {
          organizationId: orgId,
          classroomId: classroom.id,
          type: 'ATTENDANCE_PATTERN',
          title: `Attendance concern in ${classroom.name}`,
          summary,
          rawStats,
          actionItems: atRisk.map((s) => `Contact family of ${s.student.firstName} ${s.student.lastName} (${Math.round((s.present / s.total) * 100)}% attendance)`),
          isRead: false,
          generatedAt: now,
        },
      });
    }

    // ── 2. Curriculum gaps (areas with no observations in 2+ weeks) ───────
    const obsCount = await prisma.observation.groupBy({
      by: ['curriculumAreaId'],
      where: {
        organizationId: orgId,
        observedAt: { gte: sevenDaysAgo },
        deletedAt: null,
        student: { enrollments: { some: { classroomId: classroom.id, status: 'ACTIVE' } } },
      },
      _count: { id: true },
    });

    const allAreas = await prisma.curriculumArea.findMany({ select: { id: true, name: true } });
    const coveredAreaIds = new Set(obsCount.map((o) => o.curriculumAreaId));
    const uncoveredAreas = allAreas.filter((a) => !coveredAreaIds.has(a.id));

    if (uncoveredAreas.length >= 2) {
      const rawStats = {
        classroom: classroom.name,
        period: '7 days',
        uncoveredAreas: uncoveredAreas.map((a) => a.name),
        coveredAreas: allAreas.filter((a) => coveredAreaIds.has(a.id)).map((a) => a.name),
      };

      const summary = await generateInsightText('CURRICULUM_GAP', rawStats);

      await prisma.aIInsight.create({
        data: {
          organizationId: orgId,
          classroomId: classroom.id,
          type: 'CURRICULUM_GAP',
          title: `Curriculum gap detected in ${classroom.name}`,
          summary,
          rawStats,
          actionItems: uncoveredAreas.map((a) => `Schedule ${a.name} activities this week`),
          isRead: false,
          generatedAt: now,
        },
      });
    }
  }

  // ── 3. Fee delinquency risk ────────────────────────────────────────────
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['SENT', 'PARTIALLY_PAID'] },
      dueDate: { lt: now },
      deletedAt: null,
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
  });

  if (overdueInvoices.length > 0) {
    const totalOverdue = overdueInvoices.reduce(
      (sum, i) => sum + Number(i.totalAmount) - Number(i.paidAmount), 0
    );

    const rawStats = {
      overdueCount: overdueInvoices.length,
      totalOverdueAmount: totalOverdue.toFixed(2),
      currency: overdueInvoices[0]?.currency ?? 'USD',
      topOverdue: overdueInvoices.slice(0, 5).map((i) => ({
        invoiceNumber: i.invoiceNumber,
        student: `${i.student.firstName} ${i.student.lastName}`,
        amountDue: (Number(i.totalAmount) - Number(i.paidAmount)).toFixed(2),
        daysPastDue: Math.floor((now - new Date(i.dueDate)) / (24 * 3600 * 1000)),
      })),
    };

    const summary = await generateInsightText('FEE_DELINQUENCY', rawStats);

    await prisma.aIInsight.create({
      data: {
        organizationId: orgId,
        type: 'FEE_DELINQUENCY',
        title: `${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''} require attention`,
        summary,
        rawStats,
        actionItems: overdueInvoices.slice(0, 3).map(
          (i) => `Contact ${i.student.firstName} ${i.student.lastName}'s family re: ${i.invoiceNumber}`
        ),
        isRead: false,
        generatedAt: now,
      },
    });
  }

  // ── 4. Day-in-review digests ───────────────────────────────────────────
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const studentsWithActivity = await prisma.observation.findMany({
    where: {
      organizationId: orgId,
      observedAt: {
        gte: yesterday,
        lt: now,
      },
      deletedAt: null,
    },
    select: { studentId: true },
    distinct: ['studentId'],
  });

  for (const { studentId } of studentsWithActivity) {
    try {
      const reviewText = await generateDayReview({ studentId, organizationId: orgId, date: yesterday });
      if (!reviewText) continue;

      // Get student name for title
      const student = await prisma.student.findFirst({
        where: { id: studentId },
        select: { firstName: true, lastName: true },
      });

      await prisma.aIInsight.create({
        data: {
          organizationId: orgId,
          studentId,
          type: 'DAY_REVIEW',
          title: `${student?.firstName}'s Day in Review — ${yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
          summary: reviewText,
          rawStats: { date: yesterday.toISOString().slice(0, 10), studentId },
          actionItems: [],
          isRead: false,
          generatedAt: now,
        },
      });
    } catch (err) {
      console.error(`[AIInsightsWorker] Day review failed for student ${studentId}:`, err.message);
    }
  }

  console.log(`[AIInsightsWorker] Completed insights for org: ${org.name}`);
};

// ─── Worker ───────────────────────────────────────────────────────────────────

if (connection) {
  const worker = new Worker(
    'ai-insights',
    async (job) => {
      console.log('[AIInsightsWorker] Starting nightly insights run…');

      const organizations = await prisma.organization.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, name: true },
      });

      for (const org of organizations) {
        try {
          await runInsightsForOrg(org);
        } catch (err) {
          console.error(`[AIInsightsWorker] Failed for org ${org.name}:`, err.message);
        }
      }

      console.log(`[AIInsightsWorker] Completed. Processed ${organizations.length} organizations.`);
    },
    { connection, concurrency: 1 }
  );

  worker.on('completed', (job) => {
    console.log(`[AIInsightsWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[AIInsightsWorker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[AIInsightsWorker] Started — nightly run scheduled at 02:00 UTC');
}
