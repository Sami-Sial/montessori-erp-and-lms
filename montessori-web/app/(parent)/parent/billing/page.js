'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { financeApi } from '../../../../lib/api/finance';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { CreditCard, CheckCircle2, XCircle, FileDown, Loader2, Eye, X, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const STATUS_CHIP = {
  DRAFT:          'bg-muted/10 text-muted',
  SENT:           'bg-info/10 text-info',
  PARTIALLY_PAID: 'bg-warning/10 text-warning',
  PAID:           'bg-success/10 text-success',
  OVERDUE:        'bg-danger/10 text-danger',
  CANCELLED:      'bg-border text-muted',
};

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

export default function ParentBillingPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('status');
  const paidInvoice = searchParams.get('invoice');
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);
  const [detailsModalInvoiceId, setDetailsModalInvoiceId] = useState(null);
  const [detailsInvoice, setDetailsInvoice] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [tab, setTab] = useState('invoices');

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'invoices', 'parent'],
    queryFn: () => financeApi.listInvoices({ pageSize: 50 }),
  });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['finance', 'payments', 'parent'],
    queryFn: () => financeApi.listPayments({ pageSize: 50 }),
    enabled: tab === 'history',
  });

  const invoices = data?.data ?? [];
  const payments = paymentsData?.data ?? [];

  const handlePayOnline = async (invoiceId) => {
    try {
      setLoadingInvoiceId(invoiceId);
      const { checkoutUrl } = await financeApi.createCheckoutSession(invoiceId);
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to start checkout. Please try again.');
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    const { downloadInvoicePdf } = await import('../../../../lib/utils/pdfGenerator');
    const fullInvoice = await financeApi.getInvoice(invoiceId);
    downloadInvoicePdf(fullInvoice);
  };

  const handleViewDetails = async (invoiceId) => {
    setDetailsModalInvoiceId(invoiceId);
    setLoadingDetails(true);
    try {
      const fullInvoice = await financeApi.getInvoice(invoiceId);
      setDetailsInvoice(fullInvoice);
    } catch (err) {
      console.error(err);
      alert('Unable to load invoice details.');
      setDetailsModalInvoiceId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Summary calculations
  const totalOutstanding = invoices.reduce((s, inv) => {
    const out = Number(inv.totalAmount ?? 0) - Number(inv.paidAmount ?? 0);
    return s + (out > 0 ? out : 0);
  }, 0);
  const paidCount = invoices.filter(i => i.status === 'PAID').length;
  const overdueCount = invoices.filter(i => ['SENT', 'PARTIALLY_PAID'].includes(i.status) && new Date(i.dueDate) < new Date()).length;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Billing &amp; Invoices</h1>
        <p className="text-sm text-muted mt-1">View and pay your child&apos;s school invoices online.</p>
      </div>

      {/* Payment status banners */}
      {paymentStatus === 'success' && (
        <div className="card border-success/30 bg-success/5 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 size={20} className="text-success shrink-0" />
          <div>
            <p className="font-semibold text-sm text-success">Payment successful!</p>
            <p className="text-xs text-muted">
              {paidInvoice ? `Invoice ${paidInvoice} has been paid.` : 'Your payment has been processed.'} It may take a moment to reflect.
            </p>
          </div>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="card border-warning/30 bg-warning/5 flex items-center gap-3 animate-slide-up">
          <XCircle size={20} className="text-warning shrink-0" />
          <div>
            <p className="font-semibold text-sm text-warning">Payment cancelled</p>
            <p className="text-xs text-muted">You can try again whenever you&apos;re ready.</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {!isLoading && invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Total Due</p>
            <p className="font-display text-2xl font-bold text-danger mt-1 font-mono">{fmt(totalOutstanding)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Paid</p>
            <p className="font-display text-2xl font-bold text-success mt-1">{paidCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Overdue</p>
            <p className="font-display text-2xl font-bold text-warning mt-1">{overdueCount}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('invoices')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focusable ${tab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          Invoices
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focusable ${tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          <History size={14} /> Payment History
        </button>
      </div>

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <div className="card overflow-hidden p-0">
          {isLoading ? (
            <div className="p-4"><SkeletonTable rows={5} cols={6} /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    {['Invoice #', 'Due Date', 'Total', 'Outstanding', 'Status', ''].map(h => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map(inv => {
                    const outstanding = Number(inv.totalAmount ?? 0) - Number(inv.paidAmount ?? 0);
                    const isOverdue = ['SENT', 'PARTIALLY_PAID'].includes(inv.status) && new Date(inv.dueDate) < new Date();
                    const canPay = outstanding > 0 && ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-bg/60">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-ink">{inv.invoiceNumber}</td>
                        <td className={`px-4 py-3 text-xs font-mono ${isOverdue ? 'text-danger font-semibold' : 'text-muted'}`}>
                          {format(new Date(inv.dueDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 font-mono text-ink">{fmt(inv.totalAmount)}</td>
                        <td className={`px-4 py-3 font-mono font-semibold ${outstanding > 0 ? 'text-danger' : 'text-success'}`}>
                          {fmt(outstanding)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge-chip ${STATUS_CHIP[inv.status] ?? STATUS_CHIP.SENT}`}>{inv.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(inv.id)}
                              title="View Details"
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors focusable"
                              aria-label={`View Details for ${inv.invoiceNumber}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(inv.id)}
                              title="Download PDF"
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors focusable"
                              aria-label={`Download PDF for ${inv.invoiceNumber}`}
                            >
                              <FileDown size={15} />
                            </button>
                            {canPay && (
                              <button
                                onClick={() => handlePayOnline(inv.id)}
                                disabled={loadingInvoiceId === inv.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors focusable"
                              >
                                {loadingInvoiceId === inv.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CreditCard size={13} />
                                )}
                                Pay Online
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {tab === 'history' && (
        <div className="card overflow-hidden p-0">
          {loadingPayments ? (
            <div className="p-4"><SkeletonTable rows={5} cols={4} /></div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted">
              <History size={40} className="text-border mb-3" />
              <p className="text-sm font-medium">No payment history yet.</p>
              <p className="text-xs mt-1">Your completed payments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    {['Date', 'Invoice', 'Method', 'Reference', 'Amount'].map(h => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map(pmt => (
                    <tr key={pmt.id} className="hover:bg-bg/60">
                      <td className="px-4 py-3 text-xs text-muted font-mono">
                        {pmt.paidAt ? format(new Date(pmt.paidAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-medium text-ink">
                        {pmt.invoice?.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-chip bg-secondary/10 text-secondary text-xs">
                          {pmt.paymentMethod?.name ?? 'Online'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted font-mono">
                        {pmt.referenceNumber ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-success">
                        {fmt(pmt.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice Details Modal */}
      {detailsModalInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold font-display text-ink">Invoice Details</h2>
              <button onClick={() => setDetailsModalInvoiceId(null)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface focusable">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {loadingDetails ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
              ) : detailsInvoice ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-ink">Invoice {detailsInvoice.invoiceNumber}</p>
                      <p className="text-sm text-muted">Due: {format(new Date(detailsInvoice.dueDate), 'MMM d, yyyy')}</p>
                    </div>
                    <span className={`badge-chip ${STATUS_CHIP[detailsInvoice.status] ?? STATUS_CHIP.SENT}`}>{detailsInvoice.status}</span>
                  </div>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-bg border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {detailsInvoice.lineItems?.map(item => (
                          <tr key={item.id} className="hover:bg-bg/60">
                            <td className="px-4 py-3 text-ink">{item.description}</td>
                            <td className="px-4 py-3 text-right text-muted">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-muted">{fmt(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right font-medium text-ink">{fmt(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-bg/50 border-t border-border font-semibold">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-muted">Total Amount</td>
                          <td className="px-4 py-3 text-right text-ink">{fmt(detailsInvoice.totalAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-muted">Paid Amount</td>
                          <td className="px-4 py-3 text-right text-success">{fmt(detailsInvoice.paidAmount)}</td>
                        </tr>
                        <tr className="text-base">
                          <td colSpan={3} className="px-4 py-3 text-right text-ink">Balance Due</td>
                          <td className="px-4 py-3 text-right text-danger font-bold">{fmt(Number(detailsInvoice.totalAmount) - Number(detailsInvoice.paidAmount))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {detailsInvoice.notes && (
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase mb-1">Notes</p>
                      <p className="text-sm text-ink bg-bg p-3 rounded-lg border border-border">{detailsInvoice.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted">Failed to load invoice details.</div>
              )}
            </div>
            <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
              <button onClick={() => setDetailsModalInvoiceId(null)} className="px-4 py-2 text-sm font-semibold text-ink border border-border bg-surface hover:bg-bg rounded-xl transition-colors">
                Close
              </button>
              {(Number(detailsInvoice?.totalAmount || 0) - Number(detailsInvoice?.paidAmount || 0)) > 0 && ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(detailsInvoice?.status) && (
                <button
                  onClick={() => handlePayOnline(detailsInvoice.id)}
                  disabled={loadingInvoiceId === detailsInvoice.id}
                  className="flex items-center gap-1.5 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loadingInvoiceId === detailsInvoice.id ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  Pay Balance Online
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
