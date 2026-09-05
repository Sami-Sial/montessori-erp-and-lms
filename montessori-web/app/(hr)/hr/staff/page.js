'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../../../../lib/api/hr';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const LEAVE_STATUS_CHIP = {
  PENDING:  'bg-warning/10 text-warning',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-danger/10 text-danger',
};

export default function StaffPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState('staff'); // staff | leave | payroll

  const { data: staffData, isLoading: loadingStaff } = useQuery({
    queryKey: ['hr', 'staff'],
    queryFn: () => hrApi.listStaff({ pageSize: 50 }),
  });

  const { data: leaveData, isLoading: loadingLeave } = useQuery({
    queryKey: ['hr', 'leave'],
    queryFn: () => hrApi.listLeave({ pageSize: 30 }),
    enabled: tab === 'leave',
  });

  const { data: payrollData, isLoading: loadingPayroll } = useQuery({
    queryKey: ['hr', 'payroll'],
    queryFn: () => hrApi.listPayroll({ pageSize: 30 }),
    enabled: tab === 'payroll',
  });

  const decideMut = useMutation({
    mutationFn: ({ id, status, rejectionReason }) => hrApi.decideLeave(id, { status, rejectionReason }),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['hr', 'leave'] });
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const tabs = [
    { key: 'staff',   label: 'Staff' },
    { key: 'leave',   label: 'Leave Requests' },
    { key: 'payroll', label: 'Payroll' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-ink">Staff & HR</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} role="tab" aria-selected={tab === t.key}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focusable -mb-px ${
              tab === t.key ? 'border-slate text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Staff list */}
      {tab === 'staff' && (
        <div className="card overflow-hidden p-0">
          {loadingStaff ? <div className="p-4"><SkeletonTable rows={6} cols={5} /></div> : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Name', 'Role', 'Branch', 'Type', 'Since', 'Salary'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffData?.data?.map(s => (
                  <tr key={s.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate/10 flex items-center justify-center text-slate text-xs font-semibold" aria-hidden="true">
                          {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                        </div>
                        <span className="font-medium text-ink">{s.user?.firstName} {s.user?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{s.jobTitle}</td>
                    <td className="px-4 py-3 text-muted">{s.branch?.name}</td>
                    <td className="px-4 py-3"><span className="badge-chip bg-info/10 text-info text-xs">{s.employmentType}</span></td>
                    <td className="px-4 py-3 text-muted text-xs">{format(new Date(s.startDate), 'MMM yyyy')}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink">{s.salary ? `$${Number(s.salary).toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Leave requests */}
      {tab === 'leave' && (
        <div className="space-y-3">
          {loadingLeave ? <SkeletonTable rows={5} cols={5} /> : leaveData?.data?.map(lr => (
            <div key={lr.id} className="card flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink text-sm">{lr.staff?.user?.firstName} {lr.staff?.user?.lastName}</p>
                  <span className="badge-chip bg-info/10 text-info text-xs">{lr.leaveType}</span>
                  <span className={`badge-chip text-xs ${LEAVE_STATUS_CHIP[lr.status]}`}>{lr.status}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {format(new Date(lr.startDate), 'MMM d')} – {format(new Date(lr.endDate), 'MMM d, yyyy')} · {lr.totalDays} days
                </p>
                {lr.reason && <p className="text-xs text-muted mt-0.5 italic">"{lr.reason}"</p>}
              </div>
              {lr.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => decideMut.mutate({ id: lr.id, status: 'APPROVED' })}
                    className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors focusable" aria-label="Approve">
                    <CheckCircle2 size={18} />
                  </button>
                  <button onClick={() => decideMut.mutate({ id: lr.id, status: 'REJECTED' })}
                    className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors focusable" aria-label="Reject">
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payroll */}
      {tab === 'payroll' && (
        <div className="card overflow-hidden p-0">
          {loadingPayroll ? <div className="p-4"><SkeletonTable rows={6} cols={6} /></div> : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Staff', 'Period', 'Base', 'Allowances', 'Deductions', 'Net Pay', 'Status'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrollData?.data?.map(p => (
                  <tr key={p.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-medium text-ink">{p.staff?.user?.firstName} {p.staff?.user?.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{p.year}-{String(p.month).padStart(2,'0')}</td>
                    <td className="px-4 py-3 font-mono text-xs">${Number(p.baseSalary).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-success">+${Number(p.allowances).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-danger">-${Number(p.deductions).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-ink">${Number(p.netPay).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-chip text-xs ${p.status==='PAID' ? 'bg-success/10 text-success' : p.status==='PROCESSED' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
