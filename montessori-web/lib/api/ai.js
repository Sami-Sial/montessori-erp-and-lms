import { api } from './client';

export const aiApi = {
  chat:               (data)          => api.post('/ai/chat', data),
  listConversations:  (params)        => api.get('/ai/conversations', params),
  getConversation:    (id)            => api.get(`/ai/conversations/${id}`),

  listInsights:       (params)        => api.get('/ai/insights', params),
  markInsightRead:    (id)            => api.patch(`/ai/insights/${id}/read`),

  suggestObservation: (imageUrl)      => api.post('/ai/suggest-observation', { imageUrl }),
};
