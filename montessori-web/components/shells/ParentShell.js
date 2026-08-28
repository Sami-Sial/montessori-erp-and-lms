'use client';
/**
 * Parent Shell — Card-first, warm. Accent: Marigold (#E3A83D).
 * Nav grammar: BOTTOM TAB BAR (mobile-first, feels like an app).
 * Parents primarily use phones — bottom nav is the right choice here.
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ClipboardCheck, BookOpen, MessageSquare, Bell, LogOut, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../store/authSlice';
import NotificationBell from '../shared/NotificationBell';
import AIChatWidget from '../shared/AIChatWidget';

const TABS = [
  { href: '/parent/dashboard',  label: 'Home',        icon: Home },
  { href: '/parent/progress',   label: 'Progress',    icon: BookOpen },
  { href: '/parent/attendance', label: 'Attendance',  icon: ClipboardCheck },
  { href: '/parent/messages',   label: 'Messages',    icon: MessageSquare },
  { href: '/parent/ai',         label: 'Ask AI',      icon: Sparkles },
];

export default function ParentShell({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-20 md:pb-0">
      {/* ── Top bar (minimal) ─────────────────────────────────────────── */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14 max-w-screen-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center font-display font-bold text-accent text-sm">
              M
            </div>
            <span className="font-display font-semibold text-ink text-sm">
              {user?.firstName ? `Hi, ${user.firstName}` : 'Montessori'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => { dispatch(clearAuth()); router.replace('/login'); }}
              className="p-1.5 text-muted hover:text-ink rounded-lg focusable"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 max-w-screen-md mx-auto w-full">
        {children}
      </main>

      {/* ── Bottom Tab Bar (mobile) ──────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex md:hidden z-40"
        aria-label="Parent navigation"
      >
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors focusable ${
                active ? 'text-accent' : 'text-muted hover:text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop side nav */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-surface border-r border-border flex-col pt-16">
        <nav className="p-3 space-y-1" aria-label="Parent navigation">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focusable ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-bg hover:text-ink'
                }`}
              >
                <tab.icon size={18} aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <AIChatWidget />
    </div>
  );
}
