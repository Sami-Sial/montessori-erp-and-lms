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
        SUPER_ADMIN:   '/superadmin/dashboard',
        ORG_ADMIN:     '/admin/dashboard',
                TEACHER:       '/teacher/dashboard',
        PARENT:        '/parent/dashboard',
        FINANCE_STAFF: '/finance/dashboard',
        HR_STAFF:      '/hr/dashboard',
        FRONT_DESK:    '/frontdesk/dashboard',
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
    // Clear local state FIRST — before any network call
    // This prevents any race condition where a redirect fires
    // before the token is removed from localStorage
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;

    // Immediately clear everything — don't wait for API
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
    dispatch(clearAuth());

    // Fire-and-forget the server-side token revocation
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => null);
    }

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
