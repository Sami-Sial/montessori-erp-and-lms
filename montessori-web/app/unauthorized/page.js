'use client';
import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../../lib/hooks/useAuth';

export default function UnauthorizedPage() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
          <ShieldOff size={32} className="text-danger" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Access denied</h1>
        <p className="text-muted text-sm">You don't have permission to view this page.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">
            Go to dashboard
          </Link>
          <button onClick={logout}
            className="px-4 py-2 border border-border text-muted rounded-lg text-sm font-medium hover:text-ink focusable">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
