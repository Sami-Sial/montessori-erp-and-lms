'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { curriculumApi } from '../../lib/api/curriculum';
import { classroomsApi } from '../../lib/api/classrooms';
import { useToast } from '../../lib/hooks/useToast';
import { SkeletonCard } from './Skeleton';
import { Plus, X, Calendar, BookOpen, Clock, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const lessonPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  classroomId: z.string().uuid('Classroom is required'),
  curriculumAreaId: z.string().uuid('Curriculum Area is required'),
  milestoneId: z.string().uuid().optional().or(z.literal('')),
  scheduledDate: z.string().optional(),
  durationMinutes: z.number().min(1).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  objectives: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  materialIds: z.array(z.string().uuid()).optional(),
});

export function LessonPlansView() {
  const toast = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const globalAcademicYearId = useSelector((s) => s.ui.selectedAcademicYearId);

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });
  const { data: curricula } = useQuery({ queryKey: ['curriculum', 'areas'], queryFn: curriculumApi.getAreas });
  const { data: lessonPlans, isLoading } = useQuery({
    queryKey: ['lessonPlans'],
    queryFn: () => curriculumApi.listLessonPlans({}),
  });
  const { data: materialsList } = useQuery({ queryKey: ['materials'], queryFn: curriculumApi.getMaterials });

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: { status: 'DRAFT', durationMinutes: 30, materialIds: [], milestoneId: '' },
  });

  const selectedFormClassroomId = useWatch({ control, name: 'classroomId' });
  const selectedClassroom = classrooms?.find(c => c.id === selectedFormClassroomId);
  const selectedCurriculum = curricula?.find(c => c.id === selectedClassroom?.curriculumId);
  const formAreas = selectedCurriculum ? selectedCurriculum.areas : (curricula?.flatMap((c) => c.areas) ?? []);

  const selectedFormAreaId = useWatch({ control, name: 'curriculumAreaId' });
  const selectedArea = formAreas.find(a => a.id === selectedFormAreaId);
  const formMilestones = selectedArea?.milestones || [];
  const selectedMaterialIds = useWatch({ control, name: 'materialIds' }) || [];

  const createMut = useMutation({
    mutationFn: curriculumApi.createLessonPlan,
    onSuccess: () => {
      toast.success('Lesson plan created successfully');
      qc.invalidateQueries({ queryKey: ['lessonPlans'] });
      handleCloseForm();
    },
    onError: (err) => toast.error('Failed to create lesson plan', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => curriculumApi.updateLessonPlan(id, data),
    onSuccess: () => {
      toast.success('Lesson plan updated successfully');
      qc.invalidateQueries({ queryKey: ['lessonPlans'] });
      handleCloseForm();
    },
    onError: (err) => toast.error('Failed to update lesson plan', err.message),
  });

  const deleteMut = useMutation({
    mutationFn: curriculumApi.deleteLessonPlan,
    onSuccess: () => {
      toast.success('Lesson plan deleted');
      qc.invalidateQueries({ queryKey: ['lessonPlans'] });
    },
    onError: (err) => toast.error('Failed to delete lesson plan', err.message),
  });

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPlan(null);
    reset({ status: 'DRAFT', durationMinutes: 30, title: '', classroomId: '', curriculumAreaId: '', milestoneId: '', scheduledDate: '', objectives: '', instructions: '', notes: '', materialIds: [] });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    reset({
      ...plan,
      scheduledDate: plan.scheduledDate ? new Date(plan.scheduledDate).toISOString().split('T')[0] : '',
      durationMinutes: plan.durationMinutes || 30,
      milestoneId: plan.milestoneId || '',
      materialIds: plan.materials?.map(m => m.material.id) || [],
    });
    setShowForm(true);
  };

  const onSubmit = (data) => {
    if (!globalAcademicYearId) {
      toast.error('No academic year selected. Please select an academic year from the top bar first.');
      return;
    }
    const payload = {
      ...data,
      academicYearId: globalAcademicYearId,
      durationMinutes: data.durationMinutes && !isNaN(data.durationMinutes) ? Number(data.durationMinutes) : null,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
      milestoneId: data.milestoneId || null,
    };
    if (selectedPlan) {
      updateMut.mutate({ id: selectedPlan.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-success/15 text-success border-success/30';
      case 'COMPLETED': return 'bg-info/15 text-info border-info/30';
      case 'ARCHIVED': return 'bg-border text-muted border-border';
      default: return 'bg-warning/15 text-warning border-warning/30'; // DRAFT
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink tracking-tight">Daily Lesson Plans</h1>
          <p className="text-sm text-muted mt-1">Manage and schedule curriculum activities for your classrooms.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm">
          <Plus size={16} /> Add Lesson Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [0, 1, 2].map(i => <SkeletonCard key={i} />)
        ) : (Array.isArray(lessonPlans) ? lessonPlans : lessonPlans?.data || [])?.length === 0 ? (
          <div className="col-span-full card py-16 text-center flex flex-col items-center">
            <BookOpen size={48} className="text-border mb-4" />
            <h3 className="text-lg font-bold text-ink">No lesson plans found</h3>
            <p className="text-muted mt-1 max-w-sm">You haven't created any daily lesson plans yet. Start scheduling activities for your classrooms.</p>
            <button onClick={() => setShowForm(true)} className="mt-6 px-4 py-2 bg-secondary text-ink rounded-lg text-sm font-semibold hover:bg-secondary-dark transition-colors">
              Create First Lesson Plan
            </button>
          </div>
        ) : (
          (Array.isArray(lessonPlans) ? lessonPlans : lessonPlans?.data || []).map(plan => (
            <div key={plan.id} className="card hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(plan)} className="p-1.5 text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors"><Edit2 size={14}/></button>
                  <button onClick={() => deleteMut.mutate(plan.id)} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
              <h3 className="font-display font-bold text-ink text-lg line-clamp-2 leading-tight">{plan.title}</h3>
              <div className="flex flex-col gap-0.5 mt-1 mb-4">
                <p className="text-sm text-primary font-medium">{plan.curriculumArea?.name || 'General Area'}</p>
                <p className="text-xs text-muted font-medium">{plan.classroom?.name || 'No Classroom Assigned'}</p>
              </div>
              
              <div className="mt-auto space-y-2 pt-4 border-t border-border">
                <div className="flex items-center text-xs text-muted">
                  <Calendar size={14} className="mr-2 opacity-70" />
                  {plan.scheduledDate ? format(new Date(plan.scheduledDate), 'MMM d, yyyy') : 'Unscheduled'}
                </div>
                <div className="flex items-center text-xs text-muted">
                  <Clock size={14} className="mr-2 opacity-70" />
                  {plan.durationMinutes ? `${plan.durationMinutes} mins` : 'Flexible duration'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold font-display text-ink">{selectedPlan ? 'Edit Lesson Plan' : 'New Lesson Plan'}</h2>
              <button onClick={handleCloseForm} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface focusable">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <form id="lessonPlanForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Lesson Title *</label>
                  <input {...register('title')} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Introduction to Decimal System" />
                  {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1">Classroom *</label>
                    <select {...register('classroomId')} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                      <option value="">Select Classroom</option>
                      {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.classroomId && <p className="text-danger text-xs mt-1">{errors.classroomId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1">Curriculum Area *</label>
                    <select 
                      {...register('curriculumAreaId')} 
                      disabled={!selectedFormClassroomId}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{selectedFormClassroomId ? 'Select Area' : 'Select Classroom First'}</option>
                      {formAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    {errors.curriculumAreaId && <p className="text-danger text-xs mt-1">{errors.curriculumAreaId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1">Target Milestone</label>
                    <select 
                      {...register('milestoneId')} 
                      disabled={!selectedFormAreaId || formMilestones.length === 0}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedFormAreaId ? 'Select Curriculum Area First' : (formMilestones.length === 0 ? 'No milestones in this area' : 'None / General')}
                      </option>
                      {formMilestones.map(m => <option key={m.id} value={m.id}>{m.title} ({m.ageGroupMin}-{m.ageGroupMax}y)</option>)}
                    </select>
                    {errors.milestoneId && <p className="text-danger text-xs mt-1">{errors.milestoneId.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Materials Required</label>
                  <div className="p-3 rounded-xl border border-border bg-bg/50 max-h-40 overflow-y-auto">
                    {materialsList?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {materialsList.map(m => (
                          <label key={m.id} className="flex items-start gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              value={m.id}
                              {...register('materialIds')}
                              className="mt-1 border-border text-primary rounded focus:ring-primary focus:ring-offset-0 bg-white"
                            />
                            <span className="text-sm text-ink group-hover:text-primary transition-colors line-clamp-1">{m.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted text-center py-2">No materials found in inventory.</p>
                    )}
                  </div>
                  {errors.materialIds && <p className="text-danger text-xs mt-1">{errors.materialIds.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1">Date</label>
                    <input type="date" {...register('scheduledDate')} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1">Duration (Mins)</label>
                    <input type="number" {...register('durationMinutes', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="30" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Objectives</label>
                  <textarea {...register('objectives')} rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="What should the students learn?" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Instructions / Presentation</label>
                  <textarea {...register('instructions')} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Step-by-step presentation guide" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published / Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border bg-bg/50 flex justify-end gap-3">
              <button type="button" onClick={handleCloseForm} className="px-5 py-2 text-sm font-semibold text-muted hover:text-ink hover:bg-surface rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="lessonPlanForm" disabled={createMut.isPending || updateMut.isPending} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50">
                {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Lesson Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
