'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Thin client component — runs after hydration.
 * If the user already has a refresh token, redirect them to their dashboard.
 * Renders nothing — purely a side-effect component.
 */
export default function AuthRedirector() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('refreshToken');
    if (token) {
      router.replace('/dashboard-redirect');
    }
  }, [router]);

  return null;
}
