import { api } from './client';

export const gamificationApi = {
  listBadges:         ()              => api.get('/gamification/badges'),
  createBadge:        (data)          => api.post('/gamification/badges', data),
  awardBadge:         (data)          => api.post('/gamification/badges/award', data),

  getStudentBadges:   (studentId)     => api.get(`/gamification/students/${studentId}/badges`),
  getStudentPoints:   (studentId)     => api.get(`/gamification/students/${studentId}/points`),
  getStudentStreaks:   (studentId)     => api.get(`/gamification/students/${studentId}/streaks`),

  getLeaderboard:     (classroomId, params) => api.get(`/gamification/classrooms/${classroomId}/leaderboard`, params),
};
