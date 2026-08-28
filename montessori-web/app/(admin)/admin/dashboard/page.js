'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, DollarSign, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import { studentsApi } from '../../../../lib/api/students';
import { aiApi } from '../../../../lib/api/ai';
import { attendanceApi } from '../../../../lib/api/attendance';
import { SkeletonStatCard, SkeletonCard } from '../../../../components/shared/Skeleton';
import Link from 'next/link';
import { useSyncManager } from '../../../../lib/hooks/useSyncManager';

function StatCard({ label, value, sub, icon: Icon, color, href }) {
  const inner = (
    <div className={`stat-card group hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-ink mt-1">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function InsightCard({ insight }) {
  const typeColors = {
    ATTENDANCE_PATTERN: 'bg-warning/10 border-warning/30 text-warning',
    FEE_DELINQUENCY:    'bg-danger/10  border-danger/30  text-danger',
    CURRICULUM_GAP:     'bg-info/10    border-info/30    text-info',
    DAY_REVIEW:         'bg-success/10 border-success/30 text-success',
    ENGAGEMENT_TREND:   'bg-secondary/10 border-secondary/30 text-secondary',
  };
  const cls = typeColors[insight.type] ?? typeColors.DAY_REVIEW;

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${cls}`}>
      <p className="font-semibold text-sm">{insight.title}</p>
      <p className="text-sm opacity-90 leading-relaxed">{insight.summary}</p>
      {insight.actionItems?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {insight.actionItems.map((a, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0">→</span>{a}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  useSyncManager();

  const now = new Date();

  const { data: finance, isLoading: loadingFinance } = useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: financeApi.getSummary,
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', 'count'],
    queryFn: () => studentsApi.list({ pageSize: 1 }),
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', 'analytics', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => attendanceApi.getAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }),
  });

  const { data: insightsData, isLoading: loadingInsights } = useQuery({
    queryKey: ['ai', 'insights', 'unread'],
    queryFn: () => aiApi.listInsights({ pageSize: 4, unreadOnly: true }),
  });

  const totalStudents = studentsData?.pagination?.total ?? '—';
  const presentRate   = attendance?.overall
    ? Math.round((attendance.overall.presentCount / Math.max(attendance.overall.totalRecords, 1)) * 100)
    : null;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.firstName}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStudents ? <SkeletonStatCard /> : (
          <StatCard label="Total students" value={totalStudents} icon={GraduationCap}
            color="bg-primary/10 text-primary" href="/admin/students" />
        )}
        {loadingAttendance ? <SkeletonStatCard /> : (
          <StatCard label="Attendance rate" value={presentRate !== null ? `${presentRate}%` : '—'}
            sub="This month" icon={TrendingUp} color="bg-secondary/10 text-secondary" href="/admin/attendance" />
        )}
        {loadingFinance ? <SkeletonStatCard /> : (
          <StatCard label="Outstanding fees" value={finance ? `$${Number(finance.totalOutstanding).toLocaleString()}` : '—'}
            sub={`${finance?.overdueCount ?? 0} overdue`} icon={DollarSign}
            color="bg-warning/10 text-warning" href="/admin/finance" />
        )}
        {loadingFinance ? <SkeletonStatCard /> : (
          <StatCard label="Collected this month" value={finance ? `$${Number(finance.collectedThisMonth).toLocaleString()}` : '—'}
            icon={TrendingUp} color="bg-success/10 text-success" href="/admin/finance" />
        )}
      </div>

      {/* AI insights */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
            <Sparkles size={18} className="text-primary" aria-hidden="true" />
            {t('ai.insightFeed')}
          </h2>
          <Link href="/admin/ai-insights" className="text-xs text-primary hover:underline focusable">
            {t('common.viewAll')}
          </Link>
        </div>
        {loadingInsights ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[0,1].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : insightsData?.data?.length === 0 ? (
          <div className="card text-center py-8 text-muted text-sm">{t('ai.noInsights')}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {insightsData?.data?.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
          </div>
        )}
      </section>

      {/* Chronic absence alert */}
      {attendance?.chronicallyAbsent?.length > 0 && (
        <section className="card border-warning/40 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-warning" aria-hidden="true" />
            <h2 className="font-semibold text-sm text-ink">
              {attendance.chronicallyAbsent.length} student{attendance.chronicallyAbsent.length !== 1 ? 's' : ''} with chronic absence
            </h2>
          </div>
          <div className="space-y-1">
            {attendance.chronicallyAbsent.slice(0, 5).map((s) => (
              <div key={s.student.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{s.student.firstName} {s.student.lastName}</span>
                <span className="text-warning font-medium font-mono">
                  {Math.round((s.present / s.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
