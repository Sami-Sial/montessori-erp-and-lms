import { Queue } from 'bullmq';
import { getBullMQConnection } from '../config/redis.js';

let aiInsightsQueue, notificationsQueue, reportQueue, syncQueue;

try {
  const connection = getBullMQConnection();

  aiInsightsQueue    = new Queue('ai-insights',     { connection });
  notificationsQueue = new Queue('notifications',   { connection });
  reportQueue        = new Queue('reports',          { connection });
  syncQueue          = new Queue('sync-reconcile',   { connection });

  // Schedule nightly AI insights at 02:00 UTC
  aiInsightsQueue.add(
    'nightly-insights',
    {},
    {
      repeat:          { pattern: '0 2 * * *', utc: true },
      removeOnComplete: 10,
      removeOnFail:     5,
    }
  ).catch(() => null); // Non-fatal if Redis unavailable at boot
} catch (err) {
  console.warn('[BullMQ] Queue init failed — Redis may not be available:', err.message);
  // Provide no-op stubs so imports don't crash
  const noop = { add: () => Promise.resolve(null) };
  aiInsightsQueue    = noop;
  notificationsQueue = noop;
  reportQueue        = noop;
  syncQueue          = noop;
}

export { aiInsightsQueue, notificationsQueue, reportQueue, syncQueue };
