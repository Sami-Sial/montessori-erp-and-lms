'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { gamificationApi } from '../../../../lib/api/gamification';
import { studentsApi } from '../../../../lib/api/students';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { Award, Trophy, Plus, Loader2, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function GamificationPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState('badges');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [showAward, setShowAward] = useState(false);

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: gamificationApi.listBadges,
  });

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: () => studentsApi.list({ pageSize: 100 }) });

  const { data: leaderboard, isLoading: loadingLB } = useQuery({
    queryKey: ['leaderboard', selectedClassroom],
    queryFn: () => gamificationApi.getLeaderboard(selectedClassroom, { period: 'WEEKLY' }),
    enabled: !!selectedClassroom && tab === 'leaderboard',
  });

  const awardMut = useMutation({
    mutationFn: gamificationApi.awardBadge,
    onSuccess: () => {
      toast.success('Badge awarded! 🏅');
      qc.invalidateQueries({ queryKey: ['badges'] });
      setShowAward(false); reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const onAward = (data) => awardMut.mutate(data);

  // Auto-select first classroom
  const firstClassroom = classrooms?.[0];
  const classroomId = selectedClassroom || firstClassroom?.id;

  const tabs = [
    { key: 'badges',      label: 'Badges',      icon: Award },
    { key: 'leaderboard', label: 'Leaderboard',  icon: Trophy },
  ];

  const RANK_COLORS = ['text-accent', 'text-muted', 'text-amber-600'];
  const RANK_ICONS = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Gamification</h1>
        {tab === 'badges' && (
          <button onClick={() => setShowAward((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors focusable">
            <Award size={16} /> Award badge
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} role="tab" aria-selected={tab === key}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focusable -mb-px ${
              tab === key ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {/* Award badge form */}
      {tab === 'badges' && showAward && (
        <form onSubmit={handleSubmit(onAward)} className="card border-accent/30 space-y-3 animate-slide-up">
          <h2 className="font-semibold text-sm text-ink">Award a badge</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Student *</label>
              <select {...register('studentId', { required: true })} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none">
                <option value="">Select student</option>
                {students?.data?.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Badge *</label>
              <select {...register('badgeId', { required: true })} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none">
                <option value="">Select badge</option>
                {badges?.map((b) => <option key={b.id} value={b.id}>{b.name} (+{b.points}pts)</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Note (optional)</label>
            <input {...register('note')} placeholder="Why are you awarding this badge?"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting || awardMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500 disabled:opacity-50 focusable">
              {(isSubmitting || awardMut.isPending) && <Loader2 size={14} className="animate-spin" />}
              🏅 Award
            </button>
            <button type="button" onClick={() => { setShowAward(false); reset(); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
          </div>
        </form>
      )}

      {/* Badges catalog */}
      {tab === 'badges' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loadingBadges ? [0,1,2].map(i => <SkeletonCard key={i} />) : badges?.map((badge) => (
            <div key={badge.id} className="card space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: badge.colorHex ? `${badge.colorHex}20` : undefined }}
                  aria-hidden="true">
                  {badge.iconUrl ? <img src={badge.iconUrl} alt="" className="w-7 h-7" /> : '🏅'}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{badge.name}</p>
                  <p className="text-xs text-muted">{badge.points} points</p>
                </div>
              </div>
              {badge.description && <p className="text-xs text-muted">{badge.description}</p>}
              <p className="text-xs text-muted">{badge._count?.studentBadges ?? 0} awarded</p>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <select value={classroomId} onChange={(e) => setSelectedClassroom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              aria-label="Select classroom">
              {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="badge-chip bg-accent/15 text-amber-700 text-xs self-center">Class-scoped · never school-wide</span>
          </div>

          {loadingLB ? <SkeletonCard /> : leaderboard?.entries?.length === 0 ? (
            <div className="card text-center py-10 text-muted text-sm">No leaderboard data for this period yet</div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="px-4 py-3 bg-accent/5 border-b border-border flex items-center gap-2">
                <Trophy size={16} className="text-accent" aria-hidden="true" />
                <p className="font-semibold text-sm text-ink">Weekly Leaderboard — {leaderboard?.entries?.[0] && classrooms?.find((c) => c.id === classroomId)?.name}</p>
              </div>
              <div className="divide-y divide-border">
                {leaderboard?.entries?.map((entry, idx) => (
                  <div key={entry.id} className={`flex items-center gap-4 px-4 py-3 ${idx === 0 ? 'bg-accent/5' : ''}`}>
                    <span className="font-playful text-2xl w-8 text-center" aria-label={`Rank ${idx + 1}`}>
                      {idx < 3 ? RANK_ICONS[idx] : <span className="text-muted font-mono text-sm">{idx + 1}</span>}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-amber-700 font-semibold text-sm shrink-0" aria-hidden="true">
                      {entry.student?.firstName?.[0]}{entry.student?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${idx === 0 ? 'text-accent' : 'text-ink'}`}>
                        {entry.student?.firstName} {entry.student?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-playful text-lg font-bold text-accent">
                      <Star size={14} className="fill-accent" aria-hidden="true" />
                      {entry.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
