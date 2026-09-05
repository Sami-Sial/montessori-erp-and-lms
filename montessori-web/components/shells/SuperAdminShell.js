'use client';
/**
 * Super Admin Shell — same visual style as AdminShell.
 * Left collapsible rail, white main area, indigo accent.
 * Shows a "Super Admin" badge to distinguish from school admin.
 */
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, LogOut, ShieldCheck, ScrollText,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../lib/hooks/useAuth';
import NotificationBell from '../shared/NotificationBell';
import SyncStatusIndicator from '../shared/SyncStatusIndicator';
import useHasPermission from '../../lib/hooks/useHasPermission';

const NAV_ITEMS = [
  { href: '/superadmin/dashboard',     label: 'Platform Overview', icon: LayoutDashboard },
  { href: '/superadmin/organizations', label: 'Organizations',     icon: Building2 },
  { href: '/superadmin/users',         label: 'All Users',         icon: Users },
  { href: '/superadmin/audit',         label: 'Audit Log',         icon: ScrollText },
];

function NavRailItem({ href, label, icon: Icon, expanded, active }) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 mx-2 px-2 py-2.5 rounded-lg transition-colors text-sm focusable ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
      aria-current={active ? 'page' : undefined}>
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      {expanded && <span className="truncate animate-fade-in">{label}</span>}
    </Link>
  );
}

export default function SuperAdminShell({ children }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useSelector((s) => s.auth);
  const { logout } = useAuth();

  const activeLabel = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? 'Platform Overview';

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
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-white" aria-hidden="true" />
          </div>
          {expanded && (
            <div className="ml-3 animate-fade-in overflow-hidden">
              <p className="font-display font-semibold text-sm truncate leading-none">Montessori</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider leading-none mt-0.5">Super Admin</p>
            </div>
          )}
        </div>

        {/* Super admin badge */}
        {expanded && (
          <div className="mx-2 mt-3 px-3 py-2 rounded-lg bg-white/10 border border-white/15 animate-fade-in">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span className="text-xs font-bold text-white/80">Platform Access</span>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">All organizations</p>
          </div>
        )}

        {/* Nav items */}
        <div className="flex-1 py-3 space-y-0.5 overflow-y-auto mt-1">
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
            <p className="px-2 py-1 text-xs text-white/60 truncate animate-fade-in">
              {user?.firstName} {user?.lastName}
            </p>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm focusable"
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
          <h1 className="font-display font-semibold text-ink text-base">{activeLabel}</h1>
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
    </div>
  );
}
