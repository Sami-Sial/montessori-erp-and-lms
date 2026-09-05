import { api } from './client';

export const classroomsApi = {
  list:   (params)    => api.get('/classrooms', params),
  get:    (id)        => api.get(`/classrooms/${id}`),
  create: (data)      => api.post('/classrooms', data),
  update: (id, data)  => api.patch(`/classrooms/${id}`, data),
  delete: (id)        => api.delete(`/classrooms/${id}`),
  enrollStudent:   (id, studentId) => api.post(`/classrooms/${id}/enroll`, { studentId }),
  unenrollStudent: (id, studentId) => api.delete(`/classrooms/${id}/enroll/${studentId}`),
  assignStaff:     (id, staffId) => api.post(`/classrooms/${id}/staff`, { staffId }),
  unassignStaff:   (id, staffId) => api.delete(`/classrooms/${id}/staff/${staffId}`),
};
