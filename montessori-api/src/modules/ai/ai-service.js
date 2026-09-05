/**
 * ai-service.js
 * Wraps xAI Grok via the OpenAI-compatible SDK.
 * The GROK_API_KEY never leaves this module.
 *
 * Key design decisions:
 *  - Every chat call is GROUNDED in real DB data via function-calling tools.
 *    Generic text generation without real data is not acceptable here.
 *  - Role-aware system prompts keep responses contextually appropriate.
 *  - Function calls are dispatched server-side; results are injected back
 *    into the conversation before the final assistant response.
 */

import { grokClient, GROK_MODEL } from '../../config/grok.js';
import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

// ─── Tool definitions (function-calling) ──────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'fetch_student_progress',
      description: 'Fetch curriculum progress and recent observations for a student. Use this when asked about a specific student\'s learning.',
      parameters: {
        type: 'object',
        required: ['studentId'],
        properties: {
          studentId: { type: 'string', description: 'UUID of the student' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_attendance',
      description: 'Fetch attendance summary and recent records for a student or classroom.',
      parameters: {
        type: 'object',
        properties: {
          studentId:   { type: 'string', description: 'UUID of the student (optional)' },
          classroomId: { type: 'string', description: 'UUID of the classroom (optional)' },
          days:        { type: 'number', description: 'Number of days to look back (default 30)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_fee_status',
      description: 'Fetch invoice and payment status for a student or the whole organization.',
      parameters: {
        type: 'object',
        properties: {
          studentId:      { type: 'string', description: 'UUID of the student (optional — omit for org-wide)' },
          organizationId: { type: 'string', description: 'UUID of the organization' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_classroom_summary',
      description: 'Fetch a summary of a classroom: enrolled students, recent observations, lesson plans this week.',
      parameters: {
        type: 'object',
        required: ['classroomId'],
        properties: {
          classroomId: { type: 'string', description: 'UUID of the classroom' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_org_overview',
      description: 'Fetch high-level organisation metrics: total students, staff, attendance rate, outstanding fees.',
      parameters: {
        type: 'object',
        required: ['organizationId'],
        properties: {
          organizationId: { type: 'string', description: 'UUID of the organization' },
        },
      },
    },
  },
];

// ─── Tool executors ────────────────────────────────────────────────────────────

const executeTool = async (name, args, context) => {
  switch (name) {
    case 'fetch_student_progress': {
      const { studentId } = args;
      const [student, progress, observations] = await Promise.all([
        prisma.student.findFirst({
          where: { id: studentId, organizationId: context.organizationId },
          select: { firstName: true, lastName: true, dateOfBirth: true },
        }),
        prisma.studentProgress.findMany({
          where: { studentId },
          include: {
            curriculumArea: { select: { name: true } },
            milestone: { select: { title: true } },
          },
        }),
        prisma.observation.findMany({
          where: { studentId, deletedAt: null },
          orderBy: { observedAt: 'desc' },
          take: 10,
          include: {
            curriculumArea: { select: { name: true } },
            milestone: { select: { title: true } },
          },
        }),
      ]);

      if (!student) return { error: 'Student not found' };

      const progressByArea = {};
      for (const p of progress) {
        const areaName = p.curriculumArea.name;
        if (!progressByArea[areaName]) progressByArea[areaName] = [];
        progressByArea[areaName].push({ milestone: p.milestone.title, mastery: p.masteryLevel });
      }

      return {
        student: student.firstName + ' ' + student.lastName,
        ageYears: Math.floor((Date.now() - new Date(student.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)),
        progressByArea,
        recentObservations: observations.map((o) => ({
          area: o.curriculumArea.name,
          milestone: o.milestone?.title,
          note: o.note,
          mastery: o.masteryLevel,
          date: o.observedAt.toISOString().slice(0, 10),
        })),
      };
    }

    case 'fetch_attendance': {
      const { studentId, classroomId, days = 30 } = args;
      const since = new Date(Date.now() - days * 24 * 3600 * 1000);

      const records = await prisma.attendanceRecord.findMany({
        where: {
          organizationId: context.organizationId,
          ...(studentId && { studentId }),
          ...(classroomId && { classroomId }),
          date: { gte: since },
          checkType: 'CHECK_IN',
        },
        include: {
          student: { select: { firstName: true, lastName: true } },
        },
      });

      const summary = {
        total: records.length,
        present: records.filter((r) => r.status === 'PRESENT').length,
        absent: records.filter((r) => r.status === 'ABSENT').length,
        late: records.filter((r) => r.status === 'LATE').length,
      };
      summary.attendanceRate = summary.total > 0
        ? Math.round((summary.present / summary.total) * 100)
        : 0;

      return { periodDays: days, summary, recentAbsences: records
        .filter((r) => r.status === 'ABSENT')
        .slice(0, 5)
        .map((r) => ({ student: r.student.firstName + ' ' + r.student.lastName, date: r.date })) };
    }

    case 'fetch_fee_status': {
      const { studentId, organizationId } = args;
      const now = new Date();

      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId: organizationId ?? context.organizationId,
          deletedAt: null,
          ...(studentId && { studentId }),
          status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        include: {
          student: { select: { firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      });

      const overdue = invoices.filter((i) => new Date(i.dueDate) < now);
      const totalOutstanding = invoices.reduce(
        (sum, i) => sum + Number(i.totalAmount) - Number(i.paidAmount), 0
      );

      return {
        totalOutstanding,
        overdueCount: overdue.length,
        overdueAmount: overdue.reduce((s, i) => s + Number(i.totalAmount) - Number(i.paidAmount), 0),
        invoices: invoices.slice(0, 5).map((i) => ({
          number: i.invoiceNumber,
          student: i.student.firstName + ' ' + i.student.lastName,
          amount: Number(i.totalAmount) - Number(i.paidAmount),
          dueDate: i.dueDate.toISOString().slice(0, 10),
          status: i.status,
        })),
      };
    }

    case 'fetch_classroom_summary': {
      const { classroomId } = args;
      const [classroom, enrollments, recentObs, upcomingPlans] = await Promise.all([
        prisma.classroom.findFirst({
          where: { id: classroomId },
          select: { name: true, ageGroupMin: true, ageGroupMax: true },
        }),
        prisma.enrollment.count({ where: { classroomId, status: 'ACTIVE' } }),
        prisma.observation.count({
          where: { organizationId: context.organizationId, deletedAt: null,
            student: { enrollments: { some: { classroomId } } },
            observedAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
        }),
        prisma.lessonPlan.findMany({
          where: { classroomId, status: 'PUBLISHED',
            scheduledDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 3600 * 1000) } },
          select: { title: true, scheduledDate: true, curriculumArea: { select: { name: true } } },
          take: 5,
        }),
      ]);

      return {
        classroom: classroom?.name,
        ageRange: `${classroom?.ageGroupMin}–${classroom?.ageGroupMax} years`,
        enrolledStudents: enrollments,
        observationsThisWeek: recentObs,
        upcomingLessonPlans: upcomingPlans.map((lp) => ({
          title: lp.title,
          area: lp.curriculumArea.name,
          date: lp.scheduledDate?.toISOString().slice(0, 10),
        })),
      };
    }

    case 'fetch_org_overview': {
      const { organizationId } = args;
      const orgId = organizationId ?? context.organizationId;

      const [studentCount, staffCount, overdueInvoices, attendanceToday] = await Promise.all([
        prisma.student.count({ where: { organizationId: orgId, isActive: true, deletedAt: null } }),
        prisma.staff.count({ where: { organizationId: orgId, isActive: true, deletedAt: null } }),
        prisma.invoice.count({
          where: { organizationId: orgId, status: { in: ['SENT','PARTIALLY_PAID'] },
            dueDate: { lt: new Date() }, deletedAt: null },
        }),
        prisma.attendanceRecord.count({
          where: { organizationId: orgId,
            date: new Date(new Date().setHours(0,0,0,0)),
            checkType: 'CHECK_IN', status: 'PRESENT' },
        }),
      ]);

      return { studentCount, staffCount, overdueInvoices, presentToday: attendanceToday };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
};

// ─── System prompts by role ────────────────────────────────────────────────────

const getSystemPrompt = (role, context) => {
  const base = `You are a helpful, warm, and knowledgeable assistant for ${context.orgName ?? 'a Montessori school'}.
You have access to real data about the school via tools. Always use the tools to ground your answers in actual data — never make up student names, scores, or numbers.
Keep responses concise and actionable. Use plain language appropriate for educators and parents.`;

  const rolePrompts = {
    TEACHER: `${base}
You are speaking with a teacher or guide. Help with:
- Understanding individual student progress and suggesting next presentations
- Drafting observation notes (clear, objective, Montessori-aligned language)
- Lesson planning ideas across the five areas (Practical Life, Sensorial, Language, Mathematics, Culture)
- Identifying students who may need extra attention based on attendance or observation gaps`,

    GUIDE: `${base}
You are speaking with a Montessori guide. Same as teacher prompt — focus on authentic Montessori methodology.`,

    PARENT: `${base}
You are speaking with a parent or guardian. IMPORTANT: Only discuss data for THEIR children (child IDs: ${JSON.stringify(context.childIds ?? [])}).
Help with:
- Explaining how their child is progressing across curriculum areas
- Describing what Montessori activities their child has been working on
- Answering questions about attendance, upcoming events, and fee status
- Explaining Montessori methodology in accessible, jargon-free language`,

    ORG_ADMIN: `${base}
You are speaking with a school administrator or principal. Help with:
- School-wide metrics: enrollment, attendance trends, fee collection rates
- Identifying patterns that need attention (chronic absenteeism, overdue fees, curriculum gaps)
- Operational questions about staff, branches, and academic calendar
- Data-driven decisions about resource allocation`,

    BRANCH_ADMIN: `${base}
You are speaking with a branch administrator. Focus on branch-level data and operations.`,

    FINANCE_STAFF: `${base}
You are speaking with a finance team member. Focus on invoices, payments, outstanding balances, and expense management.`,

    DEFAULT: base,
  };

  return rolePrompts[role] ?? rolePrompts.DEFAULT;
};

// ─── Main chat function ────────────────────────────────────────────────────────

/**
 * Process a chat message with function-calling groundedness.
 *
 * @param {object} opts
 * @param {string}   opts.conversationId  - UUID of the AIConversation record
 * @param {string}   opts.message         - User's message
 * @param {object}   opts.user            - JWT claims (sub, roles, organizationId, etc.)
 * @param {object}   opts.context         - Additional context (orgName, childIds, etc.)
 * @returns {Promise<{reply: string, toolsUsed: string[]}>}
 */
export const chat = async ({ conversationId, message, user, context = {} }) => {
  if (!grokClient.apiKey) {
    // Graceful fallback if no API key configured
    return {
      reply: 'The AI assistant is not configured. Please add GROK_API_KEY to the environment.',
      toolsUsed: [],
    };
  }

  const primaryRole = user.roles?.[0] ?? 'DEFAULT';
  const systemPrompt = getSystemPrompt(primaryRole, {
    orgName: context.orgName,
    childIds: context.childIds,
  });

  // Load conversation history
  const history = await prisma.aIMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20, // last 20 turns for context window management
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  // Persist user message
  await prisma.aIMessage.create({
    data: { conversationId, role: 'user', content: message },
  });

  const toolsUsed = [];
  let finalReply = '';
  let iterations = 0;
  const MAX_ITERATIONS = 5; // prevent infinite tool-call loops

  // Agentic loop: Grok calls tools → we execute → feed results back
  let currentMessages = [...messages];

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await grokClient.chat.completions.create({
      model: GROK_MODEL,
      messages: currentMessages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 800,
    });

    const choice = response.choices[0];

    if (choice.finish_reason === 'tool_calls') {
      const toolCalls = choice.message.tool_calls ?? [];

      // Add assistant's tool-call message
      currentMessages.push(choice.message);

      // Execute each tool call
      const toolResults = [];
      for (const tc of toolCalls) {
        toolsUsed.push(tc.function.name);
        let args;
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }

        const result = await executeTool(tc.function.name, args, {
          organizationId: user.organizationId,
          userId: user.sub,
        });

        toolResults.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }

      currentMessages.push(...toolResults);
      // Continue loop to get assistant's final response
      continue;
    }

    // finish_reason === 'stop' — we have the final reply
    finalReply = choice.message.content ?? '';
    break;
  }

  // Persist assistant reply
  await prisma.aIMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: finalReply,
      toolCalls: toolsUsed.length > 0 ? toolsUsed : undefined,
      tokenCount: null,
    },
  });

  return { reply: finalReply, toolsUsed };
};

// ─── Day-in-review generator ──────────────────────────────────────────────────

/**
 * Generates a personalised "Day in Review" digest for a parent.
 * Called by the nightly insights job.
 */
export const generateDayReview = async ({ studentId, organizationId, date }) => {
  const dateStr = (date ?? new Date()).toISOString().slice(0, 10);

  const [student, observations, attendance] = await Promise.all([
    prisma.student.findFirst({
      where: { id: studentId },
      select: { firstName: true, lastName: true },
    }),
    prisma.observation.findMany({
      where: {
        studentId,
        observedAt: {
          gte: new Date(dateStr),
          lt: new Date(new Date(dateStr).getTime() + 24 * 3600 * 1000),
        },
        deletedAt: null,
      },
      include: { curriculumArea: { select: { name: true } } },
    }),
    prisma.attendanceRecord.findFirst({
      where: { studentId, date: new Date(dateStr), checkType: 'CHECK_IN' },
    }),
  ]);

  if (!student) return null;

  const raw = {
    studentName: `${student.firstName} ${student.lastName}`,
    date: dateStr,
    checkIn: attendance?.checkInAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A',
    checkOut: attendance?.checkOutAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A',
    attendanceStatus: attendance?.status ?? 'NO_RECORD',
    observations: observations.map((o) => ({
      area: o.curriculumArea.name,
      note: o.note,
      mastery: o.masteryLevel,
      mediaCount: o.mediaUrls.length,
    })),
  };

  if (!grokClient.apiKey) {
    return `${raw.studentName} attended school today. ${raw.observations.length} observation(s) were logged.`;
  }

  const prompt = `Write a warm, personal "Day in Review" digest for a parent. 
Use the data below to write 2–3 short paragraphs. 
Tone: warm, celebratory of small wins, informative but not clinical. 
Use the child's first name throughout. Do not include raw numbers or JSON.

Data: ${JSON.stringify(raw)}`;

  const response = await grokClient.chat.completions.create({
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: 'You write warm, personal daily school digests for parents of Montessori students.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 400,
  });

  return response.choices[0].message.content ?? '';
};

// ─── Photo observation tagger ─────────────────────────────────────────────────

/**
 * Analyses an uploaded photo URL and suggests a curriculum area + milestone.
 * Used by the photo-based observation tagging feature (§8 additional features).
 */
export const suggestObservationFromPhoto = async ({ imageUrl, organizationId }) => {
  if (!grokClient.apiKey) {
    return { suggestedArea: null, suggestedMilestone: null, confidence: 0 };
  }

  // Load curriculum areas for this org so we can constrain suggestions
  const areas = await prisma.curriculumArea.findMany({
    include: { milestones: { where: { isActive: true }, select: { id: true, title: true }, take: 10 } },
    orderBy: { sortOrder: 'asc' },
  });

  const areaList = areas.map((a) => ({
    id: a.id,
    name: a.name,
    milestones: a.milestones.map((m) => ({ id: m.id, title: m.title })),
  }));

  const response = await grokClient.chat.completions.create({
    model: GROK_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `This is a photo from a Montessori classroom. Based on what you see, identify which curriculum area and milestone this activity most likely relates to.

Available curriculum areas and milestones:
${JSON.stringify(areaList, null, 2)}

Respond with JSON only:
{
  "curriculumAreaId": "<uuid or null>",
  "milestoneId": "<uuid or null>",
  "confidence": <0.0-1.0>,
  "reasoning": "<one sentence>"
}`,
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  try {
    const content = response.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(content.replace(/```json?\n?/g, '').replace(/```/g, ''));
    return parsed;
  } catch {
    return { curriculumAreaId: null, milestoneId: null, confidence: 0, reasoning: 'Could not parse response' };
  }
};
