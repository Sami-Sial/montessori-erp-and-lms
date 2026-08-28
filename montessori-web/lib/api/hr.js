import { api } from './client';

export const hrApi = {
  listStaff:          (params)        => api.get('/hr/staff', params),
  getStaff:           (id)            => api.get(`/hr/staff/${id}`),
  createStaff:        (data)          => api.post('/hr/staff', data),
  updateStaff:        (id, data)      => api.patch(`/hr/staff/${id}`, data),

  listLeave:          (params)        => api.get('/hr/leave-requests', params),
  submitLeave:        (data)          => api.post('/hr/leave-requests', data),
  decideLeave:        (id, data)      => api.patch(`/hr/leave-requests/${id}/decision`, data),

  listPayroll:        (params)        => api.get('/hr/payroll', params),
  processPayroll:     (data)          => api.post('/hr/payroll', data),

  submitTimesheet:    (data)          => api.post('/hr/timesheets', data),
  recordStaffAttendance: (data)       => api.post('/hr/staff-attendance', data),
};
