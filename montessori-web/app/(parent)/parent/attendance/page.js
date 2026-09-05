'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { attendanceApi } from '../../../../lib/api/attendance';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { format } from 'date-fns';

const STATUS_CHIP = {
  PRESENT:    'bg-success/10 text-success',
  ABSENT:     'bg-danger/10 text-danger',
  LATE:       'bg-warning/10 text-warning',
  EXCUSED:    'bg-info/10 text-info',
  HALF_DAY:   'bg-muted/10 text-muted',
};

export default function ParentAttendancePage() {
  const [selectedChildId, setSelectedChildId] = useState(null);

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'mine'],
    queryFn: () => studentsApi.list({ pageSize: 10 }),
  });

  const children = studentsData?.data ?? [];
  const childId = selectedChildId ?? children[0]?.id;
  const child = children.find(c => c.id === childId) ?? children[0];

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', 'student', child?.id],
    queryFn: () => attendanceApi.getStudent(child.id, {}),
    enabled: !!child?.id,
  });

  const summary = attendance?.summary?.[0];
  const records = attendance?.records?.filter((r) => r.checkType === 'CHECK_IN') ?? [];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-ink">
        {child?.firstName}'s Attendance
      </h1>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <button key={c.id} onClick={() => setSelectedChildId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focusable ${c.id === childId ? 'bg-accent text-white' : 'bg-bg border border-border text-muted hover:text-ink'}`}>
              {c.firstName}
            </button>
          ))}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Present days',   value: summary.presentDays,   color: 'text-success' },
            { label: 'Absent days',    value: summary.absentDays,    color: 'text-danger' },
            { label: 'Late arrivals',  value: summary.lateDays,      color: 'text-warning' },
            { label: 'Attendance rate',value: `${summary.attendanceRate?.toFixed(1)}%`, color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <p className="text-xs text-muted">{label}</p>
              <p className={`font-display text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 bg-bg border-b border-border">
          <p className="font-semibold text-sm text-ink">Recent records</p>
        </div>
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={3} /></div>
        ) : records.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No attendance records yet</p>
        ) : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border">
                {['Date', 'Arrived', 'Left', 'Status'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.slice(0, 30).map((r) => (
                <tr key={r.id} className="hover:bg-bg/50">
                  <td className="px-4 py-2.5 font-medium text-ink">{format(new Date(r.date), 'EEE, MMM d')}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">
                    {r.checkInAt ? format(new Date(r.checkInAt), 'h:mm a') : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">
                    {r.checkOutAt ? format(new Date(r.checkOutAt), 'h:mm a') : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`badge-chip ${STATUS_CHIP[r.status] ?? 'bg-border text-muted'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
