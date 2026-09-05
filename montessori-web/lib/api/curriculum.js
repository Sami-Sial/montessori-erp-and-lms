import { api } from './client';

export const curriculumApi = {
  getAreas:           (params)        => api.get('/curriculum/areas', params),
  create:             (data)          => api.post('/curriculum', data),
  seedCurriculum:     ()              => api.post('/curriculum/seed'),
  getMaterials:       ()              => api.get('/curriculum/materials'),
  listLessonPlans:    (params)        => api.get('/curriculum/lesson-plans', params),
  getLessonPlan:      (id)            => api.get(`/curriculum/lesson-plans/${id}`),
  createLessonPlan:   (data)          => api.post('/curriculum/lesson-plans', data),
  updateLessonPlan:   (id, data)      => api.patch(`/curriculum/lesson-plans/${id}`, data),
  deleteLessonPlan:   (id)            => api.delete(`/curriculum/lesson-plans/${id}`),

  createArea:         (data)          => api.post('/curriculum/areas', data),
  updateArea:         (id, data)      => api.patch(`/curriculum/areas/${id}`, data),
  
  createMilestone:    (areaId, data)  => api.post(`/curriculum/areas/${areaId}/milestones`, data),
  updateMilestone:    (id, data)      => api.patch(`/curriculum/milestones/${id}`, data),
};
