'use client';
import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Restores the auth session from localStorage on first mount.
 * Mount in the root Providers component.
 */
export function useHydrate() {
  const { hydrate, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      hydrate();
    }
  }, []); // eslint-disable-line
}
