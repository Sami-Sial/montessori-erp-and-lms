'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { gamificationApi } from '../../../../lib/api/gamification';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function StudentBadgesPage() {
  const { data: studentsData } = useQuery({ queryKey: ['students','mine'], queryFn: () => studentsApi.list({ pageSize: 1 }) });
  const student = studentsData?.data?.[0];

  const { data: badges, isLoading } = useQuery({
    queryKey: ['gamification', student?.id, 'badges'],
    queryFn: () => gamificationApi.getStudentBadges(student.id),
    enabled: !!student?.id,
  });

  const { data: points } = useQuery({
    queryKey: ['gamification', student?.id, 'points'],
    queryFn: () => gamificationApi.getStudentPoints(student.id),
    enabled: !!student?.id,
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-accent/80 to-tertiary/80 p-4 text-white text-center">
        <p className="font-playful text-4xl font-bold">{points?.totalPoints ?? 0}</p>
        <p className="font-playful text-sm opacity-90">total points earned</p>
      </div>

      <h1 className="font-playful text-xl font-bold text-ink">My Badges 🏅</h1>

      {isLoading ? <SkeletonCard /> : badges?.length === 0 ? (
        <div className="rounded-2xl bg-white border border-border p-8 text-center shadow-card">
          <p className="text-4xl mb-3" aria-hidden="true">🌱</p>
          <p className="font-playful font-bold text-ink">Earn your first badge!</p>
          <p className="font-playful text-sm text-muted mt-1">Keep working hard and your teacher will award you badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {badges.map((sb) => (
            <div key={sb.id} className="rounded-2xl bg-white border border-border p-4 flex flex-col items-center gap-2 shadow-card">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: sb.badge?.colorHex ? `${sb.badge.colorHex}25` : '#FFF8EC' }}
                aria-label={sb.badge?.name}>
                🏅
              </div>
              <p className="font-playful font-bold text-ink text-center text-sm leading-tight">{sb.badge?.name}</p>
              <p className="font-playful text-xs text-accent font-semibold">+{sb.badge?.points} pts</p>
              {sb.note && <p className="font-playful text-xs text-muted text-center italic">"{sb.note}"</p>}
              <p className="font-playful text-[10px] text-muted">
                {formatDistanceToNow(new Date(sb.awardedAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
