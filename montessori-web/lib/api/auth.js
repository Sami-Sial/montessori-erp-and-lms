import { api } from './client';

export const authApi = {
  register:       (data)          => api.post('/auth/register', data),
  login:          (data)          => api.post('/auth/login', data),
  refresh:        (refreshToken)  => api.post('/auth/refresh', { refreshToken }),
  logout:         (refreshToken)  => api.post('/auth/logout', { refreshToken }),
  verifyEmail:    (token)         => api.get('/auth/verify-email', { token }),
  forgotPassword: (email)         => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (data)          => api.post('/auth/change-password', data),
  me:             ()              => api.get('/auth/me'),
  invite:         (data)          => api.post('/auth/invite', data),
  acceptInvite:   (data)          => api.post('/auth/accept-invite', data),
};
