import { Worker } from 'bullmq';
import { getBullMQConnection } from '../config/redis.js';
import prisma from '../config/db.js';
import { sendMail, emailTemplates } from '../config/email.js';

try {
  const connection = getBullMQConnection();

  const worker = new Worker(
    'notifications',
    async (job) => {
      const { type, userId, organizationId, studentName, checkType, time } = job.data;

      if (type === 'ATTENDANCE') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true },
        });
        if (!user) return;

        await prisma.notification.create({
          data: {
            organizationId,
            userId,
            type: 'ATTENDANCE',
            title: `${studentName} has ${checkType === 'CHECK_IN' ? 'arrived' : 'departed'}`,
            body: `${studentName} ${checkType === 'CHECK_IN' ? 'checked in' : 'checked out'} at ${time}`,
            data: { checkType, time },
          },
        });

        const pref = await prisma.notificationPreference.findFirst({
          where: { userId, type: 'ATTENDANCE' },
        });

        if (!pref || pref.email) {
          const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { name: true },
          });
          const tmpl = emailTemplates.attendanceNotification(
            user.firstName, studentName, checkType, time, org?.name ?? 'School'
          );
          await sendMail({ to: user.email, ...tmpl }).catch(() => null);
        }
      }
    },
    { connection, concurrency: 5 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[NotificationsWorker] Job ${job.id} failed:`, err.message);
  });

  console.log('[NotificationsWorker] Started');
} catch (err) {
  console.warn('[NotificationsWorker] Could not start — Redis unavailable:', err.message);
}
