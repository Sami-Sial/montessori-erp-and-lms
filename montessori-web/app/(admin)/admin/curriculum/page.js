'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curriculumApi } from '../../../../lib/api/curriculum';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { Plus, BookOpen, ChevronDown, ChevronUp, Calendar, Loader2 } from 'lucide-react';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { format } from 'date-fns';

const AREA_ICONS = {
  'Practical Life': '🧹',
  'Sensorial':      '👁',
  'Language':       '📖',
  'Mathematics':    '🔢',
  'Culture':        '🌍',
};

const STATUS_CHIP = {
  DRAFT:     'bg-muted/10 text-muted',
  PUBLISHED: 'bg-success/10 text-success',
  ARCHIVED:  'bg-border text-muted',
};

const lpSchema = z.object({
  classroomId:      z.string().uuid('Required'),
  academicYearId:   z.string().uuid('Required'),
  curriculumAreaId: z.string().uuid('Required'),
  title:            z.string().min(1, 'Required'),
  objectives:       z.string().optional(),
  instructions:     z.string().optional(),
  scheduledDate:    z.string().optional(),
  durationMinutes:  z.coerce.number().optional(),
  status:           z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'),
});

export default function CurriculumPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedArea, setExpandedArea] = useState(null);

  const { data: curricula, isLoading: loadingAreas } = useQuery({
    queryKey: ['curriculum', 'areas'],
    queryFn: curriculumApi.getAreas,
  });

  const { data: lessonPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ['lessonPlans'],
    queryFn: () => curriculumApi.listLessonPlans({ pageSize: 50 }),
  });

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });

  const createMut = useMutation({
    mutationFn: curriculumApi.createLessonPlan,
    onSuccess: () => {
      toast.success(t('observations.saved'));
      qc.invalidateQueries({ queryKey: ['lessonPlans'] });
      setShowForm(false);
      reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const deleteMut = useMutation({
    mutationFn: curriculumApi.deleteLessonPlan,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['lessonPlans'] }); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(lpSchema) });
  const onSubmit = (data) => createMut.mutate(data);

  const allAreas = curricula?.flatMap((c) => c.areas) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">{t('curriculum.title')}</h1>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">
          <Plus size={16} /> {t('curriculum.createLessonPlan')}
        </button>
      </div>

      {/* Curriculum areas accordion */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">Five Montessori Areas</h2>
        {loadingAreas ? [0,1,2,3,4].map(i => <SkeletonCard key={i} className="h-12" />) : (
          allAreas.map((area) => (
            <div key={area.id} className="card p-0 overflow-hidden">
              <button
                onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors focusable"
                aria-expanded={expandedArea === area.id}
              >
                <span className="text-xl" aria-hidden="true">{AREA_ICONS[area.name] ?? '📚'}</span>
                <span className="font-semibold text-ink flex-1 text-left">{area.name}</span>
                <span className="text-xs text-muted">{area.milestones?.length ?? 0} milestones</span>
                {expandedArea === area.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
              </button>
              {expandedArea === area.id && (
                <div className="border-t border-border divide-y divide-border/50">
                  {area.milestones?.map((m) => (
                    <div key={m.id} className="px-4 py-2.5 flex items-center justify-between">
                      <p className="text-sm text-ink">{m.title}</p>
                      <p className="text-xs text-muted">{m.ageGroupMin}–{m.ageGroupMax}y</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create lesson plan form */}
      {showForm && (
        <div className="card space-y-4 border-primary/30">
          <h2 className="font-semibold text-ink">{t('curriculum.createLessonPlan')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Classroom *</label>
                <select {...register('classroomId')} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">Select classroom</option>
                  {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.classroomId && <p className="text-xs text-danger mt-1">{errors.classroomId.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Curriculum area *</label>
                <select {...register('curriculumAreaId')} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">Select area</option>
                  {allAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                {errors.curriculumAreaId && <p className="text-xs text-danger mt-1">{errors.curriculumAreaId.message}</p>}
              </div>
            </div>
            <input type="hidden" value={classrooms?.[0]?.academicYearId ?? ''} {...register('academicYearId')} />
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Title *</label>
              <input {...register('title')} placeholder="e.g. Introduction to Pouring"
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:ring-2 focus:ring-primary focus:outline-none ${errors.title ? 'border-danger' : 'border-border'}`} />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Objectives</label>
              <textarea {...register('objectives')} rows={2} placeholder="What will students achieve?"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Instructions</label>
              <textarea {...register('instructions')} rows={3} placeholder="Step-by-step instructions…"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Scheduled date</label>
                <input type="date" {...register('scheduledDate')} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Status</label>
                <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 focusable">
                {createMut.isPending && <Loader2 size={14} className="animate-spin" />}
                {t('common.save')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson plans list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide flex items-center gap-2">
          <Calendar size={14} /> Lesson Plans
        </h2>
        {loadingPlans ? <SkeletonCard /> : lessonPlans?.data?.length === 0 ? (
          <div className="card text-center py-8 text-muted text-sm">No lesson plans yet</div>
        ) : (
          <div className="space-y-2">
            {lessonPlans?.data?.map((lp) => (
              <div key={lp.id} className="card flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-lg text-lg flex items-center justify-center shrink-0 bg-bg" aria-hidden="true">
                  {AREA_ICONS[lp.curriculumArea?.name] ?? '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-ink text-sm">{lp.title}</p>
                    <span className={`badge-chip text-xs ${STATUS_CHIP[lp.status]}`}>{lp.status}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {lp.curriculumArea?.name}
                    {lp.scheduledDate && ` · ${format(new Date(lp.scheduledDate), 'MMM d, yyyy')}`}
                    {lp.createdBy?.user && ` · ${lp.createdBy.user.firstName} ${lp.createdBy.user.lastName}`}
                  </p>
                  {lp.objectives && <p className="text-xs text-muted mt-1 line-clamp-2">{lp.objectives}</p>}
                </div>
                <button onClick={() => deleteMut.mutate(lp.id)}
                  className="text-xs text-muted hover:text-danger transition-colors focusable shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
