'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../../../lib/api/ai';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { Sparkles, CheckCircle2, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
  ATTENDANCE_PATTERN: { label: 'Attendance',   color: 'bg-warning/10 border-warning/30',   dot: 'bg-warning' },
  FEE_DELINQUENCY:    { label: 'Finance',       color: 'bg-danger/10  border-danger/30',    dot: 'bg-danger' },
  CURRICULUM_GAP:     { label: 'Curriculum',    color: 'bg-info/10    border-info/30',      dot: 'bg-info' },
  DAY_REVIEW:         { label: 'Day Review',    color: 'bg-success/10 border-success/30',   dot: 'bg-success' },
  ENGAGEMENT_TREND:   { label: 'Engagement',    color: 'bg-secondary/10 border-secondary/30', dot: 'bg-secondary' },
};

export default function AIInsightsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ai', 'insights', typeFilter, unreadOnly],
    queryFn: () => aiApi.listInsights({ pageSize: 20, type: typeFilter || undefined, unreadOnly: unreadOnly || undefined }),
  });

  const markRead = useMutation({
    mutationFn: aiApi.markInsightRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'insights'] }),
  });

  const insights = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <Sparkles size={20} className="text-primary" aria-hidden="true" />
          {t('ai.insights')}
        </h1>
        <p className="text-xs text-muted">Generated nightly · next run at 02:00 UTC</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Filter size={13} aria-hidden="true" /> Filter:
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All types</option>
          {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-border" />
          Unread only
        </label>
      </div>

      {/* Insights */}
      {isLoading ? (
        <div className="space-y-3">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
      ) : insights.length === 0 ? (
        <div className="card text-center py-16">
          <Sparkles size={36} className="text-border mx-auto mb-3" aria-hidden="true" />
          <p className="text-muted">{t('ai.noInsights')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins) => {
            const meta = TYPE_META[ins.type] ?? TYPE_META.DAY_REVIEW;
            return (
              <div key={ins.id} className={`card border ${meta.color} ${ins.isRead ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${meta.dot}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-ink">{ins.title}</p>
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(new Date(ins.generatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1 leading-relaxed">{ins.summary}</p>
                      {ins.actionItems?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide">{t('ai.actionItems')}</p>
                          {ins.actionItems.map((a, i) => (
                            <p key={i} className="text-xs text-ink flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">→</span>{a}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!ins.isRead && (
                    <button onClick={() => markRead.mutate(ins.id)}
                      className="shrink-0 text-muted hover:text-success transition-colors focusable"
                      aria-label="Mark as read">
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
