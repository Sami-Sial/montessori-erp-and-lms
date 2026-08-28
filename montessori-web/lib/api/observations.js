import { api } from './client';

export const observationsApi = {
  list:           (params)        => api.get('/observations', params),
  get:            (id)            => api.get(`/observations/${id}`),
  create:         (data)          => api.post('/observations', data),
  update:         (id, data)      => api.patch(`/observations/${id}`, data),
  delete:         (id)            => api.delete(`/observations/${id}`),
  uploadMedia:    (id, formData)  => api.post(`/observations/${id}/media`, formData, { headers: {} }),
  suggestFromPhoto: (imageUrl)    => api.post('/ai/suggest-observation', { imageUrl }),
};
