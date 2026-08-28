'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { studentsApi } from '../../../../lib/api/students';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { formatDistanceToNow } from 'date-fns';

const MASTERY_CONFIG = {
  NOT_INTRODUCED: { label: 'Not started', pct: 0,   color: 'bg-border',   text: 'text-muted' },
  INTRODUCED:     { label: 'Introduced',  pct: 25,  color: 'bg-info',     text: 'text-info' },
  PRACTICING:     { label: 'Practicing',  pct: 55,  color: 'bg-warning',  text: 'text-warning' },
  MASTERED:       { label: 'Mastered',    pct: 85,  color: 'bg-success',  text: 'text-success' },
  EXTENDING:      { label: 'Extending',   pct: 100, color: 'bg-accent',   text: 'text-amber-700' },
};

export default function ParentProgressPage() {
  const params = useSearchParams();
  const childIdParam = params.get('childId');

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'mine'],
    queryFn: () => studentsApi.list({ pageSize: 10 }),
  });

  const children = studentsData?.data ?? [];
  const childId = childIdParam ?? children[0]?.id;
  const child = children.find((c) => c.id === childId) ?? children[0];

  const { data: progress, isLoading } = useQuery({
    queryKey: ['students', childId, 'progress'],
    queryFn: () => studentsApi.getProgress(childId),
    enabled: !!childId,
  });

  if (isLoading) return <div className="space-y-4">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>;

  const byArea = (progress?.progress ?? []).reduce((acc, p) => {
    const area = p.curriculumArea?.name ?? 'Other';
    if (!acc[area]) acc[area] = { color: p.curriculumArea?.colorHex, items: [] };
    acc[area].items.push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">
          {child?.firstName}'s Progress
        </h1>
        <p className="text-muted text-sm mt-0.5">Montessori curriculum areas</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <a key={c.id} href={`/parent/progress?childId=${c.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focusable ${c.id === childId ? 'bg-accent text-white' : 'bg-bg border border-border text-muted hover:text-ink'}`}>
              {c.firstName}
            </a>
          ))}
        </div>
      )}

      {Object.entries(byArea).map(([area, { color, items }]) => {
        const mastered = items.filter((i) => ['MASTERED','EXTENDING'].includes(i.masteryLevel)).length;
        return (
          <div key={area} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color ?? '#E3A83D' }} aria-hidden="true" />
                {area}
              </h2>
              <span className="text-xs text-muted">{mastered}/{items.length} mastered</span>
            </div>

            {/* Area progress bar */}
            <div className="w-full h-2 bg-border rounded-full overflow-hidden" role="progressbar"
              aria-valuenow={Math.round((mastered / items.length) * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(mastered / items.length) * 100}%` }} />
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              {items.map((p) => {
                const cfg = MASTERY_CONFIG[p.masteryLevel] ?? MASTERY_CONFIG.NOT_INTRODUCED;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">{p.milestone?.title}</p>
                    </div>
                    <span className={`badge-chip text-xs ${cfg.text} bg-current/10`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Recent observations */}
      {progress?.observations?.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm text-ink">Recent notes from the classroom</h2>
          {progress.observations.slice(0, 5).map((obs) => (
            <div key={obs.id} className="border-l-2 border-accent pl-3 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-chip bg-accent/10 text-amber-700 text-xs">{obs.curriculumArea?.name}</span>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(obs.observedAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-ink">{obs.note}</p>
              {obs.mediaUrls?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {obs.mediaUrls.slice(0,3).map((url, i) => (
                    <img key={i} src={url} alt="Activity photo" className="w-12 h-12 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
