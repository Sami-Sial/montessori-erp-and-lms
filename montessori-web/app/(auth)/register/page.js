'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, ArrowRight, Building2, User } from 'lucide-react';
import { useToast } from '../../../lib/hooks/useToast';

const schema = z.object({
  orgName:    z.string().min(2, 'School name is required'),
  orgSlug:    z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  firstName:  z.string().min(1, 'Required'),
  lastName:   z.string().min(1, 'Required'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(8, 'At least 8 characters')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and a number'),
});

function Field({ label, id, error, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-bold text-[#1F2430]">{label}</label>
        {hint && <span className="text-xs text-[#9A9DAA]">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">{error}</p>}
    </div>
  );
}

function Input({ id, register, error, type = 'text', placeholder, autoComplete }) {
  return (
    <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
      {...register}
      className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-[#1F2430] text-sm placeholder:text-[#9A9DAA] focus:outline-none transition-colors ${
        error ? 'border-red-400 focus:border-red-500' : 'border-[#E2DFD8] focus:border-[#3E4C8C]'
      }`}
      aria-invalid={!!error}
    />
  );
}

export default function RegisterPage() {
  const toast = useToast();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const orgName = watch('orgName', '');

  const onSubmit = async (data) => {
    try {
      const { authApi } = await import('../../../lib/api/auth');
      const result = await authApi.register(data);
      const { store } = await import('../../../store');
      const { setCredentials } = await import('../../../store/authSlice');
      store.dispatch(setCredentials(result));
      if (typeof window !== 'undefined') localStorage.setItem('refreshToken', result.refreshToken);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      toast.error('Registration failed', err.message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-[#1F2430] mb-2">Create your school</h2>
        <p className="text-[#5B5F6B]">Set up your Montessori school account in minutes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* School info section */}
        <div className="rounded-2xl border-2 border-[#E2DFD8] p-5 space-y-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#3E4C8C]/10 flex items-center justify-center">
              <Building2 size={14} className="text-[#3E4C8C]" />
            </div>
            <p className="text-xs font-black text-[#3E4C8C] uppercase tracking-widest">School details</p>
          </div>

          <Field label="School name" id="orgName" error={errors.orgName?.message}>
            <Input id="orgName" register={register('orgName')} error={errors.orgName}
              placeholder="Sunrise Montessori Academy" autoComplete="organization" />
          </Field>

          <Field label="School URL" id="orgSlug" error={errors.orgSlug?.message} hint="Used in your account URL">
            <div className="flex">
              <span className="flex items-center px-3 bg-[#F5F4F1] border-2 border-r-0 border-[#E2DFD8] rounded-l-xl text-xs text-[#9A9DAA] whitespace-nowrap font-mono">
                platform.app/
              </span>
              <input id="orgSlug" {...register('orgSlug')} placeholder="sunrise-montessori"
                className={`flex-1 px-3 py-3 rounded-r-xl border-2 bg-white text-[#1F2430] text-sm font-mono placeholder:text-[#9A9DAA] focus:outline-none transition-colors ${
                  errors.orgSlug ? 'border-red-400 focus:border-red-500' : 'border-[#E2DFD8] focus:border-[#3E4C8C]'
                }`} />
            </div>
            {errors.orgSlug && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.orgSlug.message}</p>}
          </Field>

          <Field label="First campus name" id="branchName" error={errors.branchName?.message}>
            <Input id="branchName" register={register('branchName')} error={errors.branchName}
              placeholder="Main Campus" />
          </Field>
        </div>

        {/* Admin account section */}
        <div className="rounded-2xl border-2 border-[#E2DFD8] p-5 space-y-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#5C7A5A]/10 flex items-center justify-center">
              <User size={14} className="text-[#5C7A5A]" />
            </div>
            <p className="text-xs font-black text-[#5C7A5A] uppercase tracking-widest">Your admin account</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" id="firstName" error={errors.firstName?.message}>
              <Input id="firstName" register={register('firstName')} error={errors.firstName} autoComplete="given-name" />
            </Field>
            <Field label="Last name" id="lastName" error={errors.lastName?.message}>
              <Input id="lastName" register={register('lastName')} error={errors.lastName} autoComplete="family-name" />
            </Field>
          </div>

          <Field label="Email address" id="email" error={errors.email?.message}>
            <Input id="email" type="email" register={register('email')} error={errors.email}
              placeholder="you@yourschool.edu" autoComplete="email" />
          </Field>

          <Field label="Password" id="password" error={errors.password?.message} hint="8+ chars, upper + lower + number">
            <Input id="password" type="password" register={register('password')} error={errors.password}
              placeholder="••••••••" autoComplete="new-password" />
          </Field>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white font-bold text-base hover:from-[#4A59A8] hover:to-[#6672C0] disabled:opacity-55 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3E4C8C]/25 hover:shadow-[#3E4C8C]/40 hover:scale-[1.01]">
          {isSubmitting
            ? <><Loader2 size={18} className="animate-spin" /> Creating your school…</>
            : <><span>Create school account</span><ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
          }
        </button>
      </form>

      <p className="text-center text-sm text-[#5B5F6B] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[#3E4C8C] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
