'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Trigger scrolled state immediately on mount if already scrolled
    setScrolled(window.scrollY > 10);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled
        ? 'bg-white shadow-sm border-b border-[#E2DFD8]'
        : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#3E4C8C] flex items-center justify-center shadow-sm group-hover:bg-[#2E3A6E] transition-colors">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-black text-base text-[#1F2430] leading-none">Montessori</p>
              <p className="text-[10px] text-[#5B5F6B] leading-none tracking-widest uppercase">Platform</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-lg text-[15px] font-bold transition-colors ${
                  pathname === href
                    ? 'text-[#3E4C8C] bg-[#3E4C8C]/8'
                    : 'text-[#1F2430] hover:text-[#3E4C8C] hover:bg-[#F5F4F1]'
                }`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-[15px] font-bold text-[#3E4C8C] hover:text-[#2E3A6E] transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white text-sm font-bold hover:from-[#4A59A8] hover:to-[#6672C0] transition-all shadow-md shadow-[#3E4C8C]/25 hover:shadow-[#3E4C8C]/40 hover:scale-[1.02]">
              Get started
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#1F2430] hover:bg-[#F5F4F1] transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-[#E2DFD8] shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}
                className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${
                  pathname === href
                    ? 'text-[#3E4C8C] bg-[#3E4C8C]/8'
                    : 'text-[#1F2430] hover:text-[#3E4C8C] hover:bg-[#F5F4F1]'
                }`}>
                {label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#E2DFD8] grid grid-cols-2 gap-2">
              <Link href="/login"
                className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-[#3E4C8C] border-2 border-[#3E4C8C]/25 hover:bg-[#3E4C8C]/5 transition-colors">
                Sign in
              </Link>
              <Link href="/register"
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#3E4C8C] to-[#5560A8] text-white hover:from-[#4A59A8] hover:to-[#6672C0] transition-all">
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
