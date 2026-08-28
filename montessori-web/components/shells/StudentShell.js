'use client';
/**
 * Student Shell — Full-bleed, game-like. Accent: Marigold + Clay.
 * Nav grammar: prominent bottom tab bar, large touch targets, rounded corners.
 * Typography: Baloo 2 (playful) for headings and score counters.
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Trophy, Star, Bell, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../store/authSlice';

const TABS = [
  { href: '/student/dashboard', label: 'Home',   icon: Home },
  { href: '/student/badges',    label: 'Badges', icon: Star },
  { href: '/student/board',     label: 'Board',  icon: Trophy },
];

export default function StudentShell({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

  return (
    <div
      className="min-h-screen flex flex-col pb-20"
      style={{ background: 'linear-gradient(135deg, #FFF8EC 0%, #F5F0FF 100%)' }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-playful font-bold text-white text-base" aria-hidden="true">
            {user?.firstName?.[0]}
          </div>
          <span className="font-playful font-bold text-ink text-base">
            {user?.firstName}'s Space 🌟
          </span>
        </div>
        <button
          onClick={() => { dispatch(clearAuth()); router.replace('/login'); }}
          className="p-1.5 text-muted hover:text-ink rounded-lg focusable"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex z-40"
        aria-label="Student navigation"
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-playful font-semibold transition-colors focusable ${
                active ? 'text-accent' : 'text-muted hover:text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
