'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../../../lib/api/attendance';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { SkeletonTable, SkeletonStatCard } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const STATUS_CHIP = {
  PRESENT:    'bg-success/10 text-success',
  ABSENT:     'bg-danger/10 text-danger',
  LATE:       'bg-warning/10 text-warning',
  EXCUSED:    'bg-info/10 text-info',
  HALF_DAY:   'bg-muted/10 text-muted',
  NOT_MARKED: 'bg-border text-muted',
};

export default function AdminAttendancePage() {
  const { t } = useTranslation();
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [analyticsMonth] = useState(new Date().getMonth() + 1);
  const [analyticsYear] = useState(new Date().getFullYear());

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });

  const { data: roster, isLoading: loadingRoster } = useQuery({
    queryKey: ['attendance', 'classroom', selectedClassroom, selectedDate],
    queryFn: () => attendanceApi.getClassroom(selectedClassroom, { date: selectedDate }),
    enabled: !!selectedClassroom,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['attendance', 'analytics', analyticsYear, analyticsMonth],
    queryFn: () => attendanceApi.getAnalytics({ month: analyticsMonth, year: analyticsYear, classroomId: selectedClassroom || undefined }),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold text-ink">{t('attendance.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Select classroom"
        >
          <option value="">All classrooms</option>
          {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Select date" />
      </div>

      {/* Analytics KPIs */}
      {loadingAnalytics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Present', value: analytics.overall.presentCount, color: 'text-success' },
            { label: 'Absent',  value: analytics.overall.absentCount,  color: 'text-danger' },
            { label: 'Late',    value: analytics.overall.lateCount,     color: 'text-warning' },
            { label: 'Chronic absence flags', value: analytics.chronicallyAbsent.length, color: 'text-danger' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
              <p className={`font-display text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Roster */}
      {selectedClassroom && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-border bg-bg flex items-center justify-between">
            <p className="font-semibold text-sm text-ink">
              Roster — {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
            {roster?.summary && (
              <p className="text-xs text-muted">
                {roster.summary.present}/{roster.summary.total} present
              </p>
            )}
          </div>
          {loadingRoster ? (
            <div className="p-4"><SkeletonTable rows={6} cols={4} /></div>
          ) : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  {['Student', 'Check-in', 'Check-out', 'Status'].map(h => (
                    <th key={h} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roster?.roster?.map(({ student, checkIn, checkOut, status }) => (
                  <tr key={student.id} className="hover:bg-bg/60">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" aria-hidden="true">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <span className="font-medium text-ink">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">
                      {checkIn?.checkInAt ? format(new Date(checkIn.checkInAt), 'h:mm a') : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">
                      {checkOut?.checkOutAt ? format(new Date(checkOut.checkOutAt), 'h:mm a') : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`badge-chip ${STATUS_CHIP[status] ?? STATUS_CHIP.NOT_MARKED}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Chronic absence table */}
      {analytics?.chronicallyAbsent?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
            ⚠️ Chronically absent students (&lt;80% attendance)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  {['Student', 'Present', 'Absent', 'Rate'].map(h => (
                    <th key={h} scope="col" className="px-3 py-2 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.chronicallyAbsent.map((s) => (
                  <tr key={s.student.id} className="hover:bg-bg/60">
                    <td className="px-3 py-2 font-medium text-ink">{s.student.firstName} {s.student.lastName}</td>
                    <td className="px-3 py-2 text-success">{s.present}</td>
                    <td className="px-3 py-2 text-danger">{s.absent}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-danger">
                      {Math.round((s.present / s.total) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
