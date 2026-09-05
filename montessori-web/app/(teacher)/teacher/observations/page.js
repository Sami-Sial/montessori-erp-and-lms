'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { observationsApi } from '../../../../lib/api/observations';
import { studentsApi } from '../../../../lib/api/students';
import { curriculumApi } from '../../../../lib/api/curriculum';
import { useToast } from '../../../../lib/hooks/useToast';
import { useSelector } from 'react-redux';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import { Plus, Camera, Loader2, Sparkles, X, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MASTERY_LEVELS = ['NOT_INTRODUCED', 'INTRODUCED', 'PRACTICING', 'MASTERED', 'EXTENDING'];
const MASTERY_COLORS = {
  NOT_INTRODUCED: 'bg-border text-muted',
  INTRODUCED:     'bg-info/15 text-info',
  PRACTICING:     'bg-warning/15 text-warning',
  MASTERED:       'bg-success/15 text-success',
  EXTENDING:      'bg-accent/15 text-amber-700',
};

const obsSchema = z.object({
  studentId:        z.string().uuid('Required'),
  curriculumAreaId: z.string().uuid('Required'),
  milestoneId:      z.string().uuid().optional().or(z.literal('')),
  note:             z.string().min(1, 'Note is required'),
  masteryLevel:     z.enum(['NOT_INTRODUCED','INTRODUCED','PRACTICING','MASTERED','EXTENDING']),
});

export default function TeacherObservationsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');

  const { data: students } = useQuery({ queryKey: ['students'], queryFn: () => studentsApi.list({ pageSize: 100 }) });
  const { data: curricula } = useQuery({ queryKey: ['curriculum', 'areas'], queryFn: curriculumApi.getAreas });
  const { data: observations, isLoading } = useQuery({
    queryKey: ['observations'],
    queryFn: () => observationsApi.list({ pageSize: 20 }),
  });

  const allAreas = curricula?.flatMap((c) => c.areas) ?? [];
  const currentArea = allAreas.find((a) => a.id === selectedArea);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(obsSchema),
    defaultValues: { masteryLevel: 'INTRODUCED' },
  });

  const watchedAreaId = watch('curriculumAreaId');

  const createMut = useMutation({
    mutationFn: observationsApi.create,
    onSuccess: () => {
      toast.success(t('observations.saved'), 'Observation logged');
      qc.invalidateQueries({ queryKey: ['observations'] });
      setShowForm(false);
      setAiSuggestion(null);
      setPhotoPreview(null);
      reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    if (!payload.milestoneId) delete payload.milestoneId;
    if (aiSuggestion?.confidence > 0.5) {
      payload.aiSuggestedAreaId = aiSuggestion.curriculumAreaId;
      payload.aiConfidenceScore = aiSuggestion.confidence;
    }
    createMut.mutate(payload);
  };

  const handlePhotoAiSuggest = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setAiSuggesting(true);

    try {
      // Upload to get a real URL first (simplified — in prod would upload to Cloudinary)
      const suggestion = await observationsApi.suggestFromPhoto(url);
      setAiSuggestion(suggestion);
      if (suggestion.curriculumAreaId) {
        setValue('curriculumAreaId', suggestion.curriculumAreaId);
        setSelectedArea(suggestion.curriculumAreaId);
      }
      if (suggestion.milestoneId) setValue('milestoneId', suggestion.milestoneId);
      toast.info('AI suggestion', suggestion.reasoning ?? 'Area and milestone pre-filled');
    } catch {
      toast.warning('AI unavailable', 'Please select area manually');
    } finally {
      setAiSuggesting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">{t('observations.title')}</h1>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">
          <Plus size={16} /> {t('observations.logObservation')}
        </button>
      </div>

      {/* Observation form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-xl font-bold text-ink">Log Observation</h2>
              <button onClick={() => { setShowForm(false); setAiSuggestion(null); setPhotoPreview(null); reset(); }}
                className="p-1.5 text-muted hover:text-ink hover:bg-bg rounded-lg focusable transition-colors" aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            {/* Photo upload with AI tagging */}
            <div className="rounded-xl border-2 border-dashed border-border bg-bg/50 p-6 text-center relative hover:border-primary/50 transition-colors">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Observation" className="w-full max-h-48 object-contain rounded-lg" />
                  {aiSuggesting && (
                    <div className="absolute inset-0 bg-surface/80 rounded-lg flex items-center justify-center gap-2">
                      <Sparkles size={16} className="text-primary animate-pulse" />
                      <span className="text-sm text-primary font-bold tracking-wide">AI analyzing photo…</span>
                    </div>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-3 text-muted hover:text-primary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera size={24} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-ink">{t('observations.addPhoto')}</span>
                    <span className="text-xs text-primary font-medium mt-1">AI will automatically suggest area & milestone</span>
                  </div>
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoAiSuggest} aria-label="Upload observation photo" />
                </label>
              )}
            </div>

            {aiSuggestion && (
              <div className="flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/20 p-4 shadow-inner">
                <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-primary/90 leading-relaxed">{aiSuggestion.reasoning} <span className="opacity-75">(confidence: {Math.round((aiSuggestion.confidence ?? 0) * 100)}%)</span></p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Student <span className="text-red-500">*</span></label>
                  <select {...register('studentId')} className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none shadow-sm ${errors.studentId ? 'border-danger' : 'border-border'}`}>
                    <option value="" disabled>Select student</option>
                    {students?.data?.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                  {errors.studentId && <p className="text-xs text-danger mt-1 font-medium">{errors.studentId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Curriculum Area <span className="text-red-500">*</span></label>
                  <select {...register('curriculumAreaId')} onChange={(e) => { register('curriculumAreaId').onChange(e); setSelectedArea(e.target.value); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none shadow-sm ${errors.curriculumAreaId ? 'border-danger' : 'border-border'}`}>
                    <option value="" disabled>Select area</option>
                    {allAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  {errors.curriculumAreaId && <p className="text-xs text-danger mt-1 font-medium">{errors.curriculumAreaId.message}</p>}
                </div>
              </div>

              {/* Milestone */}
              {currentArea?.milestones?.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Milestone <span className="text-muted font-normal">(optional)</span></label>
                  <select {...register('milestoneId')} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none shadow-sm">
                    <option value="">None</option>
                    {currentArea.milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Observation Note <span className="text-red-500">*</span></label>
                <textarea {...register('note')} rows={3}
                  placeholder="Describe what you observed in objective language…"
                  className={`w-full px-3.5 py-3 rounded-xl border text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none shadow-sm ${errors.note ? 'border-danger' : 'border-border'}`} />
                {errors.note && <p className="text-xs text-danger mt-1 font-medium">{errors.note.message}</p>}
              </div>

              {/* Mastery level */}
              <div>
                <label className="block text-xs font-bold text-ink mb-2">{t('observations.masteryLevel')}</label>
                <div className="flex flex-wrap gap-2">
                  {MASTERY_LEVELS.map((level) => {
                    const current = watch('masteryLevel');
                    return (
                      <button key={level} type="button"
                        onClick={() => setValue('masteryLevel', level)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all focusable ${
                          current === level ? MASTERY_COLORS[level] + ' border-current shadow-sm' : 'border-border bg-bg text-muted hover:border-muted hover:bg-surface'
                        }`}
                        aria-pressed={current === level}>
                        {level.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => { setShowForm(false); reset(); setAiSuggestion(null); setPhotoPreview(null); }}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-muted hover:text-ink hover:bg-bg focusable transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 focusable shadow-sm transition-colors">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Observations feed */}
      {isLoading ? (
        <div className="space-y-3">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
      ) : observations?.data?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted text-sm">No observations yet. Tap "Log observation" to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {observations?.data?.map((obs) => (
            <div key={obs.id} className="card flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0" aria-hidden="true">
                {obs.student?.firstName?.[0]}{obs.student?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink text-sm">{obs.student?.firstName} {obs.student?.lastName}</p>
                  <span className="badge-chip bg-secondary/10 text-secondary text-xs">{obs.curriculumArea?.name}</span>
                  <span className={`badge-chip text-xs ${MASTERY_COLORS[obs.masteryLevel]}`}>
                    {obs.masteryLevel.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-muted ml-auto">
                    {formatDistanceToNow(new Date(obs.observedAt), { addSuffix: true })}
                  </span>
                </div>
                {obs.milestone && <p className="text-xs text-muted mt-0.5">Milestone: {obs.milestone.title}</p>}
                <p className="text-sm text-ink mt-1">{obs.note}</p>
                {obs.mediaUrls?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {obs.mediaUrls.map((url, i) => (
                      <img key={i} src={url} alt="Observation media" className="w-14 h-14 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
