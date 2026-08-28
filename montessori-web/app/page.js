'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page — simple redirect based on whether a refresh token exists in
 * localStorage. No API call here — just a fast local check.
 *
 * If a token exists → go to /dashboard-redirect (which does the real auth check)
 * If no token → go to /auth/login
 *
 * This avoids any race between the Redux store hydrating and the redirect firing.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('refreshToken');
    if (token) {
      // Has a stored token — try to restore session on the dashboard
      router.replace('/dashboard-redirect');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F4F1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3E4C8C]/20 animate-pulse" />
        <p className="text-[#5B5F6B] text-sm">Loading…</p>
      </div>
    </div>
  );
}
