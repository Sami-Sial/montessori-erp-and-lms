'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '../../../lib/api/auth';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setMessage('No token provided.'); return; }
    authApi.verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => { setState('error'); setMessage(err.message); });
  }, [token]);

  return (
    <div className="card text-center space-y-4">
      {state === 'loading' && (
        <><Loader2 size={36} className="animate-spin text-primary mx-auto" /><p className="text-muted text-sm">Verifying your email…</p></>
      )}
      {state === 'success' && (
        <><CheckCircle2 size={40} className="text-success mx-auto" />
        <h2 className="font-display text-lg font-bold text-ink">Email verified!</h2>
        <p className="text-sm text-muted">Your account is active. You can now log in.</p>
        <Link href="/login" className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">Go to login</Link></>
      )}
      {state === 'error' && (
        <><XCircle size={40} className="text-danger mx-auto" />
        <h2 className="font-display text-lg font-bold text-ink">Verification failed</h2>
        <p className="text-sm text-muted">{message || 'This link is invalid or has expired.'}</p>
        <Link href="/login" className="text-primary text-sm hover:underline focusable">Back to login</Link></>
      )}
    </div>
  );
}
