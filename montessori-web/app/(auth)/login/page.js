'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import LanguageToggle from '../../../components/shared/LanguageToggle';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try { await login(data); } catch { /* handled in useAuth */ }
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">{t('auth.login')}</h2>
        <LanguageToggle />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.email ? 'border-danger' : 'border-border'
            }`}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-danger" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              {t('auth.password')}
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline focusable">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.password ? 'border-danger' : 'border-border'
              }`}
              aria-describedby={errors.password ? 'pw-error' : undefined}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors focusable"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="pw-error" className="mt-1 text-xs text-danger" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focusable flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {t('auth.login')}
        </button>
      </form>

      {/* Demo credentials hint */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <p className="text-xs font-medium text-primary mb-1">Demo credentials</p>
        <p className="text-xs text-muted font-mono">teacher@sunrise.edu</p>
        <p className="text-xs text-muted font-mono">Demo@1234</p>
      </div>

      <p className="text-center text-sm text-muted">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-primary font-medium hover:underline focusable">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  );
}
