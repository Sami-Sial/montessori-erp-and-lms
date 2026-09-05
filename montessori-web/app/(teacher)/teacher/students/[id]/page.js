'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { studentsApi } from '../../../../../lib/api/students';
import { SkeletonCard } from '../../../../../components/shared/Skeleton';
import { useToast } from '../../../../../lib/hooks/useToast';
import Link from 'next/link';
import { ArrowLeft, Heart, BookOpen, Calendar, User, X } from 'lucide-react';
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
  const qc = useQueryClient();
  const toast = useToast();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '' });

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [medicalData, setMedicalData] = useState({ allergies: '', conditions: '', medications: '', doctorName: '', doctorPhone: '' });

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(id),
  });

  const updateMut = useMutation({
    mutationFn: (data) => studentsApi.update(id, data),
    onSuccess: () => {
      toast.success('Student updated');
      setIsEditModalOpen(false);
      setIsMedicalModalOpen(false);
      qc.invalidateQueries({ queryKey: ['students', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err) => toast.error('Update failed', err.message),
  });

  const handleEditClick = () => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth ? format(new Date(student.dateOfBirth), 'yyyy-MM-dd') : '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate({
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
    });
  };

  const handleMedicalEditClick = () => {
    setMedicalData({
      allergies: student.medicalInfo?.allergies?.join(', ') || '',
      conditions: student.medicalInfo?.conditions?.join(', ') || '',
      medications: student.medicalInfo?.medications || '',
      doctorName: student.medicalInfo?.doctorName || '',
      doctorPhone: student.medicalInfo?.doctorPhone || '',
    });
    setIsMedicalModalOpen(true);
  };

  const handleMedicalEditSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate({
      allergies: medicalData.allergies ? medicalData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      conditions: medicalData.conditions ? medicalData.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      medications: medicalData.medications || null,
      doctorName: medicalData.doctorName || null,
      doctorPhone: medicalData.doctorPhone || null,
    });
  };

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
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-10">
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
        <button onClick={handleEditClick}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-ink hover:bg-bg focusable">
          Edit
        </button>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Edit Student</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-muted hover:text-ink rounded focusable">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input required type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" disabled={updateMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMedicalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Edit Medical Info</h2>
              <button onClick={() => setIsMedicalModalOpen(false)} className="p-1 text-muted hover:text-ink rounded focusable">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMedicalEditSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Allergies (comma separated)</label>
                <input type="text" value={medicalData.allergies} onChange={e => setMedicalData({...medicalData, allergies: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Peanuts, Penicillin" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conditions (comma separated)</label>
                <input type="text" value={medicalData.conditions} onChange={e => setMedicalData({...medicalData, conditions: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Asthma" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medications</label>
                <input type="text" value={medicalData.medications} onChange={e => setMedicalData({...medicalData, medications: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Doctor Name</label>
                  <input type="text" value={medicalData.doctorName} onChange={e => setMedicalData({...medicalData, doctorName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Doctor Phone</label>
                  <input type="text" value={medicalData.doctorPhone} onChange={e => setMedicalData({...medicalData, doctorPhone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsMedicalModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" disabled={updateMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <div className="card space-y-2 relative group">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
              <Heart size={15} className="text-danger" aria-hidden="true" /> Medical
            </h2>
            <button onClick={handleMedicalEditClick} className="px-2 py-1 bg-bg text-xs font-medium text-ink rounded border border-border hover:bg-surface focusable transition-colors">
              Edit
            </button>
          </div>
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
              {student.medicalInfo.doctorName && (
                <p className="text-xs text-muted mt-2">Doctor: {student.medicalInfo.doctorName} {student.medicalInfo.doctorPhone ? `(${student.medicalInfo.doctorPhone})` : ''}</p>
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
