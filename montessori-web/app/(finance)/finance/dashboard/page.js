'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../../../../lib/api/finance';
import { SkeletonStatCard, SkeletonTable, SkeletonCard } from '../../../../components/shared/Skeleton';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, ArrowRight, BarChart3, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { FinanceCharts } from '../../../../components/finance/FinanceCharts';
import { useToast } from '../../../../lib/hooks/useToast';

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
  const toast = useToast();
  const qc = useQueryClient();
  const [remindingId, setRemindingId] = useState(null);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: financeApi.getSummary,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['finance', 'invoices', 'overdue'],
    queryFn: () => financeApi.listInvoices({ overdueOnly: true, pageSize: 8 }),
  });

  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['finance', 'analytics'],
    queryFn: () => financeApi.getAnalytics(),
  });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['finance', 'payments', 'recent'],
    queryFn: () => financeApi.listPayments({ pageSize: 8 }),
  });

  const remindMut = useMutation({
    mutationFn: (invoiceId) => financeApi.sendReminder(invoiceId),
    onSuccess: () => {
      toast.success('Reminder sent to parent');
      setRemindingId(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send reminder');
      setRemindingId(null);
    },
  });

  const handleRemind = (inv) => {
    setRemindingId(inv.id);
    remindMut.mutate(inv.id);
  };

  // Transform analytics array into { month: { collected, expenses, month } } for FinanceCharts
  const monthlyData = (analyticsData ?? []).reduce((acc, item) => {
    acc[item.month] = item;
    return acc;
  }, {});

  const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const recentPayments = paymentsData?.data ?? [];

  return (
    <div className="space-y-6 pb-10">
      <h1 className="font-display text-xl font-bold text-ink">Finance Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonStatCard key={i} />) : (
          <>
            <KPI label="Total outstanding" value={fmt(summary?.totalOutstanding)} sub={`${summary?.overdueCount ?? 0} overdue invoices`}
              icon={AlertTriangle} color="bg-warning/10 text-warning" href="/finance/invoices?overdueOnly=true" />
            <KPI label="Collected this month" value={fmt(summary?.collectedThisMonth)}
              icon={TrendingUp} color="bg-success/10 text-success" />
            <KPI label="Expenses this month" value={fmt(summary?.expensesThisMonth)}
              icon={DollarSign} color="bg-danger/10 text-danger" />
            <KPI label="Net this month" value={fmt(summary?.netThisMonth)}
              sub={Number(summary?.netThisMonth) >= 0 ? 'Surplus' : 'Deficit'}
              icon={CreditCard} color={Number(summary?.netThisMonth) >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} />
          </>
        )}
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" aria-hidden="true" />
            Revenue vs Expenses
          </h2>
        </div>
        {loadingAnalytics ? <SkeletonCard /> : (
          <FinanceCharts monthlyData={monthlyData} />
        )}
      </div>

      {/* Two-column: Overdue Invoices + Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Overdue Invoices */}
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg">
            <p className="font-semibold text-sm text-ink flex items-center gap-2">
              <AlertTriangle size={15} className="text-warning" aria-hidden="true" />
              Overdue Invoices
            </p>
            <Link href="/finance/invoices" className="text-xs text-primary hover:underline focusable flex items-center gap-1">
              View all <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          {!invoicesData?.data?.length ? (
            <div className="flex flex-col items-center py-10 text-muted">
              <CheckCircle2 size={32} className="text-success mb-2" />
              <p className="text-sm font-medium text-success">No overdue invoices!</p>
              <p className="text-xs text-muted mt-0.5">All accounts are current.</p>
            </div>
          ) : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  {['Invoice', 'Student', 'Due', 'Action'].map(h => (
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
                      <td className="px-4 py-2.5 text-ink text-xs">{inv.student?.firstName} {inv.student?.lastName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`badge-chip text-xs ${daysPast > 30 ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                          {daysPast}d
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleRemind(inv)}
                          disabled={remindingId === inv.id}
                          title="Send payment reminder to parent"
                          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors focusable disabled:opacity-50"
                        >
                          {remindingId === inv.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Bell size={14} />
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg">
            <p className="font-semibold text-sm text-ink flex items-center gap-2">
              <TrendingUp size={15} className="text-success" aria-hidden="true" />
              Recent Transactions
            </p>
          </div>
          {loadingPayments ? (
            <div className="p-4"><SkeletonTable rows={5} cols={3} /></div>
          ) : recentPayments.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted">
              <CreditCard size={32} className="text-border mb-2" />
              <p className="text-sm">No payments recorded yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentPayments.map(pmt => (
                <li key={pmt.id} className="flex items-center justify-between px-4 py-3 hover:bg-bg/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {pmt.invoice?.student?.firstName} {pmt.invoice?.student?.lastName}
                      </p>
                      <p className="text-xs text-muted">
                        {pmt.invoice?.invoiceNumber} &bull; {formatDistanceToNow(new Date(pmt.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-success text-sm shrink-0 ml-2">+{fmt(pmt.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
