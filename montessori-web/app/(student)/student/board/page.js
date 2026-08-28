'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { gamificationApi } from '../../../../lib/api/gamification';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { SkeletonCard } from '../../../../components/shared/Skeleton';

const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function StudentBoardPage() {
  const { data: studentsData } = useQuery({ queryKey: ['students','mine'], queryFn: () => studentsApi.list({ pageSize: 1 }) });
  const student = studentsData?.data?.[0];
  const classroomId = student?.enrollments?.[0]?.classroomId;

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', classroomId],
    queryFn: () => gamificationApi.getLeaderboard(classroomId, { period: 'WEEKLY' }),
    enabled: !!classroomId,
  });

  return (
    <div className="space-y-5">
      <h1 className="font-playful text-xl font-bold text-ink">Class Board 🏆</h1>
      <p className="font-playful text-sm text-muted">This week in your class — keep earning points!</p>

      {isLoading ? <SkeletonCard /> : leaderboard?.entries?.length === 0 ? (
        <div className="rounded-2xl bg-white border border-border p-8 text-center shadow-card">
          <p className="text-4xl mb-3" aria-hidden="true">🌟</p>
          <p className="font-playful font-bold text-ink">No scores yet this week</p>
          <p className="font-playful text-sm text-muted mt-1">Be the first to earn points!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.entries.map((entry, idx) => {
            const isMe = entry.studentId === student?.id;
            return (
              <div key={entry.id}
                className={`rounded-2xl p-4 flex items-center gap-4 shadow-card ${
                  isMe ? 'bg-accent/20 border-2 border-accent' : 'bg-white border border-border'
                }`}>
                <span className="font-playful text-2xl w-8 text-center" aria-label={`Rank ${idx + 1}`}>
                  {idx < 3 ? RANK_EMOJI[idx] : <span className="text-muted font-bold text-base">{idx + 1}</span>}
                </span>
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-amber-700 font-playful font-bold text-base shrink-0" aria-hidden="true">
                  {entry.student?.firstName?.[0]}
                </div>
                <div className="flex-1">
                  <p className={`font-playful font-bold ${isMe ? 'text-accent' : 'text-ink'}`}>
                    {entry.student?.firstName} {entry.student?.lastName}
                    {isMe && ' (you!)'}
                  </p>
                </div>
                <div className="font-playful text-xl font-bold text-accent">
                  ⭐ {entry.points}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-border p-4 text-center shadow-card">
        <p className="font-playful text-sm text-muted">
          Scores reset every week. Earn points by getting your work observed and earning badges!
        </p>
      </div>
    </div>
  );
}
