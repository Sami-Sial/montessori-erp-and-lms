'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { gamificationApi } from '../../../../lib/api/gamification';
import { SkeletonCard } from '../../../../components/shared/Skeleton';

export default function ParentAchievementsPage() {
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Load parent's children
  const { data: studentsData } = useQuery({
    queryKey: ['students', 'mine'],
    queryFn: () => studentsApi.list({ pageSize: 10 }),
  });

  const children = studentsData?.data ?? [];
  const childId = selectedChildId ?? children[0]?.id;
  const child = children.find(c => c.id === childId) ?? children[0];

  const { data: points, isLoading: loadingPoints } = useQuery({
    queryKey: ['gamification', childId, 'points'],
    queryFn: () => gamificationApi.getStudentPoints(childId),
    enabled: !!childId,
  });

  const { data: streaks } = useQuery({
    queryKey: ['gamification', childId, 'streaks'],
    queryFn: () => gamificationApi.getStudentStreaks(childId),
    enabled: !!childId,
  });

  const { data: badges } = useQuery({
    queryKey: ['gamification', childId, 'badges'],
    queryFn: () => gamificationApi.getStudentBadges(childId),
    enabled: !!childId,
  });

  const attendanceStreak = streaks?.find((s) => s.type === 'ATTENDANCE');
  const totalPoints = points?.totalPoints ?? 0;
  const badgeCount = badges?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">
          {child?.firstName}'s Achievements
        </h1>
        <p className="text-muted text-sm mt-0.5">Badges, points, and streaks</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <button key={c.id} onClick={() => setSelectedChildId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focusable ${c.id === childId ? 'bg-accent text-white' : 'bg-bg border border-border text-muted hover:text-ink'}`}>
              {c.firstName}
            </button>
          ))}
        </div>
      )}

      {loadingPoints ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Hero with vibrant gradient */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-8 text-white shadow-2xl transition-transform hover:scale-[1.01]">
            <div className="absolute -right-4 -top-10 opacity-20 text-[150px] rotate-12 pointer-events-none">🌟</div>
            <p className="font-playful text-lg opacity-90 drop-shadow-md">{child?.firstName} has earned</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="font-playful text-5xl font-black drop-shadow-xl animate-pulse">{totalPoints}</p>
              <p className="text-white/90 font-playful text-lg font-medium">total points</p>
            </div>
          </div>

          {/* Stats row with glassmorphism */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Badges Earned', value: badgeCount, emoji: '🏅', color: 'from-blue-400 to-indigo-500' },
              { label: 'Current Streak', value: attendanceStreak?.currentStreak ?? 0, emoji: '🔥', color: 'from-orange-400 to-red-500' },
              { label: 'Best Streak', value: attendanceStreak?.longestStreak ?? 0, emoji: '⭐', color: 'from-yellow-400 to-amber-500' },
            ].map(({ label, value, emoji, color }) => (
              <div key={label} className="group relative rounded-3xl bg-white/70 backdrop-blur-md border border-white/50 p-5 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/90 cursor-default overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>
                <p className="text-2xl transition-transform duration-300 group-hover:scale-125" aria-hidden="true">{emoji}</p>
                <p className="font-playful text-2xl font-extrabold text-slate-800 mt-2">{value}</p>
                <p className="font-playful text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent badges */}
          <div className="rounded-3xl bg-white border border-border p-6 shadow-card">
            <h2 className="font-playful text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span> Badges Collection
            </h2>
            
            {!badges?.length ? (
              <div className="py-8 text-center text-muted text-sm">
                No badges earned yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((sb) => (
                  <div key={sb.id} className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 cursor-pointer">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm border-2 border-white ring-2 ring-gray-100 group-hover:ring-purple-300 transition-all"
                      style={{ backgroundColor: sb.badge?.colorHex ? `${sb.badge.colorHex}25` : '#FFF8EC' }}
                      title={sb.badge?.description}>
                      {sb.badge?.iconData || '🏅'}
                    </div>
                    <p className="font-playful text-xs font-semibold text-slate-700 text-center leading-tight">
                      {sb.badge?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
