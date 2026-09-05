"use client";
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curriculumApi } from '@/lib/api/curriculum';
import { classroomsApi } from '@/lib/api/classrooms';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronUp, Edit2, X, Check, Activity, Book, Search, Layers, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import clsx from 'clsx';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { LessonPlansView } from '@/components/shared/LessonPlansView';

// Map icons dynamically
const AREA_ICONS = {
  'Practical Life': '🤲',
  'Sensorial': '👁️',
  'Language': '💬',
  'Mathematics': '🔢',
  'Cultural Studies': '🌍',
  'Geometry': '📐',
  'Biology': '🌿',
  'History': '⏳',
  'Geography': '🗺️',
  'Occupations': '💼',
  'Humanities': '👥',
  'Sciences': '🧪',
  'Expression': '🎨',
  'Motor Skills': '🏃'
};

export default function AdminCurriculumPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('standards');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('ALL');
  const [expandedArea, setExpandedArea] = useState(null);

  const { data: classrooms, isLoading: loadingClassrooms } = useQuery({ 
    queryKey: ['classrooms'], 
    queryFn: () => classroomsApi.list() 
  });

  const { data: curricula, isLoading: loadingAreas } = useQuery({
    queryKey: ['curriculum', 'areas'],
    queryFn: () => curriculumApi.getAreas(),
  });

  const [showCurrForm, setShowCurrForm] = useState(false);
  const [currFormData, setCurrFormData] = useState({ name: '', description: '', targetAgeMin: 0, targetAgeMax: 6 });
  
  const createCurrMut = useMutation({
    mutationFn: curriculumApi.create,
    onSuccess: () => {
      toast.success('Curriculum created');
      qc.invalidateQueries({ queryKey: ['curriculum', 'areas'] });
      setShowCurrForm(false);
    },
    onError: (err) => toast.error('Failed to create curriculum', err.message)
  });

  const [showAreaForm, setShowAreaForm] = useState(false);
  const [areaFormData, setAreaFormData] = useState({ curriculumId: '', name: '', description: '', colorHex: '#4CAF50', iconName: 'Hand' });
  const createAreaMut = useMutation({
    mutationFn: curriculumApi.createArea,
    onSuccess: () => {
      toast.success('Area created');
      qc.invalidateQueries({ queryKey: ['curriculum', 'areas'] });
      setShowAreaForm(false);
    },
    onError: (err) => toast.error('Failed to create area', err.message)
  });

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneFormData, setMilestoneFormData] = useState({ areaId: '', title: '', description: '', ageGroupMin: 3, ageGroupMax: 6 });
  const createMilestoneMut = useMutation({
    mutationFn: (data) => curriculumApi.createMilestone(data.areaId, data),
    onSuccess: () => {
      toast.success('Milestone created');
      qc.invalidateQueries({ queryKey: ['curriculum', 'areas'] });
      setShowMilestoneForm(false);
    },
    onError: (err) => toast.error('Failed to create milestone', err.message)
  });

  const handleCreateCurr = (e) => {
    e.preventDefault();
    createCurrMut.mutate(currFormData);
  };

  // Filter logic
  const displayedCurricula = useMemo(() => {
    if (!curricula) return [];
    if (selectedCurriculumId === 'ALL') return curricula;
    return curricula.filter(c => c.id === selectedCurriculumId);
  }, [curricula, selectedCurriculumId]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex border-b border-border pb-0 gap-6">
        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'standards' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          Curriculum Standards
        </button>
        <button
          onClick={() => setActiveTab('lesson-plans')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'lesson-plans' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
        >
          Daily Lesson Plans
        </button>
      </div>

      {activeTab === 'standards' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink tracking-tight">Curriculum Standards</h1>
              <p className="text-sm text-muted mt-1">Manage learning areas and milestones across your organization.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCurrForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface text-ink border border-border rounded-lg text-sm font-medium hover:bg-bg focusable shadow-sm transition-all">
                <Plus size={16} /> Add Curriculum
              </button>
            </div>
          </div>

          {/* Classroom Filter */}
          <div className="bg-surface rounded-xl border border-border p-2 flex flex-wrap gap-2 shadow-sm items-center">
            <div className="px-3 py-1 flex items-center gap-2 text-muted border-r border-border mr-2">
              <Layers size={16} />
              <span className="text-sm font-medium">Filter View:</span>
            </div>
            <button
              onClick={() => setSelectedCurriculumId('ALL')}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all focusable",
                selectedCurriculumId === 'ALL' ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-bg hover:text-ink"
              )}
            >
              All Curricula
            </button>
            {loadingAreas ? <div className="h-8 w-24 bg-bg rounded-lg animate-pulse" /> : curricula?.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCurriculumId(c.id)}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all focusable flex items-center gap-2",
                  selectedCurriculumId === c.id ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-bg hover:text-ink"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Curriculum Display */}
          <div className="space-y-10 mt-6">
            {loadingAreas ? [0,1].map(i => <SkeletonCard key={i} className="h-64 rounded-2xl" />) : displayedCurricula.length === 0 ? (
              <div className="card text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center text-muted mb-4">
                  <Box size={32} />
                </div>
                <p className="text-ink font-medium mb-1">No curriculum found</p>
                <p className="text-sm text-muted">This classroom has no curriculum assigned, or none exist in the system.</p>
              </div>
            ) : (
              displayedCurricula.map((curriculum) => (
                <div key={curriculum.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                  
                  {/* Curriculum Header */}
                  <div className="bg-gradient-to-r from-bg to-surface p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-display text-xl font-bold text-ink">{curriculum.name}</h2>
                        {curriculum.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">Default</span>}
                      </div>
                      <p className="text-sm text-muted flex items-center gap-2">
                        <span className="font-medium bg-bg px-2 py-0.5 rounded text-ink/80 border border-border">Ages {curriculum.targetAgeMin} – {curriculum.targetAgeMax}</span>
                        {curriculum.description && <span>• {curriculum.description}</span>}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-ink">{curriculum.areas?.length ?? 0}</p>
                        <p className="text-xs text-muted font-medium uppercase tracking-wider">Learning Areas</p>
                      </div>
                      <button onClick={() => { setAreaFormData({...areaFormData, curriculumId: curriculum.id}); setShowAreaForm(true); }} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                        <Plus size={14} /> Add Area
                      </button>
                    </div>
                  </div>

                  {/* Areas Grid/List */}
                  <div className="p-4 sm:p-6 bg-surface/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {curriculum.areas?.map((area) => (
                        <div key={area.id} className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                          <button
                            onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
                            className="w-full text-left focusable relative"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: area.colorHex || '#ccc' }} />
                            <div className="p-5 pl-6 flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-opacity-10 shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${area.colorHex}15` }}>
                                {AREA_ICONS[area.name] ?? '📚'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-ink text-base truncate" style={{ color: area.colorHex }}>{area.name}</h3>
                                <p className="text-sm text-muted mt-0.5">{area.milestones?.length ?? 0} milestones</p>
                              </div>
                              <div className="pt-2">
                                {expandedArea === area.id ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted group-hover:text-ink transition-colors" />}
                              </div>
                            </div>
                          </button>
                          
                          {expandedArea === area.id && (
                            <div className="border-t border-border bg-bg/30 flex-1 flex flex-col">
                              {area.milestones?.length > 0 ? (
                                <ul className="divide-y divide-border/50 flex-1">
                                  {area.milestones.map((m) => (
                                    <li key={m.id} className="px-5 py-3 hover:bg-white transition-colors flex items-center justify-between gap-4">
                                      <span className="text-sm text-ink font-medium leading-tight">{m.title}</span>
                                      <span className="text-xs font-semibold text-muted bg-border/40 px-2 py-1 rounded whitespace-nowrap">
                                        {m.ageGroupMin}–{m.ageGroupMax}y
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="px-5 py-4 text-sm text-muted italic text-center flex-1">No milestones defined yet.</div>
                              )}
                              <div className="p-3 border-t border-border/50 bg-bg/50">
                                <button onClick={() => { setMilestoneFormData({...milestoneFormData, areaId: area.id}); setShowMilestoneForm(true); }} className="w-full py-1.5 rounded-lg border border-dashed border-border text-xs font-bold text-muted hover:text-ink hover:border-ink/30 transition-all flex items-center justify-center gap-1">
                                  <Plus size={14} /> Add Milestone
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Create Curriculum Modal */}
          {showCurrForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
              <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
                  <h2 className="font-display font-bold text-xl text-ink">Add New Curriculum</h2>
                  <button onClick={() => setShowCurrForm(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateCurr} className="flex flex-col">
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Name <span className="text-red-500">*</span></label>
                      <input required type="text" value={currFormData.name} onChange={e => setCurrFormData({...currFormData, name: e.target.value})} placeholder="e.g. Toddler Community" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Description</label>
                      <input type="text" value={currFormData.description} onChange={e => setCurrFormData({...currFormData, description: e.target.value})} placeholder="Optional description" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Min Age (Years)</label>
                        <input required type="number" step="0.1" value={currFormData.targetAgeMin} onChange={e => setCurrFormData({...currFormData, targetAgeMin: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Max Age (Years)</label>
                        <input required type="number" step="0.1" value={currFormData.targetAgeMax} onChange={e => setCurrFormData({...currFormData, targetAgeMax: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2 flex items-start gap-3">
                      <div className="text-primary mt-0.5"><Activity size={18} /></div>
                      <p className="text-xs text-primary/90 font-medium leading-relaxed">Standard areas (Practical Life, Sensorial, Language, Math, Culture) will be automatically provisioned for immediate use.</p>
                    </div>
                  </div>
                  <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCurrForm(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface focusable transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={createCurrMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 focusable transition-all shadow-sm">
                      {createCurrMut.isPending ? 'Creating...' : 'Create Curriculum'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Area Modal */}
          {showAreaForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
              <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
                  <h2 className="font-display font-bold text-xl text-ink">Add Learning Area</h2>
                  <button onClick={() => setShowAreaForm(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); createAreaMut.mutate(areaFormData); }} className="flex flex-col">
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Name <span className="text-red-500">*</span></label>
                      <input required type="text" value={areaFormData.name} onChange={e => setAreaFormData({...areaFormData, name: e.target.value})} placeholder="e.g. Practical Life" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Color Hex</label>
                      <input type="text" value={areaFormData.colorHex} onChange={e => setAreaFormData({...areaFormData, colorHex: e.target.value})} placeholder="#4CAF50" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                    </div>
                  </div>
                  <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAreaForm(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface focusable transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={createAreaMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 focusable transition-all shadow-sm">
                      {createAreaMut.isPending ? 'Creating...' : 'Create Area'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Milestone Modal */}
          {showMilestoneForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
              <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
                  <h2 className="font-display font-bold text-xl text-ink">Add Milestone</h2>
                  <button onClick={() => setShowMilestoneForm(false)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); createMilestoneMut.mutate(milestoneFormData); }} className="flex flex-col">
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Title <span className="text-red-500">*</span></label>
                      <input required type="text" value={milestoneFormData.title} onChange={e => setMilestoneFormData({...milestoneFormData, title: e.target.value})} placeholder="e.g. Pours water without spilling" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Min Age (Years)</label>
                        <input required type="number" step="0.1" value={milestoneFormData.ageGroupMin} onChange={e => setMilestoneFormData({...milestoneFormData, ageGroupMin: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Max Age (Years)</label>
                        <input required type="number" step="0.1" value={milestoneFormData.ageGroupMax} onChange={e => setMilestoneFormData({...milestoneFormData, ageGroupMax: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowMilestoneForm(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface focusable transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={createMilestoneMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 focusable transition-all shadow-sm">
                      {createMilestoneMut.isPending ? 'Creating...' : 'Create Milestone'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          <LessonPlansView />
        </div>
      )}
    </div>
  );
}
