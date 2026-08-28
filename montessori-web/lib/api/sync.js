import { api } from './client';

export const syncApi = {
  push:               (items)         => api.post('/sync/push', { items }),
  pull:               (params)        => api.get('/sync/pull', params),
  listConflicts:      ()              => api.get('/sync/conflicts'),
  resolveConflict:    (id, data)      => api.patch(`/sync/conflicts/${id}/resolve`, data),
};
