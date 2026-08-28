import { api } from './client';

export const classroomsApi = {
  list:   (params)    => api.get('/classrooms', params),
  get:    (id)        => api.get(`/classrooms/${id}`),
  create: (data)      => api.post('/classrooms', data),
  update: (id, data)  => api.patch(`/classrooms/${id}`, data),
};
