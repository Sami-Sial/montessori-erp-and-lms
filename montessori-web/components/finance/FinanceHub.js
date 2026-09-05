'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../lib/hooks/useToast';
import { financeApi } from '../../lib/api/finance';
import { SkeletonStatCard, SkeletonTable } from '../shared/Skeleton';
import { DollarSign, AlertTriangle, TrendingUp, CreditCard, Plus, ArrowRight, CheckCircle, Calendar, Users, Briefcase, X, Trash2, Eye, Bell, Receipt, Loader2, FileDown } from 'lucide-react';
import { studentsApi } from '../../lib/api/students';
import { classroomsApi } from '../../lib/api/classrooms';
import { hrApi } from '../../lib/api/hr';
import Link from 'next/link';
import { format } from 'date-fns';

const STATUS_CHIP = {
  DRAFT:          'bg-muted/10 text-muted',
  SENT:           'bg-info/10 text-info',
  PARTIALLY_PAID: 'bg-warning/10 text-warning',
  PAID:           'bg-success/10 text-success',
  OVERDUE:        'bg-danger/10 text-danger',
  CANCELLED:      'bg-border text-muted',
};

const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceHub() {
  const [tab, setTab] = useState('invoices');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const toast = useToast();

  // Fee Structure modal
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({ name: '', amount: '', frequency: 'MONTHLY', classroomId: '' });

  // Multi-line Invoice modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unitPrice: '' }]);
  const invoiceTotal = lineItems.reduce((s, li) => s + (Number(li.quantity) * Number(li.unitPrice) || 0), 0);

  const addLineItem = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unitPrice: '' }]);
  const removeLineItem = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));
  const updateLineItem = (idx, field, value) => setLineItems(prev => prev.map((li, i) => i === idx ? { ...li, [field]: value } : li));

  // Record Payment modal
  const [paymentModal, setPaymentModal] = useState(null); // { id, invoiceNumber, outstanding }
  const [paymentForm, setPaymentForm] = useState({ amount: '', referenceNumber: '', notes: '' });

  // Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'SUPPLIES', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });

  // Batch Invoice modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({ classroomId: '', feeStructureId: '', dueDate: '' });

  // Payroll modal
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({ staffId: '', baseSalary: '', allowances: '0', deductions: '0', currency: 'USD', notes: '' });
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  const createFeeMut = useMutation({
    mutationFn: financeApi.createFeeStructure,
    onSuccess: () => {
      toast.success('Fee structure created');
      setIsFeeModalOpen(false);
      setFeeForm({ name: '', amount: '', frequency: 'MONTHLY', classroomId: '' });
      qc.invalidateQueries({ queryKey: ['feeStructures'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to create fee structure'),
  });

  const createInvoiceMut = useMutation({
    mutationFn: () => financeApi.createInvoice({
      studentId: invoiceStudentId,
      dueDate: invoiceDueDate,
      currency: 'USD',
      notes: invoiceNotes || null,
      lineItems: lineItems.map(li => ({ description: li.description, quantity: Number(li.quantity), unitPrice: Number(li.unitPrice) })),
    }),
    onSuccess: () => {
      toast.success('Invoice created');
      setIsInvoiceModalOpen(false);
      setInvoiceStudentId(''); setInvoiceDueDate(''); setInvoiceNotes('');
      setLineItems([{ description: '', quantity: 1, unitPrice: '' }]);
      qc.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to create invoice'),
  });

  const recordPaymentMut = useMutation({
    mutationFn: (data) => financeApi.recordPayment(data),
    onSuccess: () => {
      toast.success('Payment recorded');
      setPaymentModal(null);
      setPaymentForm({ amount: '', referenceNumber: '', notes: '' });
      qc.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to record payment'),
  });

  const createExpenseMut = useMutation({
    mutationFn: financeApi.createExpense,
    onSuccess: () => {
      toast.success('Expense logged');
      setIsExpenseModalOpen(false);
      setExpenseForm({ category: 'SUPPLIES', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });
      qc.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to log expense'),
  });

  const remindMut = useMutation({
    mutationFn: (id) => financeApi.sendReminder(id),
    onSuccess: () => { toast.success('Reminder sent to parent'); },
    onError: (err) => { toast.error(err.message || 'Failed to send reminder'); },
  });

  const createBatchMut = useMutation({
    mutationFn: (data) => financeApi.createBatchInvoices(data),
    onSuccess: (result) => {
      toast.success(`Created ${result?.count ?? 'multiple'} invoices successfully`);
      setIsBatchModalOpen(false);
      setBatchForm({ classroomId: '', feeStructureId: '', dueDate: '' });
      qc.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to generate batch invoices'),
  });

  const processPayrollMut = useMutation({
    mutationFn: (data) => hrApi.processPayroll(data),
    onSuccess: () => {
      toast.success('Payroll processed successfully');
      setIsPayrollModalOpen(false);
      setPayrollForm({ staffId: '', baseSalary: '', allowances: '0', deductions: '0', currency: 'USD', notes: '' });
      qc.invalidateQueries({ queryKey: ['hr', 'payroll'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to process payroll'),
  });

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: financeApi.getSummary,
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['finance', 'invoices', page],
    queryFn: () => financeApi.listInvoices({ page, pageSize: 20 }),
    enabled: tab === 'invoices',
    keepPreviousData: true,
  });

  const { data: expensesData, isLoading: loadingExpenses } = useQuery({
    queryKey: ['finance', 'expenses'],
    queryFn: () => financeApi.listExpenses({ pageSize: 20 }),
    enabled: tab === 'expenses',
  });

  const [ledgerPage, setLedgerPage] = useState(1);
  const { data: ledgerData, isLoading: loadingLedger } = useQuery({
    queryKey: ['finance', 'ledger', ledgerPage],
    queryFn: () => financeApi.getLedger({ page: ledgerPage, pageSize: 25 }),
    enabled: tab === 'ledger',
    keepPreviousData: true,
  });

  const { data: staffData } = useQuery({
    queryKey: ['hr', 'staff', 'all'],
    queryFn: () => hrApi.listStaff({ pageSize: 100 }),
  });
  const staffList = Array.isArray(staffData) ? staffData : (staffData?.data || []);

  const { data: payrollData, isLoading: loadingPayroll } = useQuery({
    queryKey: ['hr', 'payroll', payrollYear, payrollMonth, page],
    queryFn: () => hrApi.listPayroll({ year: payrollYear, month: payrollMonth, page, pageSize: 20 }),
    enabled: tab === 'payroll',
    keepPreviousData: true,
  });

  const TABS = [
    { key: 'invoices', label: 'Invoices' },
    { key: 'fee_structures', label: 'Fee Structures' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'ledger',   label: 'Ledger' },
    { key: 'payroll',  label: 'Payroll' },
  ];

  // Fee Structures Data
  const { data: feeStructures, isLoading: loadingFees } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: () => financeApi.getFeeStructures ? financeApi.getFeeStructures() : [],
  });

  // Student Fees Data
  const [studentClassroomId, setStudentClassroomId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  
  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list({ pageSize: 100 }),
  });
  const classrooms = Array.isArray(classroomsData) ? classroomsData : (classroomsData?.data ?? []);

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', page, studentSearch, studentClassroomId],
    queryFn: () => studentsApi.list({ page, pageSize: 100, search: studentSearch || undefined, classroomId: studentClassroomId || undefined }),
    keepPreviousData: true,
  });
  const studentsList = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Finance</h1>
          <p className="text-muted text-sm mt-0.5">Invoices, payments, expenses and ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsBatchModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-ink rounded-xl text-sm font-semibold hover:bg-secondary-dark transition-colors border border-border">
            <Users size={16} /> Batch Billing
          </button>
          <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-surface text-ink rounded-xl text-sm font-semibold hover:bg-bg transition-colors border border-border">
            <Receipt size={16} /> Log Expense
          </button>
          <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary ? [0,1,2,3].map(i => <SkeletonStatCard key={i} />) : (
          <>
            {[
              { label: 'Total outstanding', value: fmt(summary?.totalOutstanding), sub: `${summary?.overdueCount ?? 0} overdue`, icon: AlertTriangle, color: 'text-warning bg-warning/10' },
              { label: 'Collected this month', value: fmt(summary?.collectedThisMonth), sub: 'Received payments', icon: TrendingUp, color: 'text-success bg-success/10' },
              { label: 'Expenses this month', value: fmt(summary?.expensesThisMonth), sub: 'Total spent', icon: CreditCard, color: 'text-danger bg-danger/10' },
              { label: 'Net this month', value: fmt(summary?.netThisMonth), sub: Number(summary?.netThisMonth) >= 0 ? 'Surplus' : 'Deficit', icon: DollarSign, color: Number(summary?.netThisMonth) >= 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted uppercase tracking-wide font-medium">{label}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={15} />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-ink font-mono">{value}</p>
                <p className="text-xs text-muted mt-0.5">{sub}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} role="tab" aria-selected={tab === t.key}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focusable ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Invoices */}
      {tab === 'invoices' && (
        <div className="card overflow-hidden p-0">
          {loadingInvoices ? <div className="p-4"><SkeletonTable rows={8} cols={6} /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    {['Invoice #', 'Student', 'Due Date', 'Total', 'Outstanding', 'Status', ''].map(h => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                   {invoicesData?.data?.map(inv => {
                    const outstanding = Number(inv.totalAmount ?? 0) - Number(inv.paidAmount ?? 0);
                    const canPay = outstanding > 0 && ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status);
                    return (
                    <tr key={inv.id} className="hover:bg-bg/60 group">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-ink">{inv.student?.firstName} {inv.student?.lastName}</td>
                      <td className={`px-4 py-3 font-mono text-xs ${inv.isOverdue ? 'text-danger font-semibold' : 'text-muted'}`}>
                        {format(new Date(inv.dueDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink">{fmt(inv.totalAmount)}</td>
                      <td className={`px-4 py-3 font-mono font-semibold ${outstanding > 0 ? 'text-danger' : 'text-success'}`}>
                        {fmt(outstanding)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-chip text-xs ${STATUS_CHIP[inv.status] ?? STATUS_CHIP.SENT}`}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Download PDF"
                            onClick={async () => {
                              const { downloadInvoicePdf } = await import('../../lib/utils/pdfGenerator');
                              const fullInvoice = await financeApi.getInvoice(inv.id);
                              downloadInvoicePdf(fullInvoice);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors focusable"
                          >
                            <FileDown size={15} />
                          </button>
                          {canPay && (
                            <button
                              title="Send payment reminder to parent"
                              onClick={() => remindMut.mutate(inv.id)}
                              disabled={remindMut.isPending}
                              className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-warning/10 transition-colors focusable disabled:opacity-50"
                            >
                              <Bell size={15} />
                            </button>
                          )}
                          {canPay && (
                            <button
                              onClick={() => { setPaymentModal({ id: inv.id, invoiceNumber: inv.invoiceNumber, outstanding }); setPaymentForm({ amount: outstanding.toFixed(2), referenceNumber: '', notes: '' }); }}
                              title="Record Payment"
                              className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors focusable"
                            >
                              <CheckCircle size={15} />
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
          {invoicesData?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted">Page {page} of {invoicesData.pagination.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p-1)} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Prev</button>
                <button onClick={() => setPage(p => p+1)} disabled={page >= invoicesData.pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expenses */}
      {tab === 'expenses' && (
        <div className="card overflow-hidden p-0">
          {loadingExpenses ? <div className="p-4"><SkeletonTable rows={8} cols={5} /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    {['Category', 'Description', 'Date', 'Amount'].map(h => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expensesData?.data?.map(exp => (
                    <tr key={exp.id} className="hover:bg-bg/60">
                      <td className="px-4 py-3"><span className="badge-chip bg-info/10 text-info text-xs">{exp.category}</span></td>
                      <td className="px-4 py-3 text-ink">{exp.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{format(new Date(exp.expenseDate), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-danger">{fmt(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Fees Tab */}
      {/* Fee Structures Tab */}
      {tab === 'fee_structures' && (
        <div className="card overflow-hidden p-0">
          <div className="p-4 flex justify-end border-b border-border bg-bg">
            <button onClick={() => setIsFeeModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus size={14} /> Add Structure
            </button>
          </div>
          {loadingFees ? <div className="p-4"><SkeletonTable rows={4} cols={4} /></div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Classroom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feeStructures?.map(fee => (
                  <tr key={fee.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-medium text-ink">{fee.name}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{fmt(fee.amount)}</td>
                    <td className="px-4 py-3"><span className="badge-chip bg-secondary/10 text-secondary text-xs">{fee.frequency}</span></td>
                    <td className="px-4 py-3 text-muted">{fee.classroom?.name ?? 'All Classrooms'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {tab === 'ledger' && (
        <div className="space-y-4">
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-border bg-bg flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">General Ledger — Full Transaction History</p>
              <p className="text-xs text-muted">{ledgerData?.pagination?.total ?? 0} total entries</p>
            </div>
            {loadingLedger ? (
              <div className="p-4"><SkeletonTable rows={8} cols={5} /></div>
            ) : !ledgerData?.data?.length ? (
              <div className="text-center py-16 text-muted">
                <p className="text-sm font-medium">No ledger entries yet.</p>
                <p className="text-xs mt-1">Entries are created automatically when invoices are issued, payments received, or expenses logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-border bg-bg">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wide">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wide">Credit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wide">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledgerData.data.map(entry => (
                      <tr key={entry.id} className="hover:bg-bg/60 group">
                        <td className="px-4 py-3 text-xs font-mono text-muted">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink max-w-xs truncate">{entry.description}</td>
                        <td className="px-4 py-3">
                          <span className={`badge-chip text-xs font-bold ${
                            entry.type === 'CREDIT'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {entry.type === 'DEBIT'
                            ? <span className="font-semibold text-danger">{fmt(entry.amount)}</span>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {entry.type === 'CREDIT'
                            ? <span className="font-semibold text-success">{fmt(entry.amount)}</span>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                          <span className={Number(entry.runningBalance) >= 0 ? 'text-ink' : 'text-danger'}>
                            {fmt(Math.abs(entry.runningBalance))}
                            {Number(entry.runningBalance) < 0 && <span className="text-xs ml-1 font-normal text-danger">(deficit)</span>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {ledgerData?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Page {ledgerData.pagination.page} of {ledgerData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                  disabled={ledgerPage <= 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted hover:text-ink hover:bg-bg disabled:opacity-40 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setLedgerPage(p => p + 1)}
                  disabled={ledgerPage >= ledgerData.pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted hover:text-ink hover:bg-bg disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Add Fee Structure</h2>
              <button onClick={() => setIsFeeModalOpen(false)} className="p-1 text-muted hover:text-ink rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createFeeMut.mutate({ ...feeForm, amount: Number(feeForm.amount), classroomId: feeForm.classroomId || null }); }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={feeForm.name} onChange={e => setFeeForm({...feeForm, name: e.target.value})} placeholder="e.g. Primary Tuition" className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input required type="number" step="0.01" min="0" value={feeForm.amount} onChange={e => setFeeForm({...feeForm, amount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select required value={feeForm.frequency} onChange={e => setFeeForm({...feeForm, frequency: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm">
                  <option value="MONTHLY">Monthly</option>
                  <option value="TERMLY">Termly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="ONE_TIME">One Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Classroom (Optional)</label>
                <select value={feeForm.classroomId} onChange={e => setFeeForm({...feeForm, classroomId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm">
                  <option value="">All Classrooms</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFeeModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" disabled={createFeeMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Modal - Multi-line builder */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">Create Invoice</h2>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Student <span className="text-danger">*</span></label>
                  <select required value={invoiceStudentId} onChange={e => setInvoiceStudentId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select a student...</option>
                    {studentsList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Due Date <span className="text-danger">*</span></label>
                  <input required type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-ink">Line Items <span className="text-danger">*</span></label>
                  <button type="button" onClick={addLineItem} className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-1">
                    <p className="col-span-6 text-xs font-semibold text-muted uppercase">Description</p>
                    <p className="col-span-2 text-xs font-semibold text-muted uppercase text-center">Qty</p>
                    <p className="col-span-3 text-xs font-semibold text-muted uppercase text-right">Unit Price</p>
                    <p className="col-span-1"></p>
                  </div>
                  {lineItems.map((li, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        required type="text" placeholder="e.g. Monthly Tuition"
                        value={li.description} onChange={e => updateLineItem(idx, 'description', e.target.value)}
                        className="col-span-6 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                      <input
                        required type="number" min="1" placeholder="1"
                        value={li.quantity} onChange={e => updateLineItem(idx, 'quantity', e.target.value)}
                        className="col-span-2 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none text-center"
                      />
                      <input
                        required type="number" step="0.01" min="0" placeholder="0.00"
                        value={li.unitPrice} onChange={e => updateLineItem(idx, 'unitPrice', e.target.value)}
                        className="col-span-3 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none text-right"
                      />
                      <button type="button" onClick={() => removeLineItem(idx)} disabled={lineItems.length === 1} className="col-span-1 flex justify-center p-1.5 text-muted hover:text-danger disabled:opacity-30 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-border">
                  <p className="text-sm font-bold text-ink">Total: <span className="font-mono text-primary ml-2">{fmt(invoiceTotal)}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Notes (Optional)</label>
                <textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} rows={2} placeholder="Any additional notes for the parent..." className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
              <button
                onClick={() => { if (!invoiceStudentId || !invoiceDueDate) return; createInvoiceMut.mutate(); }}
                disabled={createInvoiceMut.isPending || !invoiceStudentId || !invoiceDueDate}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm"
              >
                {createInvoiceMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">Record Payment</h2>
              <button onClick={() => setPaymentModal(null)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-sm text-success font-medium">
                Invoice {paymentModal.invoiceNumber} &bull; Outstanding: {fmt(paymentModal.outstanding)}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Amount Paid <span className="text-danger">*</span></label>
                <input required type="number" step="0.01" min="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Reference # (Cheque/Transfer)</label>
                <input type="text" placeholder="e.g. CHQ-00456" value={paymentForm.referenceNumber} onChange={e => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Notes</label>
                <input type="text" placeholder="Optional note" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
              <button onClick={() => setPaymentModal(null)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
              <button
                onClick={() => recordPaymentMut.mutate({ invoiceId: paymentModal.id, amount: Number(paymentForm.amount), referenceNumber: paymentForm.referenceNumber || null, notes: paymentForm.notes || null, currency: 'USD' })}
                disabled={recordPaymentMut.isPending || !paymentForm.amount}
                className="flex items-center gap-2 px-6 py-2.5 bg-success text-white rounded-xl text-sm font-bold hover:bg-success/90 disabled:opacity-50 transition-all shadow-sm"
              >
                {recordPaymentMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">Log Expense</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createExpenseMut.mutate({ ...expenseForm, amount: Number(expenseForm.amount) }); }} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Category <span className="text-danger">*</span></label>
                  <select required value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    {['SALARY','UTILITIES','SUPPLIES','MAINTENANCE','MARKETING','RENT','INSURANCE','TRANSPORT','OTHER'].map(c => (
                      <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Description <span className="text-danger">*</span></label>
                  <input required type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g. Monthly electricity bill" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Amount <span className="text-danger">*</span></label>
                    <input required type="number" step="0.01" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Date <span className="text-danger">*</span></label>
                    <input required type="date" value={expenseForm.expenseDate} onChange={e => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
                <button type="submit" disabled={createExpenseMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-danger text-white rounded-xl text-sm font-bold hover:bg-danger/90 disabled:opacity-50 transition-all shadow-sm">
                  {createExpenseMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Receipt size={15} />}
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Invoice Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">Batch Billing</h2>
              <button onClick={() => setIsBatchModalOpen(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createBatchMut.mutate({ classroomId: batchForm.classroomId || null, feeStructureId: batchForm.feeStructureId, dueDate: batchForm.dueDate }); }} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-primary/90 font-medium">
                  This will automatically generate draft invoices for every enrolled student in the selected classroom based on the chosen fee structure.
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Classroom</label>
                  <select value={batchForm.classroomId} onChange={e => setBatchForm({ ...batchForm, classroomId: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">All Classrooms</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Fee Structure <span className="text-danger">*</span></label>
                  <select required value={batchForm.feeStructureId} onChange={e => setBatchForm({ ...batchForm, feeStructureId: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select fee structure...</option>
                    {(feeStructures ?? []).map(f => <option key={f.id} value={f.id}>{f.name} ({fmt(f.amount)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Due Date <span className="text-danger">*</span></label>
                  <input required type="date" value={batchForm.dueDate} onChange={e => setBatchForm({ ...batchForm, dueDate: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
                <button type="submit" disabled={createBatchMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm">
                  {createBatchMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
                  Generate Invoices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Payroll Tab */}
      {tab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select value={payrollMonth} onChange={e => setPayrollMonth(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border bg-bg text-sm outline-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>{format(new Date(2000, i, 1), 'MMMM')}</option>
              ))}
            </select>
            <select value={payrollYear} onChange={e => setPayrollYear(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border bg-bg text-sm outline-none">
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="ml-auto">
              <button onClick={() => setIsPayrollModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                <Plus size={16} /> Process Payroll
              </button>
            </div>
          </div>
          
          <div className="card overflow-hidden p-0">
            {loadingPayroll ? <div className="p-4"><SkeletonTable rows={5} cols={5} /></div> : !payrollData?.data?.length ? (
              <div className="text-center py-16 text-muted">
                <p className="text-sm font-medium">No payroll records for this month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Staff</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Base Salary</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Allowances</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Deductions</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Net Pay</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payrollData.data.map(pr => (
                      <tr key={pr.id} className="hover:bg-bg/60">
                        <td className="px-4 py-3 font-medium text-ink">{pr.staff?.user?.firstName} {pr.staff?.user?.lastName}</td>
                        <td className="px-4 py-3 font-mono">{fmt(pr.baseSalary)}</td>
                        <td className="px-4 py-3 font-mono text-success">+{fmt(pr.allowances)}</td>
                        <td className="px-4 py-3 font-mono text-danger">-{fmt(pr.deductions)}</td>
                        <td className="px-4 py-3 font-mono font-bold text-ink">{fmt(pr.netPay)}</td>
                        <td className="px-4 py-3"><span className="badge-chip bg-success/10 text-success text-xs">{pr.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">Process Payroll</h2>
              <button onClick={() => setIsPayrollModalOpen(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); processPayrollMut.mutate({ ...payrollForm, month: payrollMonth, year: payrollYear, baseSalary: Number(payrollForm.baseSalary), allowances: Number(payrollForm.allowances), deductions: Number(payrollForm.deductions) }); }} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Staff Member <span className="text-danger">*</span></label>
                  <select required value={payrollForm.staffId} onChange={e => {
                    const selectedStaff = staffList.find(s => s.id === e.target.value);
                    setPayrollForm({ 
                      ...payrollForm, 
                      staffId: e.target.value,
                      baseSalary: selectedStaff?.salary ? String(selectedStaff.salary) : ''
                    });
                  }} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select staff...</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Base Salary <span className="text-danger">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input required type="number" step="0.01" min="0" value={payrollForm.baseSalary} onChange={e => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })} className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Allowances</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
                      <input type="number" step="0.01" min="0" value={payrollForm.allowances} onChange={e => setPayrollForm({ ...payrollForm, allowances: e.target.value })} className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Deductions</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
                      <input type="number" step="0.01" min="0" value={payrollForm.deductions} onChange={e => setPayrollForm({ ...payrollForm, deductions: e.target.value })} className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-bg rounded-xl border border-border flex justify-between items-center">
                  <span className="text-sm font-medium text-muted">Net Pay</span>
                  <span className="font-mono font-bold text-ink">{fmt(Number(payrollForm.baseSalary || 0) + Number(payrollForm.allowances || 0) - Number(payrollForm.deductions || 0))}</span>
                </div>
              </div>
              <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
                <button type="submit" disabled={processPayrollMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm">
                  {processPayrollMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Confirm & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
