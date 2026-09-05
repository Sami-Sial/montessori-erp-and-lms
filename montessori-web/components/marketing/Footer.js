import Link from 'next/link';
import { GraduationCap, Mail, Phone, ArrowRight } from 'lucide-react';

const PLATFORM_LINKS = [
  { label: 'Features',          href: '/features' },
  { label: 'For Teachers',      href: '/features#teachers' },
  { label: 'For Parents',       href: '/features#parents' },
  { label: 'For Admins',        href: '/features#admins' },
  { label: 'AI Insights',       href: '/features#ai' },
  { label: 'Offline PWA',       href: '/features#offline' },
];

const COMPANY_LINKS = [
  { label: 'About us',          href: '/about' },
  { label: 'Contact',           href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy',    href: '/privacy' },
  { label: 'Terms of Service',  href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0D1117] text-white">

      {/* ── Main footer body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand block — wider column */}
          <div className="lg:col-span-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3E4C8C] to-[#5560A8] flex items-center justify-center shadow-lg shadow-[#3E4C8C]/30">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div className="leading-tight">
                <p className="font-display font-black text-white text-xl leading-none">Montessori</p>
                <p className="text-[11px] text-white/40 leading-none tracking-widest uppercase mt-0.5">Platform</p>
              </div>
            </Link>

            <p className="text-white/55 text-base leading-relaxed max-w-sm mb-8">
              The all-in-one ERP & LMS built specifically for Montessori schools.
              Multi-tenant, offline-first, and AI-powered.
            </p>

            {/* Contact details */}
            <div className="space-y-3">
              <a href="mailto:samisial1555@gmail.com"
                className="flex items-center gap-3 group/link">
                <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover/link:bg-[#3E4C8C]/40 transition-colors">
                  <Mail size={15} className="text-white/60 group-hover/link:text-white transition-colors" />
                </div>
                <span className="text-white/60 text-sm group-hover/link:text-white transition-colors font-medium">
                  samisial1555@gmail.com
                </span>
              </a>
              <a href="tel:+923146180920"
                className="flex items-center gap-3 group/link">
                <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover/link:bg-[#3E4C8C]/40 transition-colors">
                  <Phone size={15} className="text-white/60 group-hover/link:text-white transition-colors" />
                </div>
                <span className="text-white/60 text-sm group-hover/link:text-white transition-colors font-medium">
                  +92 314 6180920
                </span>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-8">

            <div>
              <p className="text-sm font-black text-[#A8B4F0] uppercase tracking-widest mb-5">Platform</p>
              <ul className="space-y-3">
                {PLATFORM_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-white/55 hover:text-white font-medium transition-colors hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-black text-[#A8B4F0] uppercase tracking-widest mb-5">Company</p>
              <ul className="space-y-3 mb-8">
                {COMPANY_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-white/55 hover:text-white font-medium transition-colors hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="text-sm font-black text-[#A8B4F0] uppercase tracking-widest mb-5">Legal</p>
              <ul className="space-y-3">
                {LEGAL_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-white/55 hover:text-white font-medium transition-colors hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA card */}
            <div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-display font-black text-white text-base mb-2">
                  Ready to get started?
                </p>
                <p className="text-white/50 text-xs leading-relaxed mb-5">
                  Set up your Montessori school account in minutes.
                </p>
                <Link href="/register"
                  className="group flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white text-sm font-bold hover:from-[#4A59A8] hover:to-[#6672C0] transition-all shadow-md shadow-[#3E4C8C]/30">
                  Get started
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/contact"
                  className="flex items-center justify-center mt-2.5 px-4 py-2.5 rounded-xl border border-white/15 text-white/60 text-xs font-semibold hover:text-white hover:border-white/30 hover:bg-white/8 transition-all">
                  Contact us
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Montessori Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-white/30 text-xs font-medium hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-white/30 text-xs font-medium hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/contact" className="text-white/30 text-xs font-medium hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
