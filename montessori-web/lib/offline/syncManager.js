/**
 * SyncManager — orchestrates the full offline→online reconciliation cycle.
 *
 * Flow:
 *  1. On app boot (online):   pull delta from server → refresh IndexedDB
 *  2. While offline:          writes go to IndexedDB syncQueue via queueOfflineWrite()
 *  3. On reconnect:           flush syncQueue → POST /sync/push → update queue statuses
 *  4. Conflicts:              items with status='conflict' surface in UI via Redux syncSlice
 *
 * This module is the non-hook version (can be called from anywhere).
 * The useSyncManager hook in lib/hooks/useSyncManager.js wraps this with React lifecycle.
 */

import { offlineDb, getPendingItems } from './db';
import { syncApi } from '../api/sync';

let _dispatch = null;

export const initSyncManager = (dispatch) => { _dispatch = dispatch; };

export const flushSyncQueue = async () => {
  const pending = await getPendingItems();
  if (!pending.length) return { synced: 0, conflicts: 0, failed: 0 };

  const items = pending.map((item) => ({
    clientId:      String(item.id),
    deviceId:      item.deviceId ?? 'web',
    entity:        item.entity,
    entityId:      item.entityId ?? null,
    operation:     item.operation,
    payload:       item.payload,
    clientVersion: item.clientVersion ?? 1,
    clientTs:      item.clientTs,
  }));

  try {
    const result = await syncApi.push(items);

    // Update local queue statuses based on server response
    for (const r of result.results) {
      const localId = parseInt(r.clientId, 10);
      if (isNaN(localId)) continue;

      await offlineDb.syncQueue.update(localId, {
        status:        r.status === 'SYNCED' ? 'synced'
                     : r.status === 'CONFLICT' ? 'conflict'
                     : 'failed',
        serverEntityId: r.entityId ?? null,
        conflictId:    r.conflictId ?? null,
        syncedAt:      new Date().toISOString(),
      });
    }

    return {
      synced:    result.synced,
      conflicts: result.conflicts,
      failed:    result.failed,
    };
  } catch (err) {
    console.error('[SyncManager] flush failed:', err.message);
    return { synced: 0, conflicts: 0, failed: pending.length };
  }
};

export const pullServerDelta = async (params = {}) => {
  try {
    const lastPull = typeof localStorage !== 'undefined'
      ? localStorage.getItem('lastSyncPull') ?? new Date(0).toISOString()
      : new Date(0).toISOString();

    const result = await syncApi.pull({ since: lastPull, ...params });

    // Refresh IndexedDB tables
    if (result.delta?.roster?.length)      await offlineDb.students.bulkPut(result.delta.roster);
    if (result.delta?.attendance?.length)  await offlineDb.attendance.bulkPut(result.delta.attendance);
    if (result.delta?.lessonPlans?.length) await offlineDb.lessonPlans.bulkPut(result.delta.lessonPlans);
    if (result.delta?.observations?.length)await offlineDb.observations.bulkPut(result.delta.observations);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastSyncPull', result.syncedAt);
    }

    return result;
  } catch (err) {
    console.error('[SyncManager] pull failed:', err.message);
    return null;
  }
};
