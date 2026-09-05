import { api } from './client';

export const superAdminApi = {
  // Stats
  getStats:            ()              => api.get('/admin/stats'),

  // Charts
  getOrgGrowth:        ()              => api.get('/admin/charts/org-growth'),
  getUsersByRole:      ()              => api.get('/admin/charts/users-by-role'),
  getActivity:         ()              => api.get('/admin/charts/activity'),

  // Organizations
  listOrganizations:   (params)        => api.get('/admin/organizations', params),
  getOrganization:     (id)            => api.get(`/admin/organizations/${id}`),
  getOrganizationUsers:(id, params)    => api.get(`/admin/organizations/${id}/users`, params),
  createOrganization:  (data)          => api.post('/admin/organizations', data),
  updateOrganization:  (id, data)      => api.patch(`/admin/organizations/${id}`, data),
  deleteOrganization:  (id)            => api.delete(`/admin/organizations/${id}`),
  toggleOrganization:  (id)            => api.patch(`/admin/organizations/${id}/toggle`),

  // Users
  listUsers:           (params)        => api.get('/admin/users', params),
  toggleUser:          (id)            => api.patch(`/admin/users/${id}/toggle`),

  // Audit log
  getAuditLog:         (params)        => api.get('/admin/audit', params),
};
