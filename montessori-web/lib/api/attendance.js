import { api } from './client';

export const attendanceApi = {
  mark:               (data)          => api.post('/attendance/mark', data),
  bulkMark:           (data)          => api.post('/attendance/bulk', data),
  qrScan:             (data)          => api.post('/attendance/qr-scan', data),
  getDaily:           (params)        => api.get(`/attendance/daily`, params),
  getClassroom:       (id, params)    => api.get(`/attendance/classroom/${id}`, params),
  getStudent:         (id, params)    => api.get(`/attendance/student/${id}`, params),
  getAnalytics:       (params)        => api.get('/attendance/analytics', params),
  getTrend:           (params)        => api.get('/attendance/trend', params),
  getHistory:         (params)        => api.get('/attendance/history', params),
};
