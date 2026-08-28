'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { useToast } from '../../../lib/hooks/useToast';
import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  if (sent) return (
    <div className="card text-center space-y-4">
      <CheckCircle2 size={40} className="text-success mx-auto" />
      <h2 className="font-display text-lg font-bold text-ink">Check your email</h2>
      <p className="text-sm text-muted">If that email exists, a reset link has been sent. Check your inbox and spam folder.</p>
      <Link href="/login" className="text-primary text-sm font-medium hover:underline focusable">Back to login</Link>
    </div>
  );

  return (
    <div className="card space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Forgot password?</h2>
        <p className="text-sm text-muted mt-1">Enter your email and we'll send a reset link.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email address</label>
          <input id="email" type="email" {...register('email')}
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-danger' : 'border-border'}`}
            aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs text-danger" role="alert">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 focusable flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Send reset link
        </button>
      </form>
      <Link href="/login" className="block text-center text-sm text-primary hover:underline focusable">Back to login</Link>
    </div>
  );
}
