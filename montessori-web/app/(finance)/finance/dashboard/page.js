'use client';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../../../lib/api/finance';
import { SkeletonStatCard, SkeletonTable } from '../../../../components/shared/Skeleton';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function KPI({ label, value, sub, icon: Icon, color, href }) {
  const card = (
    <div className={`stat-card hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-ink font-mono mt-1">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default function FinanceDashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: financeApi.getSummary,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['finance', 'invoices', 'overdue'],
    queryFn: () => financeApi.listInvoices({ overdueOnly: true, pageSize: 8 }),
  });

  const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold text-ink">Finance Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonStatCard key={i} />) : (
          <>
            <KPI label="Total outstanding" value={fmt(summary?.totalOutstanding)} sub={`${summary?.overdueCount ?? 0} overdue invoices`}
              icon={AlertTriangle} color="bg-warning/10 text-warning" href="/finance/invoices?overdueOnly=true" />
            <KPI label="Collected this month" value={fmt(summary?.collectedThisMonth)}
              icon={TrendingUp} color="bg-success/10 text-success" href="/finance/payments" />
            <KPI label="Expenses this month" value={fmt(summary?.expensesThisMonth)}
              icon={DollarSign} color="bg-danger/10 text-danger" href="/finance/expenses" />
            <KPI label="Net this month" value={fmt(summary?.netThisMonth)}
              sub={Number(summary?.netThisMonth) >= 0 ? 'Surplus' : 'Deficit'}
              icon={CreditCard} color={Number(summary?.netThisMonth) >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} />
          </>
        )}
      </div>

      {/* Overdue invoices */}
      {invoicesData?.data?.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg">
            <p className="font-semibold text-sm text-ink flex items-center gap-2">
              <AlertTriangle size={15} className="text-warning" aria-hidden="true" />
              Overdue Invoices
            </p>
            <Link href="/finance/invoices?overdueOnly=true" className="text-xs text-primary hover:underline focusable flex items-center gap-1">
              View all <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border">
                {['Invoice', 'Student', 'Amount due', 'Days overdue'].map(h => (
                  <th key={h} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoicesData.data.map((inv) => {
                const daysPast = Math.floor((Date.now() - new Date(inv.dueDate)) / (24*3600*1000));
                return (
                  <tr key={inv.id} className="hover:bg-bg/60">
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-ink">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2.5 text-ink">{inv.student?.firstName} {inv.student?.lastName}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-danger">{fmt(inv.outstandingAmount)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`badge-chip ${daysPast > 30 ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                        {daysPast}d overdue
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
