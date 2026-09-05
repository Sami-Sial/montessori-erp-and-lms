"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { curriculumApi } from '../../../../lib/api/curriculum';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { ChevronDown, ChevronUp, Box } from 'lucide-react';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { LessonPlansView } from '../../../../components/shared/LessonPlansView';

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

export default function TeacherCurriculumPage() {
  const [activeTab, setActiveTab] = useState('standards');
  const [expandedArea, setExpandedArea] = useState(null);

  const { data: classrooms, isLoading: loadingClassrooms } = useQuery({ 
    queryKey: ['classrooms'], 
    queryFn: () => classroomsApi.list() 
  });

  const { data: curricula, isLoading: loadingAreas } = useQuery({
    queryKey: ['curriculum', 'areas'],
    queryFn: () => curriculumApi.getAreas(),
  });

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
              <p className="text-sm text-muted mt-1">View the learning areas and milestones assigned to your classrooms.</p>
            </div>
          </div>

          {/* Curriculum Display Per Classroom */}
          <div className="space-y-12 mt-6">
            {loadingAreas || loadingClassrooms ? [0,1].map(i => <SkeletonCard key={i} className="h-64 rounded-2xl" />) : classrooms?.length === 0 ? (
              <div className="card text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center text-muted mb-4">
                  <Box size={32} />
                </div>
                <p className="text-ink font-medium mb-1">No classrooms found</p>
                <p className="text-sm text-muted">You are not assigned to any classrooms yet.</p>
              </div>
            ) : (
              classrooms?.map((classroom) => {
                const curriculum = curricula?.find(c => c.id === classroom.curriculumId);

                return (
                  <div key={classroom.id} className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-primary border-b border-border pb-2">{classroom.name}</h2>
                    
                    {!curriculum ? (
                      <div className="bg-surface rounded-2xl border border-border py-8 text-center">
                        <p className="text-sm text-muted">No curriculum assigned to this classroom.</p>
                      </div>
                    ) : (
                      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                        
                        {/* Curriculum Header */}
                        <div className="bg-gradient-to-r from-bg to-surface p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-display text-lg font-bold text-ink">{curriculum.name}</h3>
                              {curriculum.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">Default</span>}
                            </div>
                            <p className="text-sm text-muted flex items-center gap-2">
                              <span className="font-medium bg-bg px-2 py-0.5 rounded text-ink/80 border border-border">Ages {curriculum.targetAgeMin} – {curriculum.targetAgeMax}</span>
                              {curriculum.description && <span>• {curriculum.description}</span>}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-display font-bold text-ink">{curriculum.areas?.length ?? 0}</p>
                            <p className="text-xs text-muted font-medium uppercase tracking-wider">Learning Areas</p>
                          </div>
                        </div>

                        {/* Areas Grid/List */}
                        <div className="p-4 sm:p-6 bg-surface/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {curriculum.areas?.map((area) => (
                              <div key={`${classroom.id}-${area.id}`} className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                <button
                                  onClick={() => setExpandedArea(expandedArea === `${classroom.id}-${area.id}` ? null : `${classroom.id}-${area.id}`)}
                                  className="w-full text-left focusable relative"
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: area.colorHex || '#ccc' }} />
                                  <div className="p-5 pl-6 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-opacity-10 shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${area.colorHex}15` }}>
                                      {AREA_ICONS[area.name] ?? '📚'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-ink text-base truncate" style={{ color: area.colorHex }}>{area.name}</h4>
                                      <p className="text-sm text-muted mt-0.5">{area.milestones?.length ?? 0} milestones</p>
                                    </div>
                                    <div className="pt-2">
                                      {expandedArea === `${classroom.id}-${area.id}` ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted group-hover:text-ink transition-colors" />}
                                    </div>
                                  </div>
                                </button>
                                
                                {expandedArea === `${classroom.id}-${area.id}` && (
                                  <div className="border-t border-border bg-bg/30">
                                    {area.milestones?.length > 0 ? (
                                      <ul className="divide-y divide-border/50">
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
                                      <div className="px-5 py-4 text-sm text-muted italic text-center">No milestones defined yet.</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          <LessonPlansView />
        </div>
      )}
    </div>
  );
}
