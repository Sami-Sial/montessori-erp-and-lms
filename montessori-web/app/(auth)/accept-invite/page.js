'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api/auth';
import { useToast } from '../../../lib/hooks/useToast';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  password:  z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = params.get('token') ?? '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const result = await authApi.acceptInvite({ token, ...data });
      const { store } = await import('../../../store');
      const { setCredentials } = await import('../../../store/authSlice');
      store.dispatch(setCredentials(result));
      if (typeof window !== 'undefined') localStorage.setItem('refreshToken', result.refreshToken);
      toast.success('Welcome!', 'Your account is set up.');
      router.push('/');
    } catch (err) {
      toast.error('Failed', err.message);
    }
  };

  if (!token) return (
    <div className="card text-center">
      <p className="text-danger text-sm">Invalid invitation link.</p>
    </div>
  );

  return (
    <div className="card space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Accept invitation</h2>
        <p className="text-sm text-muted mt-1">Create your account to join the school.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          {[['firstName','First name','given-name'],['lastName','Last name','family-name']].map(([id, label, ac]) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">{label}</label>
              <input id={id} autoComplete={ac} {...register(id)}
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors[id] ? 'border-danger' : 'border-border'}`} />
              {errors[id] && <p className="mt-1 text-xs text-danger">{errors[id].message}</p>}
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">Create password</label>
          <input id="password" type="password" autoComplete="new-password" {...register('password')}
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-danger' : 'border-border'}`} />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-secondary-dark disabled:opacity-50 focusable flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Set up my account
        </button>
      </form>
    </div>
  );
}
