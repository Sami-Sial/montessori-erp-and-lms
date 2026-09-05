'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '../../../lib/hooks/useAuth';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  email:    z.string().email('Please enter a valid email'),
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
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-[#1F2430] mb-2">Welcome back</h2>
        <p className="text-[#5B5F6B]">Sign in to your school account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[#1F2430] mb-2">
            Email address
          </label>
          <input id="email" type="email" autoComplete="email"
            placeholder="principal@yourschool.edu"
            {...register('email')}
            className={`w-full px-4 py-3.5 rounded-xl border-2 bg-white text-[#1F2430] text-sm placeholder:text-[#9A9DAA] focus:outline-none focus:ring-0 transition-colors ${
              errors.email
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#E2DFD8] focus:border-[#3E4C8C]'
            }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-err' : undefined}
          />
          {errors.email && (
            <p id="email-err" role="alert" className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-bold text-[#1F2430]">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[#3E4C8C] hover:text-[#2E3A6E] hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-white text-[#1F2430] text-sm placeholder:text-[#9A9DAA] focus:outline-none focus:ring-0 transition-colors ${
                errors.password
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-[#E2DFD8] focus:border-[#3E4C8C]'
              }`}
              aria-invalid={!!errors.password}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9DAA] hover:text-[#5B5F6B] transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-base hover:from-[#4A59A8] hover:to-[#6672C0] disabled:opacity-55 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3E4C8C]/25 hover:shadow-[#3E4C8C]/40 hover:scale-[1.01]">
          {isLoading
            ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
            : <><span>Sign in</span><ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
          }
        </button>
      </form>

      <p className="text-center text-sm text-[#5B5F6B] mt-6">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-[#3E4C8C] hover:underline">
          Register your school
        </Link>
      </p>
    </div>
  );
}
