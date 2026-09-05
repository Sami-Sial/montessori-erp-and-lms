'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../../../lib/api/attendance';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { useToast } from '../../../../lib/hooks/useToast';
import { useSelector, useDispatch } from 'react-redux';
import { queueItem } from '../../../../store/syncSlice';
import { offlineDb } from '../../../../lib/offline/db';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import { QrCode, ClipboardList, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, HelpCircle, History, Calendar as CalendarIcon, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_STYLES = {
  PRESENT:    { cls: 'bg-success/15 text-success border-success/30 hover:bg-success hover:text-white', activeCls: 'bg-success text-white border-success shadow-md shadow-success/20', label: 'Present', icon: CheckCircle2 },
  ABSENT:     { cls: 'bg-danger/15 text-danger border-danger/30 hover:bg-danger hover:text-white', activeCls: 'bg-danger text-white border-danger shadow-md shadow-danger/20', label: 'Absent', icon: XCircle },
  LATE:       { cls: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning hover:text-white', activeCls: 'bg-warning text-white border-warning shadow-md shadow-warning/20', label: 'Late', icon: AlertCircle },
  EXCUSED:    { cls: 'bg-info/15 text-info border-info/30 hover:bg-info hover:text-white', activeCls: 'bg-info text-white border-info shadow-md shadow-info/20', label: 'Excused', icon: HelpCircle },
  NOT_MARKED: { cls: 'bg-bg text-muted border-border', activeCls: 'bg-bg text-muted border-border', label: '—', icon: null },
};

function AttendanceHistory({ classroomId }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return format(d, 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['attendance', 'history', classroomId, startDate, endDate],
    queryFn: () => attendanceApi.getHistory({ classroomId, startDate, endDate, take: 100 }),
    enabled: !!classroomId,
  });

  const records = historyData?.data || (Array.isArray(historyData) ? historyData : []);

  return (
    <div className="card space-y-4 border-t-4 border-t-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-ink flex items-center gap-2"><History size={18} className="text-primary" /> Attendance History</h2>
          <p className="text-xs text-muted">View past records for this classroom.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">From</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">To</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : records.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <CalendarIcon size={40} className="text-border mb-3" />
          <p className="text-ink font-medium">No history found</p>
          <p className="text-xs text-muted mt-1">Try adjusting the date range to find past attendance records.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider rounded-tl-lg">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider rounded-tr-lg">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => {
                const StyleInfo = STATUS_STYLES[record.status] || STATUS_STYLES.NOT_MARKED;
                const Icon = StyleInfo.icon;
                return (
                  <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-ink whitespace-nowrap">
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink font-semibold">
                      {record.student?.firstName} {record.student?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${StyleInfo.cls.split(' hover:')[0]}`}>
                        {Icon && <Icon size={12} />}
                        {StyleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {record.markedBy?.firstName || 'Unknown'} {record.markedBy?.lastName || ''}
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

export default function TeacherAttendancePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const isOnline = useSelector((s) => s.sync.isOnline);

  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  const [mode, setMode] = useState('bulk'); // 'bulk' | 'qr'
  const [classroomId, setClassroomId] = useState('');
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [localStatuses, setLocalStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [qrInput, setQrInput] = useState('');

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });

  // Auto-select first classroom
  useEffect(() => {
    if (classrooms?.length && !classroomId) setClassroomId(classrooms[0].id);
  }, [classrooms]);

  const { data: roster, isLoading } = useQuery({
    queryKey: ['attendance', 'classroom', classroomId, date],
    queryFn: () => attendanceApi.getClassroom(classroomId, { date }),
    enabled: !!classroomId,
    onSuccess: (data) => {
      // Pre-fill from server state
      const init = {};
      data.roster?.forEach((r) => { if (r.status !== 'NOT_MARKED') init[r.student.id] = r.status; });
      setLocalStatuses(init);
    },
  });

  const setStatus = (studentId, status) =>
    setLocalStatuses((s) => ({ ...s, [studentId]: s[studentId] === status ? undefined : status }));

  const handleBulkSave = async () => {
    const records = Object.entries(localStatuses)
      .filter(([, v]) => v)
      .map(([studentId, status]) => ({ studentId, status }));

    if (!records.length) { toast.warning('Nothing to save', 'Mark at least one student'); return; }

    setSaving(true);
    try {
      if (isOnline) {
        await attendanceApi.bulkMark({ classroomId, date: new Date(date), checkType: 'CHECK_IN', method: 'MANUAL', records });
        toast.success(t('attendance.saved'), `${records.length} students marked`);
        qc.invalidateQueries({ queryKey: ['attendance', 'classroom', classroomId] });
      } else {
        // Queue offline — save to IndexedDB
        for (const r of records) {
          const item = {
            deviceId: 'web-teacher',
            entity: 'AttendanceRecord',
            operation: 'CREATE',
            payload: { studentId: r.studentId, classroomId, date, checkType: 'CHECK_IN', method: 'MANUAL', status: r.status },
            clientVersion: 1,
            clientTs: new Date().toISOString(),
            status: 'pending',
          };
          await offlineDb.syncQueue.add(item);
          dispatch(queueItem());
        }
        toast.info('Saved offline', `${records.length} records queued for sync`);
      }
    } catch (err) {
      toast.error('Save failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQrScan = async () => {
    if (!qrInput.trim() || !classroomId) return;
    try {
      await attendanceApi.qrScan({ qrCode: qrInput.trim(), classroomId, checkType: 'CHECK_IN' });
      toast.success(t('attendance.saved'), `QR: ${qrInput}`);
      setQrInput('');
      qc.invalidateQueries({ queryKey: ['attendance', 'classroom', classroomId] });
    } catch (err) {
      toast.error('Scan failed', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Tabs */}
      <div className="flex border-b border-border pb-0 gap-6">
        <button
          onClick={() => setActiveTab('mark')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'mark' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          Previous History
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink tracking-tight">{activeTab === 'history' ? 'Attendance History' : t('attendance.title')}</h1>
          <p className="text-sm text-muted mt-1">{activeTab === 'history' ? 'Review past records.' : 'Track daily check-ins for your classrooms.'}</p>
        </div>
        
        {/* Classroom selector shared globally */}
        <div className="flex gap-3 flex-wrap items-center">
          <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-surface font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            aria-label="Select classroom">
            {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {activeTab === 'mark' && (
            <span className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-bold flex items-center gap-2 shadow-sm">
              <CalendarIcon size={16} /> {format(new Date(), 'EEE, MMM d')}
            </span>
          )}
          {!isOnline && (
            <span className="badge-chip bg-warning/10 text-warning">Offline</span>
          )}
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="animate-in fade-in slide-in-from-right-2 duration-200">
          <AttendanceHistory classroomId={classroomId} />
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-200">
          
          <div className="flex gap-2">
            <button onClick={() => setMode('bulk')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm focusable ${mode === 'bulk' ? 'bg-primary text-white shadow-primary/20' : 'bg-surface border border-border text-muted hover:text-ink hover:bg-bg'}`}>
              <ClipboardList size={18} /> Roster List
            </button>
            <button onClick={() => setMode('qr')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm focusable ${mode === 'qr' ? 'bg-primary text-white shadow-primary/20' : 'bg-surface border border-border text-muted hover:text-ink hover:bg-bg'}`}>
              <QrCode size={18} /> QR Scanner
            </button>
          </div>

          {/* QR mode */}
          {mode === 'qr' && (
            <div className="card space-y-4 border-primary/30 shadow-md">
              <p className="text-sm font-semibold text-ink">Scan or type student QR code</p>
              <div className="flex gap-2">
                <input
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQrScan()}
                  placeholder="QR-STU-001-…"
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                  aria-label="QR code input"
                />
                <button onClick={handleQrScan}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark focusable shadow-sm transition-colors">
                  Check in
                </button>
              </div>
              <p className="text-xs text-muted flex items-center gap-1.5"><Clock size={12} /> Press Enter to check in instantly.</p>
            </div>
          )}

          {/* Bulk mode — roster */}
          {mode === 'bulk' && classroomId && (
            <>
              {isLoading ? (
                <div className="card p-4"><SkeletonTable rows={8} cols={3} /></div>
              ) : (
                <div className="card overflow-hidden p-0 shadow-sm border-border">
                  <div className="px-5 py-4 bg-gradient-to-r from-bg to-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink">
                      {roster?.summary?.total ?? 0} Students Today
                    </p>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      {roster?.summary && (
                        <>
                          <span className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded"><CheckCircle2 size={14}/> {roster.summary.present} Present</span>
                          <span className="flex items-center gap-1 text-danger bg-danger/10 px-2 py-1 rounded"><XCircle size={14}/> {roster.summary.absent} Absent</span>
                          <span className="text-muted bg-border/40 px-2 py-1 rounded">{roster.summary.notMarked} pending</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mark all quick buttons */}
                  <div className="px-5 py-3 bg-surface border-b border-border flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Quick Actions:</span>
                    <button onClick={() => {
                        const all = {};
                        roster?.roster?.forEach((r) => { all[r.student.id] = 'PRESENT'; });
                        setLocalStatuses(all);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focusable bg-success/10 text-success hover:bg-success/20 border border-success/20">
                      <UserCheck size={14} /> Mark All Present
                    </button>
                    <button onClick={() => {
                        const all = {};
                        roster?.roster?.forEach((r) => { all[r.student.id] = 'ABSENT'; });
                        setLocalStatuses(all);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focusable bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20">
                      <UserCheck size={14} /> Mark All Absent
                    </button>
                  </div>

                  {/* Student rows */}
                  <div className="divide-y divide-border">
                    {roster?.roster?.map(({ student }) => {
                      const current = localStatuses[student.id] ?? null;
                      return (
                        <div key={student.id} className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 hover:bg-surface/30 transition-colors">
                          {/* Avatar & Name */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20" aria-hidden="true">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <span className="block font-bold text-ink text-sm">
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="text-xs text-muted font-medium">ID: {student.id.slice(0,8)}</span>
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div className="flex gap-2 w-full md:w-auto" role="group" aria-label={`Attendance for ${student.firstName} ${student.lastName}`}>
                            {STATUSES.map((s) => {
                              const StyleInfo = STATUS_STYLES[s];
                              const Icon = StyleInfo.icon;
                              const isActive = current === s;
                              
                              return (
                                <button
                                  key={s}
                                  onClick={() => setStatus(student.id, s)}
                                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all focusable ${
                                    isActive
                                      ? StyleInfo.activeCls
                                      : "border-border text-muted bg-surface " + StyleInfo.cls
                                  }`}
                                  aria-pressed={isActive}
                                  aria-label={s}
                                >
                                  {Icon && <Icon size={14} />}
                                  <span className="hidden md:inline">{StyleInfo.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button onClick={handleBulkSave} disabled={saving || !Object.keys(localStatuses).length}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-50 focusable flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 mt-6">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {isOnline ? t('attendance.saved').replace('saved','Save Attendance Records') : 'Save Records Offline'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
