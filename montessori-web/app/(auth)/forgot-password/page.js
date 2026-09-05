'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { useToast } from '../../../lib/hooks/useToast';
import { useState } from 'react';
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, Mail } from 'lucide-react';

const schema = z.object({ email: z.string().email('Please enter a valid email') });

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      // Still show success to prevent email enumeration
      setSent(true);
    }
  };

  if (sent) return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#4B8B6F]/10 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-[#4B8B6F]" />
      </div>
      <h2 className="font-display text-2xl font-black text-[#1F2430] mb-2">Check your inbox</h2>
      <p className="text-[#5B5F6B] mb-2">
        If <strong className="text-[#1F2430]">{getValues('email')}</strong> is registered,
        a reset link has been sent.
      </p>
      <p className="text-xs text-[#9A9DAA] mb-8">Check your spam folder if you don't see it.</p>
      <Link href="/login"
        className="inline-flex items-center gap-2 text-[#3E4C8C] font-bold text-sm hover:underline">
        <ArrowLeft size={15} /> Back to sign in
      </Link>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#3E4C8C]/10 flex items-center justify-center mb-5">
          <Mail size={22} className="text-[#3E4C8C]" />
        </div>
        <h2 className="font-display text-3xl font-black text-[#1F2430] mb-2">Reset your password</h2>
        <p className="text-[#5B5F6B]">Enter your email and we'll send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[#1F2430] mb-2">
            Email address
          </label>
          <input id="email" type="email" autoComplete="email"
            placeholder="you@yourschool.edu"
            {...register('email')}
            className={`w-full px-4 py-3.5 rounded-xl border-2 bg-white text-[#1F2430] text-sm placeholder:text-[#9A9DAA] focus:outline-none transition-colors ${
              errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#E2DFD8] focus:border-[#3E4C8C]'
            }`}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-base hover:from-[#4A59A8] hover:to-[#6672C0] disabled:opacity-55 transition-all shadow-lg shadow-[#3E4C8C]/25 hover:scale-[1.01]">
          {isSubmitting
            ? <><Loader2 size={18} className="animate-spin" /> Sending…</>
            : <><span>Send reset link</span><ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
          }
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#5B5F6B] hover:text-[#3E4C8C] font-medium transition-colors">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
