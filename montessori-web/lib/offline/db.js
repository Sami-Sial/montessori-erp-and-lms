/**
 * Dexie.js IndexedDB database for offline-first caching.
 *
 * Stores:
 *   students      — today's classroom roster (id, firstName, lastName, photoUrl, qrCode)
 *   attendance    — AttendanceRecords pulled from server + pending local writes
 *   lessonPlans   — active/published lesson plans for today
 *   observations  — recently logged observations (last 7 days)
 *   syncQueue     — offline write operations pending push to server
 *
 * Design decisions:
 *  - All writes go through the syncQueue so nothing is lost offline.
 *  - The pull endpoint refreshes these tables on reconnect.
 *  - syncQueue items are processed by useSyncManager on reconnect.
 */

import Dexie from 'dexie';

class MontessoriDb extends Dexie {
  constructor() {
    super('MontessoriPlatform');

    this.version(1).stores({
      // Roster: keyed by student UUID
      students: 'id, firstName, lastName, qrCode',

      // Attendance: composite key matches server @@unique constraint
      attendance: '[studentId+date+checkType], studentId, date, classroomId, status',

      // Lesson plans: keyed by id, indexed by classroom + date
      lessonPlans: 'id, classroomId, scheduledDate, status',

      // Observations: keyed by id, indexed for filtering
      observations: 'id, studentId, curriculumAreaId, observedAt',

      // Sync queue: keyed by auto-incremented local id
      syncQueue: '++id, entity, status, createdAt, deviceId',
    });
  }
}

// Singleton — safe to import anywhere
export const offlineDb = new MontessoriDb();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Queue an offline write operation.
 * Returns the local queue ID.
 */
export const queueOfflineWrite = async ({
  entity,
  entityId = null,
  operation,
  payload,
  deviceId = 'web',
}) => {
  return offlineDb.syncQueue.add({
    entity,
    entityId,
    operation,
    payload,
    deviceId,
    clientVersion: 1,
    clientTs: new Date().toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
};

/**
 * Get all pending sync items (not yet pushed to server).
 */
export const getPendingItems = () =>
  offlineDb.syncQueue.where('status').equals('pending').toArray();

/**
 * Get count of pending + conflict items (shown in SyncStatusIndicator).
 */
export const getSyncCounts = async () => {
  const [pending, conflicts] = await Promise.all([
    offlineDb.syncQueue.where('status').equals('pending').count(),
    offlineDb.syncQueue.where('status').equals('conflict').count(),
  ]);
  return { pending, conflicts };
};

/**
 * Cache today's classroom roster from a /sync/pull response.
 */
export const cacheRoster = async (students) => {
  if (!students?.length) return;
  await offlineDb.students.bulkPut(students);
};

/**
 * Cache attendance records from a /sync/pull delta.
 */
export const cacheAttendance = async (records) => {
  if (!records?.length) return;
  await offlineDb.attendance.bulkPut(records);
};

/**
 * Look up a student by QR code (for offline QR scanning).
 */
export const findStudentByQr = (qrCode) =>
  offlineDb.students.where('qrCode').equals(qrCode).first();

/**
 * Get cached roster for a classroom date (used when offline).
 */
export const getCachedRoster = () => offlineDb.students.toArray();

/**
 * Get cached attendance for a date.
 */
export const getCachedAttendance = (date) =>
  offlineDb.attendance.where('date').equals(date).toArray();
