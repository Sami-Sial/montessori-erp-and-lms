import { api } from './client';

export const communicationApi = {
  // Announcements
  listAnnouncements:          (params)    => api.get('/communication/announcements', params),
  createAnnouncement:         (data)      => api.post('/communication/announcements', data),
  updateAnnouncement:         (id, data)  => api.patch(`/communication/announcements/${id}`, data),
  deleteAnnouncement:         (id)        => api.delete(`/communication/announcements/${id}`),

  // Messages
  getMessages:                (params)    => api.get('/communication/messages', params),
  sendMessage:                (data)      => api.post('/communication/messages', data),
  markMessageRead:            (id)        => api.patch(`/communication/messages/${id}/read`),

  // Notifications
  getNotifications:           (params)    => api.get('/communication/notifications', params),
  markNotificationRead:       (id)        => api.patch(`/communication/notifications/${id}/read`),
  markAllNotificationsRead:   ()          => api.patch('/communication/notifications/read-all'),
};
