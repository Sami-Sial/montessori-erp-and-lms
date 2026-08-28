'use client';
/**
 * Teacher Shell — Card-first, visual layout with a TOP BAR + horizontal nav.
 * Accent: Moss green (#5C7A5A)
 * Nav grammar: sticky top bar with horizontal tab-style nav links.
 * Tablets are a PRIMARY device here — large touch targets, generous padding.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardCheck, Eye, BookOpen,
  MessageSquare, Sparkles, LogOut,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../store/authSlice';
import { useRouter } from 'next/navigation';
import NotificationBell from '../shared/NotificationBell';
import SyncStatusIndicator from '../shared/SyncStatusIndicator';
import AIChatWidget from '../shared/AIChatWidget';

const NAV_TABS = [
  { href: '/teacher/dashboard',   label: 'Overview',    icon: LayoutDashboard },
  { href: '/teacher/attendance',  label: 'Attendance',  icon: ClipboardCheck },
  { href: '/teacher/students',    label: 'Students',    icon: Users },
  { href: '/teacher/observations',label: 'Observations',icon: Eye },
  { href: '/teacher/curriculum',  label: 'Curriculum',  icon: BookOpen },
  { href: '/teacher/messages',    label: 'Messages',    icon: MessageSquare },
  { href: '/teacher/ai',          label: 'AI Assistant',icon: Sparkles },
];

export default function TeacherShell({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="bg-secondary text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-display font-bold text-sm">
              M
            </div>
            <span className="font-display font-semibold text-sm hidden sm:block">Montessori</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <SyncStatusIndicator light />
            <NotificationBell light />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="text-sm text-white/80 hidden md:block">{user?.firstName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focusable"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* ── Horizontal tab nav ─────────────────────────────────────── */}
        <nav className="flex overflow-x-auto px-4 md:px-6 pb-0 border-t border-white/10" aria-label="Teacher navigation">
          {NAV_TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors focusable ${
                  active
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/40'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <tab.icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-6 max-w-screen-xl mx-auto w-full">
        {children}
      </main>

      <AIChatWidget />
    </div>
  );
}
