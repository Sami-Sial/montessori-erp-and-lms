import { api } from './client';

export const academicYearsApi = {
  list: async () => {
    return await api.get('/academic-years');
  },
  
  create: async (payload) => {
    return await api.post('/academic-years', payload);
  },
  
  update: async (id, payload) => {
    return await api.patch(`/academic-years/${id}`, payload);
  },
};
