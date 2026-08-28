/**
 * @openapi
 * tags:
 *   name: AI
 *   description: AI assistant chat and insight feed. GROK_API_KEY never leaves the backend.
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema, paginate, paginatedResponse } from '../../lib/pagination.js';
import { chat, suggestObservationFromPhoto } from './ai-service.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const chatSchema = z.object({
  message:        z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
});

const photoTagSchema = z.object({
  imageUrl: z.string().url(),
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /ai/chat:
 *   post:
 *     summary: Send a message to the AI assistant
 *     description: |
 *       Role-aware chat grounded in real school data via function-calling.
 *       The frontend only ever calls this endpoint — the GROK_API_KEY is
 *       never exposed to the client.
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:        { type: string }
 *               conversationId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: AI reply with conversation ID for follow-up turns
 */
router.post(
  '/chat',
  requirePermission('ai:chat'),
  validate(chatSchema),
  async (req, res, next) => {
    try {
      const { message, conversationId } = req.body;

      // Load or create conversation
      let conversation;
      if (conversationId) {
        conversation = await prisma.aIConversation.findFirst({
          where: { id: conversationId, userId: req.user.sub },
        });
        if (!conversation) throw new AppError('NOT_FOUND', 'Conversation not found', 404);
      } else {
        // Build role-specific context
        const context = await buildUserContext(req.user);

        conversation = await prisma.aIConversation.create({
          data: {
            organizationId: req.organizationId,
            userId: req.user.sub,
            title: message.slice(0, 80),
            context,
          },
        });
      }

      const context = conversation.context ?? {};
      const { reply, toolsUsed } = await chat({
        conversationId: conversation.id,
        message,
        user: req.user,
        context,
      });

      res.json({
        conversationId: conversation.id,
        reply,
        toolsUsed,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /ai/conversations:
 *   get:
 *     summary: List AI conversation history for the current user
 *     tags: [AI]
 */
router.get(
  '/conversations',
  requirePermission('ai:chat'),
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { page, pageSize } = req.query;
      const [total, conversations] = await Promise.all([
        prisma.aIConversation.count({ where: { userId: req.user.sub, organizationId: req.organizationId } }),
        prisma.aIConversation.findMany({
          where: { userId: req.user.sub, organizationId: req.organizationId },
          ...paginate(page, pageSize),
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: { select: { messages: true } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true } },
          },
        }),
      ]);
      res.json(paginatedResponse(conversations, total, page, pageSize));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /ai/conversations/{id}:
 *   get:
 *     summary: Get full message history for a conversation
 *     tags: [AI]
 */
router.get(
  '/conversations/:id',
  requirePermission('ai:chat'),
  async (req, res, next) => {
    try {
      const conversation = await prisma.aIConversation.findFirst({
        where: { id: req.params.id, userId: req.user.sub },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (!conversation) throw new AppError('NOT_FOUND', 'Conversation not found', 404);
      res.json(conversation);
    } catch (err) {
      next(err);
    }
  }
);

// ─── AI Insights ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /ai/insights:
 *   get:
 *     summary: Get the AI insight feed for this organisation
 *     tags: [AI]
 */
router.get(
  '/insights',
  requirePermission('ai:insights'),
  validateQuery(paginationSchema.extend({
    type:       z.string().optional(),
    classroomId:z.string().uuid().optional(),
    unreadOnly: z.coerce.boolean().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, type, classroomId, unreadOnly } = req.query;
      const where = {
        organizationId: req.organizationId,
        ...(type && { type }),
        ...(classroomId && { classroomId }),
        ...(unreadOnly && { isRead: false }),
      };
      const [total, insights] = await Promise.all([
        prisma.aIInsight.count({ where }),
        prisma.aIInsight.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { generatedAt: 'desc' },
        }),
      ]);
      res.json(paginatedResponse(insights, total, page, pageSize));
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/insights/:id/read', requirePermission('ai:insights'), async (req, res, next) => {
  try {
    const insight = await prisma.aIInsight.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(insight);
  } catch (err) {
    next(err);
  }
});

// ─── Photo observation tagging ────────────────────────────────────────────────

/**
 * @openapi
 * /ai/suggest-observation:
 *   post:
 *     summary: Upload a classroom photo and get AI-suggested curriculum area + milestone
 *     tags: [AI]
 */
router.post(
  '/suggest-observation',
  requirePermission('observation:write'),
  validate(photoTagSchema),
  async (req, res, next) => {
    try {
      const result = await suggestObservationFromPhoto({
        imageUrl: req.body.imageUrl,
        organizationId: req.organizationId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Context builder ──────────────────────────────────────────────────────────

async function buildUserContext(user) {
  const context = {};

  // For parents: load their children's IDs so the prompt can enforce data scoping
  if (user.roles?.includes('PARENT')) {
    const guardian = await prisma.guardian.findFirst({
      where: { userId: user.sub },
      include: {
        students: { select: { studentId: true } },
      },
    });
    if (guardian) {
      context.childIds = guardian.students.map((s) => s.studentId);
    }
  }

  // Load org name
  if (user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true },
    });
    context.orgName = org?.name;
  }

  return context;
}

export default router;
