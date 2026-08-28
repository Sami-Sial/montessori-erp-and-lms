import { api } from './client';

export const curriculumApi = {
  getAreas:           ()              => api.get('/curriculum/areas'),
  getMaterials:       ()              => api.get('/curriculum/materials'),
  listLessonPlans:    (params)        => api.get('/curriculum/lesson-plans', params),
  getLessonPlan:      (id)            => api.get(`/curriculum/lesson-plans/${id}`),
  createLessonPlan:   (data)          => api.post('/curriculum/lesson-plans', data),
  updateLessonPlan:   (id, data)      => api.patch(`/curriculum/lesson-plans/${id}`, data),
  deleteLessonPlan:   (id)            => api.delete(`/curriculum/lesson-plans/${id}`),
};
