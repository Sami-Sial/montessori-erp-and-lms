import { api } from './client';

export const studentsApi = {
  list:          (params)         => api.get('/students', params),
  get:           (id)             => api.get(`/students/${id}`),
  create:        (data)           => api.post('/students', data),
  update:        (id, data)       => api.patch(`/students/${id}`, data),
  delete:        (id)             => api.delete(`/students/${id}`),
  uploadPhoto:   (id, formData)   => api.post(`/students/${id}/photo`, formData, {
                                      headers: {},  // let browser set multipart boundary
                                    }),
  addGuardian:   (id, data)       => api.post(`/students/${id}/guardians`, data),
  getProgress:   (id)             => api.get(`/students/${id}/progress`),
};
