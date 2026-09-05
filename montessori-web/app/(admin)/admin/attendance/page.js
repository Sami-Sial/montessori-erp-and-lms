'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { attendanceApi } from '../../../../lib/api/attendance';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { SkeletonTable, SkeletonStatCard } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const STATUS_CHIP = {
  PRESENT:    'bg-success/10 text-success border-success/20',
  ABSENT:     'bg-danger/10 text-danger border-danger/20',
  LATE:       'bg-warning/10 text-warning border-warning/20',
  EXCUSED:    'bg-info/10 text-info border-info/20',
  HALF_DAY:   'bg-muted/10 text-muted border-border',
  NOT_MARKED: 'bg-bg text-muted border-border',
};

export default function AdminAttendancePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  
  // Today filters
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const selectedDate = format(new Date(), 'yyyy-MM-dd');
  
  // History filters
  const [historyClassroom, setHistoryClassroom] = useState('');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(0);
  const historyTake = 20;
  

  const globalAcademicYearId = useSelector((s) => s.ui.selectedAcademicYearId);

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });

  const { data: roster, isLoading: loadingRoster } = useQuery({
    queryKey: ['attendance', 'daily', selectedClassroom, selectedDate, globalAcademicYearId],
    queryFn: () => attendanceApi.getDaily({ classroomId: selectedClassroom || undefined, date: selectedDate, academicYearId: globalAcademicYearId }),
    enabled: activeTab === 'today',
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendance', 'history', historyClassroom, historyStartDate, historyEndDate, historyPage],
    queryFn: () => attendanceApi.getHistory({ 
      classroomId: historyClassroom || undefined, 
      startDate: historyStartDate || undefined,
      endDate: historyEndDate || undefined,
      skip: historyPage * historyTake,
      take: historyTake
    }),
    enabled: activeTab === 'history',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">{t('attendance.title')}</h1>
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('today')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'today' ? 'bg-bg text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            Today's Roster
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'history' ? 'bg-bg text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            Full History
          </button>
        </div>
      </div>

      {activeTab === 'today' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-xl border border-border">
            <Filter size={16} className="text-muted ml-1" />
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
            >
              <option value="">All classrooms (Overview)</option>
              {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Analytics KPIs */}
          {/* Analytics KPIs */}
          {loadingRoster ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
            </div>
          ) : roster?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Present', value: roster.summary.present, color: 'text-success' },
                { label: 'Absent',  value: roster.summary.absent,  color: 'text-danger' },
                { label: 'Late',    value: roster.summary.late,     color: 'text-warning' },
                { label: 'Not Marked', value: roster.summary.notMarked, color: 'text-muted' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card py-4 border-l-4 border-l-transparent hover:border-l-primary transition-all">
                  <p className="text-xs text-muted uppercase tracking-wide font-medium">{label}</p>
                  <p className={`font-display text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Roster */}
          <div className="card overflow-hidden p-0 shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
              <p className="font-bold text-sm text-ink">
                Roster — {format(new Date(selectedDate), 'MMMM d, yyyy')} {selectedClassroom ? '' : '(All Classrooms)'}
              </p>
              {roster?.summary && (
                <p className="text-xs font-semibold bg-bg px-2 py-1 rounded-md text-muted">
                  {roster.summary.present}/{roster.summary.total} present
                </p>
              )}
            </div>
            {loadingRoster ? (
              <div className="p-4"><SkeletonTable rows={6} cols={4} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg/50 border-b border-border">
                      {['Student', 'Check-in', 'Check-out', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {roster?.roster?.map(({ student, checkIn, checkOut, status }) => (
                      <tr key={student.id} className="hover:bg-bg/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span className="font-semibold text-ink">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">
                          {checkIn?.checkInAt ? format(new Date(checkIn.checkInAt), 'h:mm a') : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">
                          {checkOut?.checkOutAt ? format(new Date(checkOut.checkOutAt), 'h:mm a') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_CHIP[status] ?? STATUS_CHIP.NOT_MARKED}`}>
                            {status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {roster?.roster?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted">No students found for this date.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="card flex flex-wrap items-end gap-4 bg-surface shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Classroom</label>
              <select
                value={historyClassroom}
                onChange={(e) => { setHistoryClassroom(e.target.value); setHistoryPage(0); }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Classrooms</option>
                {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Start Date</label>
              <input type="date" value={historyStartDate} onChange={(e) => { setHistoryStartDate(e.target.value); setHistoryPage(0); }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">End Date</label>
              <input type="date" value={historyEndDate} onChange={(e) => { setHistoryEndDate(e.target.value); setHistoryPage(0); }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {(historyClassroom || historyStartDate || historyEndDate) && (
              <button 
                onClick={() => { setHistoryClassroom(''); setHistoryStartDate(''); setHistoryEndDate(''); setHistoryPage(0); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors border border-transparent hover:border-border"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="card overflow-hidden p-0 shadow-sm">
            {loadingHistory ? (
              <div className="p-4"><SkeletonTable rows={10} cols={5} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg/50 border-b border-border">
                      {['Date', 'Student', 'Classroom', 'Status', 'Notes'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history?.records?.map((record) => (
                      <tr key={record.id} className="hover:bg-bg/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink">{record.student.firstName} {record.student.lastName}</span>
                            <span className="text-xs text-muted font-mono">({record.student.studentNumber})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {record.classroom.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${STATUS_CHIP[record.status] ?? STATUS_CHIP.NOT_MARKED}`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate">
                          {record.notes || '—'}
                        </td>
                      </tr>
                    ))}
                    {history?.records?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted">No attendance history found for the selected filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {history?.total > historyTake && (
              <div className="p-3 border-t border-border bg-surface flex items-center justify-between">
                <p className="text-xs text-muted font-medium">
                  Showing {history.skip + 1} to {Math.min(history.skip + historyTake, history.total)} of {history.total} records
                </p>
                <div className="flex gap-1">
                  <button 
                    disabled={historyPage === 0} 
                    onClick={() => setHistoryPage(p => p - 1)}
                    className="p-1.5 rounded-md hover:bg-bg disabled:opacity-30 transition-colors text-ink"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={history.skip + historyTake >= history.total} 
                    onClick={() => setHistoryPage(p => p + 1)}
                    className="p-1.5 rounded-md hover:bg-bg disabled:opacity-30 transition-colors text-ink"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
