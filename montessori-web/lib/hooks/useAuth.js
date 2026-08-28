'use client';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials, clearAuth, setLoading } from '../../store/authSlice';
import { authApi } from '../api/auth';
import { useToast } from './useToast';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();
  const auth = useSelector((s) => s.auth);

  const login = async ({ email, password }) => {
    dispatch(setLoading(true));
    try {
      const data = await authApi.login({ email, password });
      dispatch(setCredentials(data));

      // Persist tokens for page-refresh hydration
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Role-based redirect
      const role = data.user.roles?.[0];
      const redirectMap = {
        SUPER_ADMIN:   '/admin/dashboard',
        ORG_ADMIN:     '/admin/dashboard',
        BRANCH_ADMIN:  '/admin/dashboard',
        TEACHER:       '/teacher/dashboard',
        GUIDE:         '/teacher/dashboard',
        PARENT:        '/parent/dashboard',
        STUDENT:       '/student/dashboard',
        FINANCE_STAFF: '/finance/dashboard',
        HR_STAFF:      '/finance/dashboard',
        FRONT_DESK:    '/teacher/attendance',
      };
      router.push(redirectMap[role] ?? '/admin/dashboard');
    } catch (err) {
      toast.error('Login failed', err.message ?? 'Invalid credentials');
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* silent */ }
    localStorage.removeItem('refreshToken');
    dispatch(clearAuth());
    router.replace('/login');
  };

  const hydrate = async () => {
    // On app boot, try to restore session from stored refresh token
    if (auth.isAuthenticated) return;
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;
    if (!refreshToken) return;

    dispatch(setLoading(true));
    try {
      const data = await authApi.refresh(refreshToken);
      dispatch(setCredentials(data));
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch {
      localStorage.removeItem('refreshToken');
      dispatch(clearAuth());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { ...auth, login, logout, hydrate };
}
