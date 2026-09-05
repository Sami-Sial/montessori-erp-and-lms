'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../../../lib/api/attendance';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { useToast } from '../../../../lib/hooks/useToast';
import { useSelector } from 'react-redux';
import { queueItem } from '../../../../store/syncSlice';
import { useDispatch } from 'react-redux';
import { offlineDb } from '../../../../lib/offline/db';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import { QrCode, ClipboardList, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_STYLES = {
  PRESENT:    { cls: 'bg-success text-white border-success',   label: 'Present' },
  ABSENT:     { cls: 'bg-danger text-white border-danger',     label: 'Absent' },
  LATE:       { cls: 'bg-warning text-white border-warning',   label: 'Late' },
  EXCUSED:    { cls: 'bg-info text-white border-info',         label: 'Excused' },
  NOT_MARKED: { cls: 'bg-bg text-muted border-border',         label: '—' },
};

export default function TeacherAttendancePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const isOnline = useSelector((s) => s.sync.isOnline);

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-xl font-bold text-ink">{t('attendance.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setMode('bulk')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focusable ${mode === 'bulk' ? 'bg-secondary text-white' : 'border border-border text-muted hover:text-ink'}`}>
            <ClipboardList size={15} /> {t('attendance.bulkMark')}
          </button>
          <button onClick={() => setMode('qr')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focusable ${mode === 'qr' ? 'bg-secondary text-white' : 'border border-border text-muted hover:text-ink'}`}>
            <QrCode size={15} /> {t('attendance.qrScan')}
          </button>
        </div>
      </div>

      {/* Classroom selector */}
      <div className="flex gap-3 flex-wrap">
        <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          aria-label="Select classroom">
          {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="px-3 py-2 rounded-lg bg-bg border border-border text-sm text-muted font-mono">
          {format(new Date(), 'EEE, MMM d')}
        </span>
        {!isOnline && (
          <span className="badge-chip bg-warning/10 text-warning">Offline — changes will sync</span>
        )}
      </div>

      {/* QR mode */}
      {mode === 'qr' && (
        <div className="card space-y-3 border-secondary/30">
          <p className="text-sm font-medium text-ink">Scan or type student QR code</p>
          <div className="flex gap-2">
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQrScan()}
              placeholder="QR-STU-001-…"
              autoFocus
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="QR code input"
            />
            <button onClick={handleQrScan}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-dark focusable">
              Check in
            </button>
          </div>
          <p className="text-xs text-muted">Press Enter to check in. Works with a QR scanner or manual entry.</p>
        </div>
      )}

      {/* Bulk mode — roster */}
      {mode === 'bulk' && classroomId && (
        <>
          {isLoading ? (
            <div className="card p-4"><SkeletonTable rows={8} cols={3} /></div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="px-4 py-3 bg-bg border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">
                  {roster?.summary?.total ?? 0} students
                </p>
                <div className="flex items-center gap-3 text-xs text-muted">
                  {roster?.summary && (
                    <>
                      <span className="text-success">{roster.summary.present} present</span>
                      <span className="text-danger">{roster.summary.absent} absent</span>
                      <span className="text-muted">{roster.summary.notMarked} not marked</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mark all quick buttons */}
              <div className="px-4 py-2 bg-bg/50 border-b border-border flex gap-2">
                <span className="text-xs text-muted self-center">Mark all:</span>
                {['PRESENT', 'ABSENT'].map((s) => (
                  <button key={s} onClick={() => {
                    const all = {};
                    roster?.roster?.forEach((r) => { all[r.student.id] = s; });
                    setLocalStatuses(all);
                  }}
                    className={`px-2 py-1 rounded text-xs font-medium focusable ${s === 'PRESENT' ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-danger/10 text-danger hover:bg-danger/20'}`}>
                    {s === 'PRESENT' ? '✓ All present' : '✗ All absent'}
                  </button>
                ))}
              </div>

              {/* Student rows */}
              <div className="divide-y divide-border">
                {roster?.roster?.map(({ student }) => {
                  const current = localStatuses[student.id] ?? null;
                  return (
                    <div key={student.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-sm shrink-0" aria-hidden="true">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      {/* Name */}
                      <span className="flex-1 font-medium text-ink text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                      {/* Status buttons — large touch targets for tablet */}
                      <div className="flex gap-1.5" role="group" aria-label={`Attendance for ${student.firstName} ${student.lastName}`}>
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(student.id, s)}
                            className={`w-9 h-9 md:w-auto md:px-3 md:h-9 rounded-lg border text-xs font-medium transition-all focusable ${
                              current === s
                                ? STATUS_STYLES[s].cls
                                : 'border-border text-muted bg-bg hover:border-current'
                            }`}
                            aria-pressed={current === s}
                            aria-label={s}
                            title={s}
                          >
                            <span className="hidden md:inline">{STATUS_STYLES[s].label}</span>
                            <span className="md:hidden">
                              {s === 'PRESENT' ? '✓' : s === 'ABSENT' ? '✗' : s === 'LATE' ? '⏰' : '~'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={handleBulkSave} disabled={saving || !Object.keys(localStatuses).length}
            className="w-full py-3 bg-secondary text-white rounded-xl font-semibold text-sm hover:bg-secondary-dark disabled:opacity-40 focusable flex items-center justify-center gap-2 transition-colors">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isOnline ? t('attendance.saved').replace('saved','Save attendance') : 'Save offline'}
          </button>
        </>
      )}
    </div>
  );
}
