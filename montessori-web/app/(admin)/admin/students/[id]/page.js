'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { studentsApi } from '../../../../../lib/api/students';
import { SkeletonCard } from '../../../../../components/shared/Skeleton';
import Link from 'next/link';
import { ArrowLeft, Heart, BookOpen, Calendar, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const MASTERY_COLORS = {
  NOT_INTRODUCED: 'bg-border text-muted',
  INTRODUCED:     'bg-info/15 text-info',
  PRACTICING:     'bg-warning/15 text-warning',
  MASTERED:       'bg-success/15 text-success',
  EXTENDING:      'bg-accent/15 text-amber-700',
};

function ProgressBar({ level }) {
  const pct = { NOT_INTRODUCED: 0, INTRODUCED: 25, PRACTICING: 50, MASTERED: 85, EXTENDING: 100 }[level] ?? 0;
  const color = { NOT_INTRODUCED: 'bg-border', INTRODUCED: 'bg-info', PRACTICING: 'bg-warning', MASTERED: 'bg-success', EXTENDING: 'bg-accent' }[level];
  return (
    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(id),
  });

  const { data: progress } = useQuery({
    queryKey: ['students', id, 'progress'],
    queryFn: () => studentsApi.getProgress(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (!student) return <p className="text-muted">Student not found.</p>;

  const ageYears = Math.floor((Date.now() - new Date(student.dateOfBirth)) / (365.25 * 24 * 3600 * 1000));
  const activeEnrollment = student.enrollments?.find((e) => e.status === 'ACTIVE');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/students" className="mt-1 text-muted hover:text-ink focusable" aria-label="Back to students">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`}
              className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">
              {student.firstName[0]}{student.lastName[0]}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted text-sm">
              {student.studentNumber} · {ageYears} years old · {activeEnrollment?.classroom?.name ?? 'No active enrollment'}
            </p>
          </div>
        </div>
        <Link href={`/admin/students/${id}/edit`}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-ink hover:bg-bg focusable">
          Edit
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Guardians */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <User size={15} className="text-muted" aria-hidden="true" /> Guardians
          </h2>
          {student.guardians?.length === 0 && <p className="text-muted text-sm">No guardians added</p>}
          {student.guardians?.map(({ guardian, isPrimary, canPickup }) => (
            <div key={guardian.id} className="text-sm space-y-0.5">
              <p className="font-medium text-ink">
                {guardian.firstName} {guardian.lastName}
                {isPrimary && <span className="ml-1 text-xs text-primary">(Primary)</span>}
              </p>
              <p className="text-muted">{guardian.relationship} · {guardian.phone}</p>
              {!canPickup && <p className="text-xs text-danger">Cannot pick up</p>}
            </div>
          ))}
        </div>

        {/* Medical */}
        <div className="card space-y-2">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Heart size={15} className="text-danger" aria-hidden="true" /> Medical
          </h2>
          {student.medicalInfo ? (
            <>
              {student.medicalInfo.allergies?.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {student.medicalInfo.allergies.map((a) => (
                      <span key={a} className="badge-chip bg-danger/10 text-danger">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {student.medicalInfo.conditions?.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1">Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {student.medicalInfo.conditions.map((c) => (
                      <span key={c} className="badge-chip bg-warning/10 text-warning">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {student.medicalInfo.medications && (
                <p className="text-xs text-muted">💊 {student.medicalInfo.medications}</p>
              )}
            </>
          ) : <p className="text-muted text-sm">No medical info</p>}
        </div>

        {/* Quick stats */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Calendar size={15} className="text-muted" aria-hidden="true" /> Quick stats
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Observations</span>
              <span className="font-medium text-ink">{student._count?.observations ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Badges earned</span>
              <span className="font-medium text-ink">{student._count?.badges ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Enrolled since</span>
              <span className="font-medium text-ink">
                {activeEnrollment ? format(new Date(activeEnrollment.enrolledAt), 'MMM d, yyyy') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress by area */}
      {progress?.progress?.length > 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <BookOpen size={15} className="text-muted" aria-hidden="true" /> Curriculum Progress
          </h2>
          {/* Group by area */}
          {Object.entries(
            progress.progress.reduce((acc, p) => {
              const area = p.curriculumArea?.name ?? 'Other';
              if (!acc[area]) acc[area] = [];
              acc[area].push(p);
              return acc;
            }, {})
          ).map(([area, items]) => (
            <div key={area} className="space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">{area}</p>
              {items.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink">{p.milestone?.title}</p>
                    <span className={`badge-chip text-xs ${MASTERY_COLORS[p.masteryLevel]}`}>
                      {p.masteryLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ProgressBar level={p.masteryLevel} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Recent observations */}
      {progress?.observations?.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm text-ink">Recent observations</h2>
          {progress.observations.map((obs) => (
            <div key={obs.id} className="border-l-2 border-secondary pl-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-chip bg-secondary/10 text-secondary text-xs">{obs.curriculumArea?.name}</span>
                {obs.milestone && <span className="text-xs text-muted">{obs.milestone.title}</span>}
                <span className="text-xs text-muted ml-auto">
                  {formatDistanceToNow(new Date(obs.observedAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-ink">{obs.note}</p>
              {obs.mediaUrls?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {obs.mediaUrls.slice(0, 3).map((url, i) => (
                    <img key={i} src={url} alt="Observation media" className="w-12 h-12 rounded object-cover" />
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
