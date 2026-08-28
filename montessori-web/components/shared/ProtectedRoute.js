'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

/**
 * Guards a route group by role.
 *
 * Users arrive here either:
 *  a) Via dashboard-redirect which already hydrated the Redux store, OR
 *  b) Via direct URL navigation — in which case Redux is empty and we
 *     send them through dashboard-redirect to restore the session.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      // Not in Redux store — try to restore via dashboard-redirect
      const token = localStorage.getItem('refreshToken');
      if (token) {
        // Store the intended destination so we can return after auth
        sessionStorage.setItem('authRedirect', window.location.pathname);
        router.replace('/dashboard-redirect');
      } else {
        router.replace('/login');
      }
      return;
    }

    if (allowedRoles.length > 0) {
      const userRoles = user?.roles ?? [];
      const hasRole = allowedRoles.some((r) => userRoles.includes(r));
      if (!hasRole) router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, router]); // eslint-disable-line

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F4F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3E4C8C]/20 animate-pulse" />
          <p className="text-[#5B5F6B] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
