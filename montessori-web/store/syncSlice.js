import { createSlice } from '@reduxjs/toolkit';

/**
 * Tracks offline sync state for the persistent SyncStatusIndicator UI.
 * Status: 'synced' | 'pending' | 'syncing' | 'conflict' | 'offline'
 */
const syncSlice = createSlice({
  name: 'sync',
  initialState: {
    status: 'synced',
    pendingCount: 0,
    conflictCount: 0,
    lastSyncedAt: null,
    isOnline: true,
  },
  reducers: {
    setOnline:  (state) => { state.isOnline = true; },
    setOffline: (state) => { state.isOnline = false; state.status = 'offline'; },
    queueItem: (state) => {
      state.pendingCount += 1;
      state.status = 'pending';
    },
    startSync: (state) => { state.status = 'syncing'; },
    syncSuccess: (state, action) => {
      const { synced, conflicts } = action.payload;
      state.pendingCount = Math.max(0, state.pendingCount - synced);
      state.conflictCount += conflicts;
      state.lastSyncedAt = new Date().toISOString();
      state.status = state.conflictCount > 0 ? 'conflict' : state.pendingCount > 0 ? 'pending' : 'synced';
    },
    syncFailed: (state) => {
      state.status = state.pendingCount > 0 ? 'pending' : 'synced';
    },
    clearConflicts: (state) => {
      state.conflictCount = 0;
      state.status = state.pendingCount > 0 ? 'pending' : 'synced';
    },
  },
});

export const { setOnline, setOffline, queueItem, startSync, syncSuccess, syncFailed, clearConflicts } = syncSlice.actions;
export default syncSlice.reducer;
