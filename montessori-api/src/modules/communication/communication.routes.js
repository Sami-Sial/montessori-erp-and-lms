/**
 * @openapi
 * tags:
 *   name: Communication
 *   description: Announcements, direct messages and notification center
 */

import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema, paginate, paginatedResponse } from '../../lib/pagination.js';
import { AppError } from '../../middleware/errorHandler.js';
import { assertTenantOwnership } from '../../middleware/tenantScope.js';

// Lazy-load io to avoid circular dependency with server.js
const getIO = async () => {
  const { io } = await import('../../server.js');
  return io;
};

const router = Router();
router.use(authenticate, scopeTenant);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const announcementSchema = z.object({
  title:      z.string().min(1).max(200),
  body:       z.string().min(1),
  branchId:   z.string().uuid().optional().nullable(),
  classroomId:z.string().uuid().optional().nullable(),
  isPinned:   z.boolean().default(false),
  publishAt:  z.coerce.date().optional(),
  expiresAt:  z.coerce.date().optional().nullable(),
  mediaUrls:  z.array(z.string().url()).optional(),
});

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  subject:     z.string().max(200).optional().nullable(),
  body:        z.string().min(1).max(5000),
});

// ─── Announcements ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /communication/announcements:
 *   get:
 *     summary: List announcements visible to the current user
 *     tags: [Communication]
 */
router.get(
  '/announcements',
  requirePermission('announcement:read'),
  validateQuery(paginationSchema.extend({
    branchId:    z.string().uuid().optional(),
    classroomId: z.string().uuid().optional(),
    pinned:      z.coerce.boolean().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, branchId, classroomId, pinned } = req.query;
      const now = new Date();

      const where = {
        organizationId: req.organizationId,
        deletedAt: null,
        publishAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        ...(branchId    && { OR: [{ branchId }, { branchId: null }] }),
        ...(classroomId && { OR: [{ classroomId }, { classroomId: null }] }),
        ...(pinned !== undefined && { isPinned: pinned }),
      };

      const [total, announcements] = await Promise.all([
        prisma.announcement.count({ where }),
        prisma.announcement.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: [{ isPinned: 'desc' }, { publishAt: 'desc' }],
          include: {
            branch:    { select: { id: true, name: true } },
            classroom: { select: { id: true, name: true } },
          },
        }),
      ]);

      res.json(paginatedResponse(announcements, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /communication/announcements:
 *   post:
 *     summary: Post an announcement
 *     tags: [Communication]
 */
router.post(
  '/announcements',
  requirePermission('announcement:write'),
  validate(announcementSchema),
  async (req, res, next) => {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          organizationId: req.organizationId,
          createdByUserId: req.user.sub,
          ...req.body,
          publishAt: req.body.publishAt ?? new Date(),
        },
      });

      // Push live notification via Socket.IO to org room
      try {
        const io = await getIO();
        io.to(`org:${req.organizationId}`).emit('announcement:new', {
          id: announcement.id,
          title: announcement.title,
        });
      } catch {}

      res.status(201).json(announcement);
    } catch (err) { next(err); }
  }
);

router.patch('/announcements/:id', requirePermission('announcement:write'), validate(announcementSchema.partial()), async (req, res, next) => {
  try {
    const ann = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
    res.json(ann);
  } catch (err) { next(err); }
});

router.delete('/announcements/:id', requirePermission('announcement:write'), async (req, res, next) => {
  try {
    await prisma.announcement.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ message: 'Announcement deleted' });
  } catch (err) { next(err); }
});

// ─── Direct Messages ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /communication/messages:
 *   get:
 *     summary: Get inbox and sent messages for current user
 *     tags: [Communication]
 */
