'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { gamificationApi } from '../../../../lib/api/gamification';
import { studentsApi } from '../../../../lib/api/students';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.auth);

  // Load student's own profile
  const { data: studentsData } = useQuery({
    queryKey: ['students', 'mine'],
    queryFn: () => studentsApi.list({ pageSize: 1 }),
  });
  const student = studentsData?.data?.[0];

  const { data: points } = useQuery({
    queryKey: ['gamification', student?.id, 'points'],
    queryFn: () => gamificationApi.getStudentPoints(student.id),
    enabled: !!student?.id,
  });

  const { data: streaks } = useQuery({
    queryKey: ['gamification', student?.id, 'streaks'],
    queryFn: () => gamificationApi.getStudentStreaks(student.id),
    enabled: !!student?.id,
  });

  const { data: badges } = useQuery({
    queryKey: ['gamification', student?.id, 'badges'],
    queryFn: () => gamificationApi.getStudentBadges(student.id),
    enabled: !!student?.id,
  });

  const attendanceStreak = streaks?.find((s) => s.type === 'ATTENDANCE');
  const totalPoints = points?.totalPoints ?? 0;
  const badgeCount = badges?.length ?? 0;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-accent to-tertiary p-6 text-white shadow-card">
        <p className="font-playful text-lg opacity-90">Welcome back,</p>
        <h1 className="font-playful text-3xl font-bold">{user?.firstName}! 🌟</h1>
        <p className="font-playful text-5xl font-bold mt-3">{totalPoints}</p>
        <p className="text-white/80 font-playful text-sm mt-0.5">total points</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Badges',    value: badgeCount,                         emoji: '🏅' },
          { label: 'Day streak',value: attendanceStreak?.currentStreak ?? 0, emoji: '🔥' },
          { label: 'Best streak',value: attendanceStreak?.longestStreak ?? 0, emoji: '⭐' },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="rounded-2xl bg-white border border-border p-3 text-center shadow-card">
            <p className="text-2xl" aria-hidden="true">{emoji}</p>
            <p className="font-playful text-2xl font-bold text-ink mt-1">{value}</p>
            <p className="font-playful text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent badges */}
      {badges?.length > 0 && (
        <div className="rounded-2xl bg-white border border-border p-4 space-y-3 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-playful font-bold text-ink">My Badges 🏅</h2>
            <Link href="/student/badges" className="text-xs text-accent hover:underline focusable">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {badges.slice(0, 6).map((sb) => (
              <div key={sb.id} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: sb.badge?.colorHex ? `${sb.badge.colorHex}25` : '#FFF8EC' }}
                  aria-label={sb.badge?.name}>
                  🏅
                </div>
                <p className="font-playful text-[10px] text-muted text-center leading-tight w-14 truncate">
                  {sb.badge?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational card */}
      <div className="rounded-2xl bg-white border border-border p-4 text-center shadow-card">
        <p className="text-3xl mb-2" aria-hidden="true">🎯</p>
        <p className="font-playful font-bold text-ink">Keep it up!</p>
        <p className="font-playful text-sm text-muted mt-1">
          {attendanceStreak?.currentStreak
            ? `You've been to school ${attendanceStreak.currentStreak} days in a row!`
            : 'Come to school every day to build your streak!'}
        </p>
      </div>
    </div>
  );
}
