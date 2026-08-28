'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../../lib/api/students';
import { attendanceApi } from '../../../../lib/api/attendance';
import { aiApi } from '../../../../lib/api/ai';
import { communicationApi } from '../../../../lib/api/communication';
import { SkeletonCard, SkeletonStatCard } from '../../../../components/shared/Skeleton';
import Link from 'next/link';
import { BookOpen, ClipboardCheck, MessageSquare, Sparkles, ChevronRight, Heart } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const MASTERY_COLORS = {
  NOT_INTRODUCED: 'bg-border',
  INTRODUCED:     'bg-info',
  PRACTICING:     'bg-warning',
  MASTERED:       'bg-success',
  EXTENDING:      'bg-accent',
};

function MasteryDot({ level }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${MASTERY_COLORS[level] ?? 'bg-border'}`} aria-label={level.replace(/_/g,' ')} />;
}

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);

  // Load guardian's children
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', 'mine'],
    queryFn: () => studentsApi.list({ pageSize: 10 }),
  });

  const children = studentsData?.data ?? [];
  const firstChild = children[0];

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['students', firstChild?.id, 'progress'],
    queryFn: () => studentsApi.getProgress(firstChild.id),
    enabled: !!firstChild?.id,
  });

  const { data: attendance } = useQuery({
    queryKey: ['attendance', 'student', firstChild?.id],
    queryFn: () => attendanceApi.getStudent(firstChild.id, {}),
    enabled: !!firstChild?.id,
  });

  const { data: dayReviews } = useQuery({
    queryKey: ['ai', 'insights', 'day-review'],
    queryFn: () => aiApi.listInsights({ type: 'DAY_REVIEW', pageSize: 3 }),
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => communicationApi.getMessages({ folder: 'inbox', pageSize: 3 }),
  });

  const unreadMessages = messages?.data?.filter((m) => m.status !== 'READ')?.length ?? 0;
  const latestSummary = attendance?.summary?.[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Hi, {user?.firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Children selector (if multiple) */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((child) => (
            <Link key={child.id} href={`/parent/progress?childId=${child.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border hover:border-accent transition-colors focusable shrink-0">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold" aria-hidden="true">
                {child.firstName[0]}
              </div>
              <span className="text-sm font-medium text-ink">{child.firstName}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Child summary card */}
      {loadingStudents ? <SkeletonCard /> : firstChild && (
        <div className="card flex items-center gap-4">
          {firstChild.photoUrl
            ? <img src={firstChild.photoUrl} alt={firstChild.firstName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            : <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-display font-bold text-xl shrink-0" aria-hidden="true">
                {firstChild.firstName[0]}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-lg text-ink">{firstChild.firstName} {firstChild.lastName}</p>
            <p className="text-sm text-muted">{firstChild.enrollments?.[0]?.classroom?.name ?? 'No classroom'}</p>
          </div>
          <Link href={`/parent/progress`} className="text-accent hover:text-amber-600 focusable" aria-label="View progress">
            <ChevronRight size={22} />
          </Link>
        </div>
      )}

      {/* Attendance this month */}
      {latestSummary && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
              <ClipboardCheck size={15} className="text-secondary" aria-hidden="true" />
              Attendance this month
            </h2>
            <Link href="/parent/attendance" className="text-xs text-secondary hover:underline focusable">See all</Link>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Present', value: latestSummary.presentDays,  color: 'text-success' },
              { label: 'Absent',  value: latestSummary.absentDays,   color: 'text-danger' },
              { label: 'Late',    value: latestSummary.lateDays,      color: 'text-warning' },
              { label: 'Rate',    value: `${latestSummary.attendanceRate?.toFixed(0)}%`, color: 'text-primary' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress snapshot */}
      {loadingProgress ? <SkeletonCard /> : progress?.progress?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
              <BookOpen size={15} className="text-primary" aria-hidden="true" />
              Learning progress
            </h2>
            <Link href="/parent/progress" className="text-xs text-primary hover:underline focusable">Full view</Link>
          </div>
          <div className="space-y-2">
            {Object.entries(
              progress.progress.reduce((acc, p) => {
                const area = p.curriculumArea?.name ?? 'Other';
                if (!acc[area]) acc[area] = { mastered: 0, total: 0 };
                acc[area].total++;
                if (['MASTERED','EXTENDING'].includes(p.masteryLevel)) acc[area].mastered++;
                return acc;
              }, {})
            ).map(([area, stats]) => (
              <div key={area}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink">{area}</span>
                  <span className="text-muted text-xs">{stats.mastered}/{stats.total} mastered</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden" role="progressbar"
                  aria-valuenow={Math.round((stats.mastered/stats.total)*100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(stats.mastered / stats.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day in review (AI digests) */}
      {dayReviews?.data?.length > 0 && (
        <div className="card border-accent/30 bg-accent/5">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-accent" aria-hidden="true" />
            Day in Review
          </h2>
          <p className="text-sm text-ink leading-relaxed">{dayReviews.data[0].summary}</p>
          <p className="text-xs text-muted mt-2">
            {formatDistanceToNow(new Date(dayReviews.data[0].generatedAt), { addSuffix: true })}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <MessageSquare size={15} className="text-muted" aria-hidden="true" />
            Messages
            {unreadMessages > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </h2>
          <Link href="/parent/messages" className="text-xs text-primary hover:underline focusable">View all</Link>
        </div>
        {messages?.data?.length === 0
          ? <p className="text-muted text-sm text-center py-4">No messages yet</p>
          : messages?.data?.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 py-2 border-b border-border last:border-0 ${msg.status !== 'READ' ? 'opacity-100' : 'opacity-70'}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0" aria-hidden="true">
                  {msg.sender?.firstName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{msg.sender?.firstName} {msg.sender?.lastName}</p>
                  <p className="text-xs text-muted line-clamp-1">{msg.subject ?? msg.body}</p>
                </div>
                <p className="text-xs text-muted shrink-0">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}