router.get(
  '/messages',
  requirePermission('message:send'),
  validateQuery(paginationSchema.extend({ folder: z.enum(['inbox','sent']).default('inbox') })),
  async (req, res, next) => {
    try {
      const { page, pageSize, folder } = req.query;
      const userId = req.user.sub;

      const where = folder === 'inbox'
        ? { recipientId: userId, deletedAt: null }
        : { senderId: userId, deletedAt: null };

      const [total, messages] = await Promise.all([
        prisma.message.count({ where }),
        prisma.message.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        }),
      ]);

      const recipientIds = [...new Set(messages.map(m => m.recipientId))];
      const recipients = await prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true }
      });
      const recipientMap = recipients.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

      const formattedMessages = messages.map(m => ({
        ...m,
        recipient: recipientMap[m.recipientId] || null
      }));

      res.json(paginatedResponse(formattedMessages, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /communication/recipients:
 *   get:
 *     summary: Get viable message recipients (scoped by role)
 *     tags: [Communication]
 */
router.get(
  '/recipients',
  requirePermission('message:send'),
  async (req, res, next) => {
    try {
      let allowedRoles = ['TEACHER', 'ORG_ADMIN', 'FRONT_DESK', 'SUPER_ADMIN', 'PARENT', 'STUDENT', 'HR_STAFF', 'FINANCE_STAFF'];
      let allowedUserIds = null;

      if (req.user.roles.includes('PARENT')) {
        const guardian = await prisma.guardian.findUnique({
          where: { userId: req.user.sub },
          include: {
            students: {
              include: {
                student: {
                  include: {
                    classroom: {
                      include: {
                        teachers: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const teacherUserIds = [];
        if (guardian) {
          guardian.students.forEach(sg => {
            const classroom = sg.student?.classroom;
            if (classroom) {
              classroom.teachers.forEach(staff => teacherUserIds.push(staff.userId));
            }
          });
        }
        allowedUserIds = teacherUserIds;
      } else if (req.user.roles.includes('TEACHER') || req.user.roles.includes('GUIDE')) {
        const staff = await prisma.staff.findUnique({
          where: { userId: req.user.sub },
          include: {
            classrooms: {
              include: {
                students: {
                  include: {
                    guardians: {
                      include: { guardian: true }
                    }
                  }
                }
              }
            }
          }
        });

        const guardianUserIds = [];
        if (staff) {
          staff.classrooms.forEach(c => {
            c.students.forEach(s => {
              s.guardians.forEach(sg => {
                guardianUserIds.push(sg.guardian.userId);
              });
            });
          });
        }

        const adminStaffIds = await prisma.user.findMany({
          where: {
            organizationId: req.organizationId,
            userRoles: {
              some: { role: { name: { in: ['ORG_ADMIN', 'FRONT_DESK', 'HR_STAFF', 'FINANCE_STAFF', 'SUPER_ADMIN'] } } }
            }
          },
          select: { id: true }
        });

        allowedUserIds = [...guardianUserIds, ...adminStaffIds.map(u => u.id)];
      }

      const where = {
        organizationId: req.organizationId,
        isActive: true,
        ...(allowedUserIds ? { id: { in: allowedUserIds } } : {
          userRoles: { some: { role: { name: { in: allowedRoles } } } }
        })
      };

      const users = await prisma.user.findMany({
        where,
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          userRoles: { include: { role: { select: { name: true, displayName: true } } } } 
        }
      });
      
      const formatted = users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.userRoles?.[0]?.role?.displayName || 'User'
      }));

      res.json({ data: formatted });
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /communication/messages:
 *   post:
 *     summary: Send a direct message
 *     tags: [Communication]
 */
router.post(
  '/messages',
  requirePermission('message:send'),
  validate(messageSchema),
  async (req, res, next) => {
    try {
      const message = await prisma.message.create({
        data: {
          senderId: req.user.sub,
          recipientId: req.body.recipientId,
          subject: req.body.subject ?? null,
          body: req.body.body,
          status: 'SENT',
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      });

      // Create notification for recipient
      await prisma.notification.create({
        data: {
          organizationId: req.organizationId,
          userId: req.body.recipientId,
          type: 'MESSAGE',
          title: `New message from ${message.sender.firstName} ${message.sender.lastName}`,
          body: req.body.subject ?? req.body.body.substring(0, 100),
          data: { messageId: message.id },
        },
      });

      // Live notification
      try {
        const io = await getIO();
        io.to(`user:${req.body.recipientId}`).emit('message:new', {
          from: `${message.sender.firstName} ${message.sender.lastName}`,
          messageId: message.id,
        });
      } catch {}

      res.status(201).json(message);
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /communication/messages/{id}/read:
 *   patch:
 *     summary: Mark a message as read
 *     tags: [Communication]
 */
router.patch('/messages/:id/read', requirePermission('message:send'), async (req, res, next) => {
  try {
    const msg = await prisma.message.update({
      where: { id: req.params.id },
      data: { status: 'READ', readAt: new Date() },
    });
    res.json(msg);
  } catch (err) { next(err); }
});

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /communication/notifications:
 *   get:
 *     summary: Get notification center for current user
 *     tags: [Communication]
 */
router.get(
  '/notifications',
  validateQuery(paginationSchema.extend({ unreadOnly: z.coerce.boolean().optional() })),
  async (req, res, next) => {
    try {
      const { page, pageSize, unreadOnly } = req.query;
      const where = {
        userId: req.user.sub,
        organizationId: req.organizationId,
        ...(unreadOnly && { isRead: false }),
      };
      const [total, notifications] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.findMany({
          where,
          ...paginate(page, pageSize),
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      res.json(paginatedResponse(notifications, total, page, pageSize));
    } catch (err) { next(err); }
  }
);

/**
 * @openapi
 * /communication/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Communication]
 */
router.patch('/notifications/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

router.patch('/notifications/:id/read', async (req, res, next) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.json(notif);
  } catch (err) { next(err); }
});

export default router;
