'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api/auth';
import { useToast } from '../../../lib/hooks/useToast';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  password:   z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
  confirm:    z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = params.get('token') ?? '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset', 'You can now log in with your new password');
      router.push('/login');
    } catch (err) {
      toast.error('Reset failed', err.message);
    }
  };

  if (!token) return (
    <div className="card text-center">
      <p className="text-danger text-sm">Invalid or missing reset token. Please request a new link.</p>
    </div>
  );

  return (
    <div className="card space-y-5">
      <h2 className="font-display text-xl font-bold text-ink">Set new password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {[
          { id: 'password', label: 'New password', ac: 'new-password' },
          { id: 'confirm',  label: 'Confirm password', ac: 'new-password' },
        ].map(({ id, label, ac }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">{label}</label>
            <input id={id} type="password" autoComplete={ac} {...register(id)}
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors[id] ? 'border-danger' : 'border-border'}`}
              aria-invalid={!!errors[id]} />
            {errors[id] && <p className="mt-1 text-xs text-danger" role="alert">{errors[id].message}</p>}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 focusable flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Reset password
        </button>
      </form>
    </div>
  );
}
