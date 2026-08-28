'use client';
/**
 * Finance/HR Shell — Dense, data-table-first. Accent: Slate (#52607A).
 * Nav grammar: Fixed LEFT SIDEBAR (wide, with section grouping).
 * Deliberately calmer than Admin — finance screens read as "serious data".
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, CreditCard, TrendingUp,
  Users, Calendar, BarChart2, Package, Settings, LogOut,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../store/authSlice';
import NotificationBell from '../shared/NotificationBell';
import useHasPermission from '../../lib/hooks/useHasPermission';

const SECTIONS = [
  {
    label: 'Finance',
    items: [
      { href: '/finance/dashboard', label: 'Overview',     icon: LayoutDashboard, perm: 'finance:read' },
      { href: '/finance/invoices',  label: 'Invoices',     icon: FileText,        perm: 'finance:read' },
      { href: '/finance/payments',  label: 'Payments',     icon: CreditCard,      perm: 'finance:read' },
      { href: '/finance/expenses',  label: 'Expenses',     icon: TrendingUp,      perm: 'finance:read' },
      { href: '/finance/ledger',    label: 'Ledger',       icon: BarChart2,       perm: 'finance:read' },
    ],
  },
  {
    label: 'HR',
    items: [
      { href: '/finance/staff',     label: 'Staff',        icon: Users,           perm: 'hr:read' },
      { href: '/finance/payroll',   label: 'Payroll',      icon: CreditCard,      perm: 'hr:read' },
      { href: '/finance/leave',     label: 'Leave',        icon: Calendar,        perm: 'hr:read' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/finance/inventory', label: 'Inventory',    icon: Package,         perm: 'inventory:read' },
    ],
  },
];

export default function FinanceShell({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <nav className="w-52 bg-slate text-white flex flex-col shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 h-14 px-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold text-sm">
            M
          </div>
          <span className="font-display font-semibold text-sm">Finance & HR</span>
        </div>

        {/* Nav sections */}
        <div className="flex-1 py-4">
          {SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-4 text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                {section.label}
              </p>
              {section.items.map((item) => (
                <FinanceNavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
              ))}
            </div>
          ))}
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/50 truncate px-1 mb-1">
            {user?.firstName} {user?.lastName}
          </p>
          <button
            onClick={() => { dispatch(clearAuth()); router.replace('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <p className="font-display font-semibold text-ink text-sm">
            {SECTIONS.flatMap((s) => s.items).find((i) => pathname.startsWith(i.href))?.label ?? 'Finance & HR'}
          </p>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function FinanceNavItem({ href, label, icon: Icon, active, perm }) {
  const hasPermission = useHasPermission(perm);
  if (perm && !hasPermission) return null;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-sm transition-colors focusable ${
        active ? 'bg-white/20 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}
