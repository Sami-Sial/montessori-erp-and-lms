'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicYearsApi } from '../../../../lib/api/academicYears';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { Calendar, Plus, X, Edit2 } from 'lucide-react';

export default function AdminAcademicYearsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  
  const [modalMode, setModalMode] = useState(null); // 'add' or 'edit'
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });

  const { data: academicYears, isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: () => academicYearsApi.list(),
  });

  const createMut = useMutation({
    mutationFn: academicYearsApi.create,
    onSuccess: () => {
      toast.success('Academic Year created successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['academicYears'] });
    },
    onError: (err) => toast.error('Failed to create academic year', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => academicYearsApi.update(id, data),
    onSuccess: () => {
      toast.success('Academic Year updated successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['academicYears'] });
    },
    onError: (err) => toast.error('Failed to update academic year', err.message),
  });

  const openAddModal = () => {
    setFormData({ name: '', startDate: '', endDate: '', isCurrent: false });
    setSelectedYear(null);
    setModalMode('add');
  };

  const openEditModal = (year) => {
    setFormData({
      name: year.name,
      startDate: new Date(year.startDate).toISOString().split('T')[0],
      endDate: new Date(year.endDate).toISOString().split('T')[0],
      isCurrent: year.isCurrent,
    });
    setSelectedYear(year);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedYear(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };
    if (modalMode === 'add') {
      createMut.mutate(payload);
    } else {
      updateMut.mutate({ id: selectedYear.id, data: payload });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Academic Years</h1>
          <p className="text-muted text-sm mt-0.5">Manage session years across your organization</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Add Session
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : academicYears?.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar size={40} className="text-border mx-auto mb-3" />
          <p className="text-muted">No academic years configured yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academicYears?.map((year) => (
            <div key={year.id} className={`card block relative ${year.isCurrent ? 'ring-2 ring-primary/50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-secondary" />
                </div>
                <div className="flex items-center gap-2">
                  {year.isCurrent && (
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                      Current Session
                    </span>
                  )}
                  <button onClick={() => openEditModal(year)} className="p-1.5 text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors focusable" title="Edit">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-bold text-ink text-lg">{year.name}</h3>
              <p className="text-muted text-sm mt-0.5 mb-3">
                {new Date(year.startDate).toLocaleDateString()} — {new Date(year.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Academic Year Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">{modalMode === 'edit' ? 'Edit Academic Year' : 'Add New Academic Year'}</h2>
              <button onClick={closeModal} className="p-1 text-muted hover:text-ink rounded focusable">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Session Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 2026-2027" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-bg rounded-lg border border-border">
                <input type="checkbox" id="isCurrent" checked={formData.isCurrent} onChange={e => setFormData({...formData, isCurrent: e.target.checked})} className="w-4 h-4 text-primary rounded border-border focus:ring-primary" />
                <label htmlFor="isCurrent" className="text-sm font-medium cursor-pointer">Set as Current Session</label>
              </div>
              <p className="text-xs text-muted">Setting this as the current session will automatically unset the previous current session.</p>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {modalMode === 'add' ? 'Create Session' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
