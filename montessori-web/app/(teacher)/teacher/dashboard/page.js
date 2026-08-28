'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { attendanceApi } from '../../../../lib/api/attendance';
import { observationsApi } from '../../../../lib/api/observations';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { aiApi } from '../../../../lib/api/ai';
import { SkeletonStatCard, SkeletonCard } from '../../../../components/shared/Skeleton';
import Link from 'next/link';
import { ClipboardCheck, Eye, BookOpen, Sparkles, Users, ArrowRight } from 'lucide-react';
import { useSyncManager } from '../../../../lib/hooks/useSyncManager';
import { format, formatDistanceToNow } from 'date-fns';

function QuickAction({ href, icon: Icon, label, color }) {
  return (
    <Link href={href}
      className={`card flex flex-col items-center gap-2 py-5 hover:shadow-md transition-all text-center group ${color}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-current/10 group-hover:scale-110 transition-transform">
        <Icon size={20} aria-hidden="true" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  useSyncManager();

  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  const { data: classrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list(),
  });

  const primaryClassroom = classrooms?.[0];

  const { data: todayRoster, isLoading: loadingRoster } = useQuery({
    queryKey: ['attendance', 'classroom', primaryClassroom?.id, today],
    queryFn: () => attendanceApi.getClassroom(primaryClassroom.id, { date: today }),
    enabled: !!primaryClassroom?.id,
  });

  const { data: recentObs, isLoading: loadingObs } = useQuery({
    queryKey: ['observations', 'recent'],
    queryFn: () => observationsApi.list({ pageSize: 5 }),
  });

  const { data: insights } = useQuery({
    queryKey: ['ai', 'insights', 'unread'],
    queryFn: () => aiApi.listInsights({ pageSize: 2, unreadOnly: true }),
  });

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting}, {user?.firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {format(now, 'EEEE, MMMM d')} · {primaryClassroom?.name ?? 'No classroom assigned'}
        </p>
      </div>

      {/* Quick actions — tablet-friendly large targets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/teacher/attendance" icon={ClipboardCheck} label={t('attendance.markAttendance')} color="text-secondary" />
        <QuickAction href="/teacher/observations" icon={Eye} label={t('observations.logObservation')} color="text-primary" />
        <QuickAction href="/teacher/curriculum" icon={BookOpen} label={t('curriculum.lessonPlans')} color="text-info" />
        <QuickAction href="/teacher/students" icon={Users} label={t('students.title')} color="text-accent" />
      </div>

      {/* Today's attendance summary */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <ClipboardCheck size={16} className="text-secondary" aria-hidden="true" />
            Today's Attendance
          </h2>
          <Link href="/teacher/attendance" className="text-xs text-secondary hover:underline focusable flex items-center gap-1">
            View full roster <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {loadingRoster ? <SkeletonStatCard /> : todayRoster ? (
          <>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Present',    value: todayRoster.summary.present,   color: 'text-success' },
                { label: 'Absent',     value: todayRoster.summary.absent,    color: 'text-danger' },
                { label: 'Late',       value: todayRoster.summary.late,      color: 'text-warning' },
                { label: 'Not marked', value: todayRoster.summary.notMarked, color: 'text-muted' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>

            {/* Attendance progress bar */}
            <div className="w-full h-2 bg-border rounded-full overflow-hidden flex gap-0.5" role="img"
              aria-label={`${todayRoster.summary.present} present, ${todayRoster.summary.absent} absent`}>
              {todayRoster.summary.total > 0 && (
                <>
                  <div className="bg-success h-full" style={{ width: `${(todayRoster.summary.present / todayRoster.summary.total) * 100}%` }} />
                  <div className="bg-danger h-full" style={{ width: `${(todayRoster.summary.absent / todayRoster.summary.total) * 100}%` }} />
                  <div className="bg-warning h-full" style={{ width: `${(todayRoster.summary.late / todayRoster.summary.total) * 100}%` }} />
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted text-sm">No classroom selected</p>
        )}
      </section>

      {/* Recent observations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Eye size={16} className="text-primary" aria-hidden="true" />
            Recent Observations
          </h2>
          <Link href="/teacher/observations" className="text-xs text-primary hover:underline focusable flex items-center gap-1">
            Log new <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {loadingObs ? <SkeletonCard /> : (
          <div className="space-y-2">
            {recentObs?.data?.length === 0 ? (
              <div className="card text-center py-6 text-muted text-sm">No observations yet today</div>
            ) : recentObs?.data?.map((obs) => (
              <div key={obs.id} className="card flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-semibold shrink-0" aria-hidden="true">
                  {obs.student?.firstName?.[0]}{obs.student?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {obs.student?.firstName} {obs.student?.lastName}
                  </p>
                  <p className="text-xs text-muted line-clamp-2">{obs.note}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-chip bg-secondary/10 text-secondary text-xs">{obs.curriculumArea?.name}</span>
                    <span className="text-xs text-muted">
                      {formatDistanceToNow(new Date(obs.observedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI insights for teacher */}
      {insights?.data?.length > 0 && (
        <section className="card border-primary/20 bg-primary/5">
          <h2 className="font-semibold text-sm text-primary flex items-center gap-2 mb-3">
            <Sparkles size={15} aria-hidden="true" /> AI Insight
          </h2>
          <p className="text-sm text-ink">{insights.data[0].summary}</p>
        </section>
      )}
    </div>
  );
}
