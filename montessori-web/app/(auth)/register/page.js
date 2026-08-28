'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  orgName:    z.string().min(2, 'School name is required'),
  orgSlug:    z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  branchName: z.string().min(2, 'Campus name is required'),
  firstName:  z.string().min(1, 'Required'),
  lastName:   z.string().min(1, 'Required'),
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Min 8 characters')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower, and number'),
});

function Field({ label, id, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}

function Input({ id, error, register, type = 'text', placeholder, autoComplete }) {
  return (
    <input
      id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
      {...register}
      className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${error ? 'border-danger' : 'border-border'}`}
      aria-invalid={!!error}
    />
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const orgName = watch('orgName', '');

  const onSubmit = async (data) => {
    try {
      const { authApi } = await import('../../../lib/api/auth');
      const result = await authApi.register(data);
      // Simulate login with returned credentials
      const { setCredentials } = await import('../../../store/authSlice');
      const { store } = await import('../../../store');
      store.dispatch(setCredentials(result));
      if (typeof window !== 'undefined') localStorage.setItem('refreshToken', result.refreshToken);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card space-y-5">
      <h2 className="font-display text-xl font-bold text-ink">{t('auth.register')}</h2>
      <p className="text-sm text-muted">Set up your school on Montessori Platform in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="rounded-lg bg-secondary/8 border border-secondary/20 p-3 space-y-3">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide">School</p>
          <Field label={t('auth.orgName')} id="orgName" error={errors.orgName?.message}>
            <Input id="orgName" register={register('orgName')} error={errors.orgName} placeholder="Sunrise Montessori Academy" />
          </Field>
          <Field label={t('auth.orgSlug')} id="orgSlug" error={errors.orgSlug?.message}>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-border/60 border border-border border-r-0 rounded-l-lg text-xs text-muted">platform.app/</span>
              <input id="orgSlug" {...register('orgSlug')} placeholder="sunrise-montessori"
                className={`flex-1 px-3 py-2 rounded-r-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors.orgSlug ? 'border-danger' : 'border-border'}`} />
            </div>
            {errors.orgSlug && <p className="mt-1 text-xs text-danger">{errors.orgSlug.message}</p>}
          </Field>
          <Field label={t('auth.branchName')} id="branchName" error={errors.branchName?.message}>
            <Input id="branchName" register={register('branchName')} error={errors.branchName} placeholder="Main Campus" />
          </Field>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Your admin account</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('auth.firstName')} id="firstName" error={errors.firstName?.message}>
              <Input id="firstName" register={register('firstName')} error={errors.firstName} autoComplete="given-name" />
            </Field>
            <Field label={t('auth.lastName')} id="lastName" error={errors.lastName?.message}>
              <Input id="lastName" register={register('lastName')} error={errors.lastName} autoComplete="family-name" />
            </Field>
          </div>
          <Field label={t('auth.email')} id="email" error={errors.email?.message}>
            <Input id="email" type="email" register={register('email')} error={errors.email} autoComplete="email" />
          </Field>
          <Field label={t('auth.password')} id="password" error={errors.password?.message}>
            <Input id="password" type="password" register={register('password')} error={errors.password} autoComplete="new-password" />
          </Field>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 focusable flex items-center justify-center gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Create school account
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="text-primary font-medium hover:underline focusable">{t('auth.signIn')}</Link>
      </p>
    </div>
  );
}
