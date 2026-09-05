'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials, clearAuth } from '../../store/authSlice';
import { authApi } from '../../lib/api/auth';

const ROLE_REDIRECT = {
  SUPER_ADMIN:   '/superadmin/dashboard',
  ORG_ADMIN:     '/admin/dashboard',
    TEACHER:       '/teacher/dashboard',
  PARENT:        '/parent/dashboard',
  FINANCE_STAFF: '/finance/dashboard',
  HR_STAFF:      '/hr/dashboard',
  FRONT_DESK:    '/frontdesk/dashboard',
};

/**
 * Intermediate page that:
 * 1. Reads the refresh token from localStorage
 * 2. Calls /auth/refresh to get a fresh access token + user data
 * 3. Stores credentials in Redux
 * 4. Redirects to the role-appropriate dashboard
 *
 * If the token is invalid or expired → /auth/login
 */
export default function DashboardRedirect() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('refreshToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    authApi.refresh(token)
      .then((data) => {
        dispatch(setCredentials(data));
        localStorage.setItem('refreshToken', data.refreshToken);

        // If arriving from a protected route redirect, go back there
        const savedPath = sessionStorage.getItem('authRedirect');
        sessionStorage.removeItem('authRedirect');

        const role = data.user?.roles?.[0];
        const defaultPath = ROLE_REDIRECT[role] ?? '/admin/dashboard';
        router.replace(savedPath ?? defaultPath);
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
        dispatch(clearAuth());
        router.replace('/login');
      });
  }, [router, dispatch]);

  if (error) return null;

  return (
    <div className="min-h-screen bg-[#F5F4F1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3E4C8C]/20 animate-pulse" />
        <p className="text-[#5B5F6B] text-sm">Restoring session…</p>
      </div>
    </div>
  );
}
