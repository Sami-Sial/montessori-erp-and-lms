'use client';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnline, setOffline, startSync, syncSuccess, syncFailed } from '../../store/syncSlice';
import { offlineDb } from '../offline/db';
import { syncApi } from '../api/sync';

/**
 * Manages the offline sync lifecycle:
 *  - Listens for online/offline browser events
 *  - On reconnect: flushes IndexedDB queue → POST /sync/push
 *  - On reconnect: pulls server delta → refreshes IndexedDB cache
 *  - Updates Redux syncSlice for the SyncStatusIndicator
 *
 * Mount this once at the top of each protected layout.
 */
export function useSyncManager(classroomId) {
  const dispatch = useDispatch();
  const { isOnline } = useSelector((s) => s.sync);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const flushQueue = useCallback(async () => {
    if (!isAuthenticated) return;

    const pending = await offlineDb.syncQueue
      .where('status').equals('pending')
      .toArray();

    if (pending.length === 0) return;

    dispatch(startSync());
    try {
      const items = pending.map((item) => ({
        clientId:      item.id,
        deviceId:      item.deviceId,
        entity:        item.entity,
        entityId:      item.entityId ?? null,
        operation:     item.operation,
        payload:       item.payload,
        clientVersion: item.clientVersion ?? 1,
        clientTs:      item.clientTs,
      }));

      const result = await syncApi.push(items);

      // Update local queue statuses
      for (const r of result.results) {
        await offlineDb.syncQueue.update(r.clientId, {
          status: r.status === 'SYNCED' ? 'synced'
                : r.status === 'CONFLICT' ? 'conflict'
                : 'failed',
          serverEntityId: r.entityId,
          conflictId: r.conflictId ?? null,
        });
      }

      dispatch(syncSuccess({ synced: result.synced, conflicts: result.conflicts }));
    } catch {
      dispatch(syncFailed());
    }
  }, [dispatch, isAuthenticated]);

  const pullDelta = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const lastPull = localStorage.getItem('lastSyncPull') ?? new Date(0).toISOString();
      const params = { since: lastPull };
      if (classroomId) params.classroomId = classroomId;

      const result = await syncApi.pull(params);

      // Refresh IndexedDB caches
      if (result.delta.attendance?.length) {
        await offlineDb.attendance.bulkPut(result.delta.attendance);
      }
      if (result.delta.roster?.length) {
        await offlineDb.students.bulkPut(result.delta.roster);
      }
      if (result.delta.lessonPlans?.length) {
        await offlineDb.lessonPlans.bulkPut(result.delta.lessonPlans);
      }

      localStorage.setItem('lastSyncPull', result.syncedAt);
    } catch { /* non-fatal */ }
  }, [isAuthenticated, classroomId]);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = async () => {
      dispatch(setOnline());
      await flushQueue();
      await pullDelta();
    };
    const handleOffline = () => dispatch(setOffline());

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check current state
    if (!navigator.onLine) dispatch(setOffline());

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, flushQueue, pullDelta]);

  // Flush on mount (in case there were queued items from last session)
  useEffect(() => {
    if (navigator.onLine && isAuthenticated) {
      flushQueue();
      pullDelta();
    }
  }, [isAuthenticated]); // eslint-disable-line

  return { flushQueue, pullDelta };
}
