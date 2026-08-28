'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { financeApi } from '../../../../lib/api/finance';
import { studentsApi } from '../../../../lib/api/students';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { Plus, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const STATUS_CHIP = {
  DRAFT:          'bg-muted/10 text-muted',
  SENT:           'bg-info/10 text-info',
  PARTIALLY_PAID: 'bg-warning/10 text-warning',
  PAID:           'bg-success/10 text-success',
  OVERDUE:        'bg-danger/10 text-danger',
  CANCELLED:      'bg-border text-muted',
};

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

export default function InvoicesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unitPrice: '' }]);

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'invoices', page, statusFilter],
    queryFn: () => financeApi.listInvoices({ page, pageSize: 20, status: statusFilter || undefined }),
    keepPreviousData: true,
  });

  const { data: students } = useQuery({ queryKey: ['students'], queryFn: () => studentsApi.list({ pageSize: 200 }) });
  const { data: feeStructures } = useQuery({ queryKey: ['feeStructures'], queryFn: financeApi.getFeeStructures });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const createMut = useMutation({
    mutationFn: financeApi.createInvoice,
    onSuccess: () => {
      toast.success('Invoice created');
      qc.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
      setShowCreate(false); reset();
      setLineItems([{ description: '', quantity: 1, unitPrice: '' }]);
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const payMut = useMutation({
    mutationFn: ({ invoiceId, amount }) => financeApi.recordPayment({ invoiceId, amount: parseFloat(amount) }),
    onSuccess: () => { toast.success('Payment recorded'); qc.invalidateQueries({ queryKey: ['finance'] }); },
    onError: (err) => toast.error('Failed', err.message),
  });

  const onSubmit = (data) => {
    const items = lineItems.filter((l) => l.description && l.unitPrice);
    if (!items.length) { toast.error('Add at least one line item'); return; }
    createMut.mutate({ ...data, lineItems: items.map((l) => ({ ...l, unitPrice: parseFloat(l.unitPrice), quantity: parseInt(l.quantity) })) });
  };

  const invoices = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-xl font-bold text-ink">Invoices</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">All statuses</option>
            {['SENT','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-slate text-white rounded-lg text-sm font-medium hover:bg-slate/80 focusable">
            <Plus size={16} /> Create invoice
          </button>
        </div>
      </div>

      {/* Create invoice form */}
      {showCreate && (
        <div className="card border-slate/30 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-ink">New Invoice</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Student *</label>
                <select {...register('studentId', { required: true })} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">Select student</option>
                  {students?.data?.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Due date *</label>
                <input type="date" {...register('dueDate', { required: true })} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <label className="text-xs text-muted font-medium">Line items</label>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input value={item.description} onChange={e => setLineItems(l => l.map((x,j) => j===i ? {...x, description: e.target.value} : x))}
                    placeholder="Description" className="col-span-6 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  <input type="number" value={item.quantity} min="1" onChange={e => setLineItems(l => l.map((x,j) => j===i ? {...x, quantity: e.target.value} : x))}
                    placeholder="Qty" className="col-span-2 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  <input type="number" value={item.unitPrice} step="0.01" onChange={e => setLineItems(l => l.map((x,j) => j===i ? {...x, unitPrice: e.target.value} : x))}
                    placeholder="Price" className="col-span-3 px-3 py-2 rounded-lg border border-border bg-bg text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none" />
                  <button type="button" onClick={() => setLineItems(l => l.filter((_,j) => j!==i))}
                    className="col-span-1 text-muted hover:text-danger text-center focusable" aria-label="Remove line">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setLineItems(l => [...l, { description: '', quantity: 1, unitPrice: '' }])}
                className="text-xs text-primary hover:underline focusable">+ Add line item</button>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting || createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-slate text-white rounded-lg text-sm font-medium hover:bg-slate/80 disabled:opacity-50 focusable">
                {(isSubmitting || createMut.isPending) && <Loader2 size={14} className="animate-spin" />} Create & send
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={8} cols={6} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Invoice #', 'Student', 'Issued', 'Due', 'Total', 'Outstanding', 'Status', ''].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-ink">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-ink">{inv.student?.firstName} {inv.student?.lastName}</td>
                    <td className="px-4 py-3 text-muted text-xs">{format(new Date(inv.issueDate), 'MMM d, yyyy')}</td>
                    <td className={`px-4 py-3 text-xs font-mono ${inv.isOverdue ? 'text-danger font-semibold' : 'text-muted'}`}>
                      {format(new Date(inv.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink">{fmt(inv.totalAmount)}</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${Number(inv.outstandingAmount) > 0 ? 'text-danger' : 'text-success'}`}>
                      {fmt(inv.outstandingAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-chip ${STATUS_CHIP[inv.status] ?? STATUS_CHIP.SENT}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(inv.outstandingAmount) > 0 && ['SENT','PARTIALLY_PAID','OVERDUE'].includes(inv.status) && (
                        <button onClick={() => {
                          const amount = prompt(`Record payment for ${inv.invoiceNumber}\nOutstanding: ${fmt(inv.outstandingAmount)}\n\nAmount paid:`);
                          if (amount) payMut.mutate({ invoiceId: inv.id, amount });
                        }} className="text-xs text-success hover:underline focusable">Record payment</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data?.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">Page {page} of {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p-1)} disabled={page===1} className="px-3 py-1 rounded border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page>=data.pagination.totalPages} className="px-3 py-1 rounded border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
