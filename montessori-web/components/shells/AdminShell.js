'use client';
/**
 * Admin Shell — Dense, table-first layout with a LEFT NAV RAIL.
 * Accent: Indigo (#3E4C8C)
 * Nav grammar: icon rail (collapsed) + text labels on hover/expand
 */
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, Calendar, DollarSign,
  Settings, ChevronRight, Bell, LogOut, Building2, BookOpen,
  Package, Megaphone, Sparkles,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../store/authSlice';
import { useRouter } from 'next/navigation';
import NotificationBell from '../shared/NotificationBell';
import SyncStatusIndicator from '../shared/SyncStatusIndicator';
import AIChatWidget from '../shared/AIChatWidget';
import useHasPermission from '../../lib/hooks/useHasPermission';

const NAV_ITEMS = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/students',     label: 'Students',     icon: GraduationCap,   perm: 'student:read' },
  { href: '/admin/staff',        label: 'Staff',        icon: Users,           perm: 'hr:read' },
  { href: '/admin/classrooms',   label: 'Classrooms',   icon: Building2,       perm: 'student:read' },
  { href: '/admin/curriculum',   label: 'Curriculum',   icon: BookOpen,        perm: 'curriculum:read' },
  { href: '/admin/calendar',     label: 'Calendar',     icon: Calendar },
  { href: '/admin/finance',      label: 'Finance',      icon: DollarSign,      perm: 'finance:read' },
  { href: '/admin/inventory',    label: 'Inventory',    icon: Package,         perm: 'inventory:read' },
  { href: '/admin/communication',label: 'Comms',        icon: Megaphone,       perm: 'announcement:read' },
  { href: '/admin/ai-insights',  label: 'AI Insights',  icon: Sparkles,        perm: 'ai:insights' },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings,        perm: 'admin:org' },
];

export default function AdminShell({ children }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.replace('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* ── Nav Rail ─────────────────────────────────────────────────── */}
      <nav
        className={`flex flex-col bg-primary text-white transition-all duration-200 shrink-0 ${
          expanded ? 'w-56' : 'w-16'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-3 border-b border-primary-light/30">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold text-base shrink-0">
            M
          </div>
          {expanded && (
            <span className="ml-3 font-display font-semibold text-sm truncate animate-fade-in">
              Montessori
            </span>
          )}
        </div>

        {/* Nav items */}
        <div className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavRailItem
              key={item.href}
              {...item}
              expanded={expanded}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>

        {/* User + logout */}
        <div className="p-2 border-t border-primary-light/30">
          {expanded && (
            <p className="px-2 py-1 text-xs text-white/60 truncate">
              {user?.firstName} {user?.lastName}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
            aria-label="Log out"
          >
            <LogOut size={18} className="shrink-0" />
            {expanded && <span className="animate-fade-in">Log out</span>}
          </button>
        </div>
      </nav>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="font-display font-semibold text-ink text-base">
            {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <SyncStatusIndicator />
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <AIChatWidget />
    </div>
  );
}

function NavRailItem({ href, label, icon: Icon, expanded, active, perm }) {
  const hasPermission = useHasPermission(perm);
  if (perm && !hasPermission) return null;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 mx-2 px-2 py-2.5 rounded-lg transition-colors text-sm focusable ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      {expanded && <span className="truncate animate-fade-in">{label}</span>}
    </Link>
  );
}
