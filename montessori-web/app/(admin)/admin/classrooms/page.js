'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { studentsApi } from '../../../../lib/api/students';
import { hrApi } from '../../../../lib/api/hr';
import { curriculumApi } from '../../../../lib/api/curriculum';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { SearchableSelect } from '../../../../components/shared/SearchableSelect';
import { Building2, Users, Plus, X, Edit2, Trash2, GraduationCap, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminClassroomsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const router = useRouter();
  
  const [modalMode, setModalMode] = useState(null); // 'add' or 'edit'
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [formData, setFormData] = useState({ name: '', ageGroupMin: '', ageGroupMax: '', capacity: '', roomNumber: '', curriculumId: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [activeModalTab, setActiveModalTab] = useState('details');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list(),
  });

  const { data: curricula } = useQuery({
    queryKey: ['curricula-areas'],
    queryFn: () => curriculumApi.getAreas(),
  });

  const { data: classroomDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['classrooms', selectedClassroom?.id],
    queryFn: () => classroomsApi.get(selectedClassroom.id),
    enabled: modalMode === 'edit' && !!selectedClassroom,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => studentsApi.list({ pageSize: 100, status: 'active', unenrolledOnly: true }),
    enabled: !!modalMode,
  });
  const allStudents = studentsData?.data ?? [];

  const { data: staffData } = useQuery({
    queryKey: ['staff-all'],
    queryFn: () => hrApi.listStaff({ pageSize: 100 }),
    enabled: !!modalMode,
  });
  const allStaff = staffData?.data ?? [];

  const createMut = useMutation({
    mutationFn: classroomsApi.create,
    onSuccess: () => {
      toast.success('Classroom created successfully');
      closeModal();
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to create classroom', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => classroomsApi.update(id, data),
    onSuccess: () => {
      toast.success('Classroom updated successfully');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to update classroom', err.message),
  });

  const deleteMut = useMutation({
    mutationFn: classroomsApi.delete,
    onSuccess: () => {
      toast.success('Classroom deleted');
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to delete classroom', err.message),
  });

  const enrollMut = useMutation({
    mutationFn: ({ id, studentId }) => classroomsApi.enrollStudent(id, studentId),
    onSuccess: () => {
      toast.success('Student enrolled');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to enroll student', err.message),
  });

  const unenrollMut = useMutation({
    mutationFn: ({ id, studentId }) => classroomsApi.unenrollStudent(id, studentId),
    onSuccess: () => {
      toast.success('Student removed from classroom');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to remove student', err.message),
  });

  const assignStaffMut = useMutation({
    mutationFn: ({ id, staffId }) => classroomsApi.assignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Staff assigned');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to assign staff', err.message),
  });

  const unassignStaffMut = useMutation({
    mutationFn: ({ id, staffId }) => classroomsApi.unassignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Staff removed from classroom');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
    },
    onError: (err) => toast.error('Failed to remove staff', err.message),
  });

  const openAddModal = () => {
    setFormData({ name: '', ageGroupMin: '', ageGroupMax: '', capacity: '', roomNumber: '', curriculumId: '' });
    setSelectedClassroom(null);
    setSelectedStudentIds([]);
    setSelectedStaffIds([]);
    setModalMode('add');
  };

  const openEditModal = (cls, e) => {
    e.stopPropagation();
    setFormData({
      name: cls.name,
      ageGroupMin: cls.ageGroupMin,
      ageGroupMax: cls.ageGroupMax,
      capacity: cls.capacity,
      roomNumber: cls.roomNumber || '',
      curriculumId: cls.curriculumId || '',
    });
    setSelectedClassroom(cls);
    setModalMode('edit');
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    if (val) {
      const [min, max] = val.split('-');
      setFormData(prev => ({ ...prev, ageGroupMin: min, ageGroupMax: max }));
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedClassroom(null);
  };

  const handleDeleteClick = (cls, e) => {
    e.stopPropagation();
    setConfirmDelete(cls);
  };

  const handleCardClick = (id) => {
    router.push(`/admin/classrooms/${id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ageGroupMin: Number(formData.ageGroupMin),
      ageGroupMax: Number(formData.ageGroupMax),
      capacity: Number(formData.capacity),
    };
    if (modalMode === 'add') {
      createMut.mutate({ ...payload, studentIds: selectedStudentIds, staffIds: selectedStaffIds });
    } else {
      updateMut.mutate({ id: selectedClassroom.id, data: payload });
    }
  };

  const handleEnroll = (studentId) => {
    if (!studentId) return;
    if (modalMode === 'add') {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      enrollMut.mutate({ id: selectedClassroom.id, studentId });
    }
  };

  const handleAssignStaff = (staffId) => {
    if (!staffId) return;
    if (modalMode === 'add') {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      assignStaffMut.mutate({ id: selectedClassroom.id, staffId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Classrooms</h1>
          <p className="text-muted text-sm mt-0.5">All classrooms across your branches</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Add classroom
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : classrooms?.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 size={40} className="text-border mx-auto mb-3" />
          <p className="text-muted">No classrooms yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms?.map((cls) => (
            <div onClick={() => handleCardClick(cls.id)} key={cls.id} className="card hover:shadow-md transition-shadow group cursor-pointer block relative">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <Building2 size={20} className="text-secondary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-mono bg-bg px-2 py-0.5 rounded-lg">
                    {cls.roomNumber ?? '—'}
                  </span>
                  <button onClick={(e) => openEditModal(cls, e)} className="p-1.5 text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors focusable" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => handleDeleteClick(cls, e)} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-bold text-ink text-lg">{cls.name}</h3>
              <p className="text-muted text-sm mt-0.5 mb-3">
                {cls.ageGroupMin}–{cls.ageGroupMax} years · {cls.branch?.name}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Users size={14} />
                  <span>
                    {cls._count?.enrollments ?? 0} / {cls.capacity} students
                  </span>
                </div>
                <div className="w-full max-w-[80px] h-1.5 bg-border rounded-full overflow-hidden ml-3">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${Math.min(((cls._count?.enrollments ?? 0) / cls.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {cls.staffAssignments?.[0] && (
                <p className="text-xs text-muted mt-3 pt-3 border-t border-border">
                  Lead: {cls.staffAssignments[0].staff?.user?.firstName} {cls.staffAssignments[0].staff?.user?.lastName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Classroom Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col min-h-[85vh] max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold text-ink">{modalMode === 'edit' ? 'Edit Classroom' : 'Add New Classroom'}</h2>
              <button onClick={closeModal} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface focusable">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-border px-4 pt-2 gap-4 bg-bg/50">
              <button 
                type="button" 
                onClick={() => setActiveModalTab('details')} 
                className={`py-3 text-sm font-semibold transition-colors border-b-2 ${activeModalTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
              >
                Class Details
              </button>
              <button 
                type="button" 
                onClick={() => setActiveModalTab('assignments')} 
                className={`py-3 text-sm font-semibold transition-colors border-b-2 ${activeModalTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}
              >
                Assignments
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {activeModalTab === 'details' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div>
                      <label className="block text-sm font-medium mb-1">Classroom Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Early Years A" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Montessori Environment Preset <span className="text-muted font-normal">(Optional)</span></label>
                      <select onChange={handlePresetChange} defaultValue="" className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Custom / Manual</option>
                        <option value="1.5-3">Toddler / Nido (1.5 – 3 years)</option>
                        <option value="3-6">Primary / Children's House (3 – 6 years)</option>
                        <option value="6-9">Lower Elementary (6 – 9 years)</option>
                        <option value="9-12">Upper Elementary (9 – 12 years)</option>
                        <option value="12-15">Adolescent (12 – 15 years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Curriculum Standard <span className="text-red-500">*</span></label>
                      <select required value={formData.curriculumId} onChange={e => setFormData({...formData, curriculumId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="" disabled>Select a curriculum standard</option>
                        {curricula?.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Min Age</label>
                        <input required type="number" step="0.1" min="0" max="18" value={formData.ageGroupMin} onChange={e => setFormData({...formData, ageGroupMin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Age</label>
                        <input required type="number" step="0.1" min="0" max="18" value={formData.ageGroupMax} onChange={e => setFormData({...formData, ageGroupMax: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Capacity</label>
                        <input required type="number" min="1" max="100" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 25" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Room Number <span className="text-muted font-normal">(Optional)</span></label>
                        <input type="text" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 101" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-ink flex items-center gap-2"><Briefcase size={16}/> Assign Lead Teacher</h3>
                      <SearchableSelect
                        placeholder="Search teachers to assign..."
                        disabled={assignStaffMut.isPending}
                        options={allStaff
                          .filter(s => s.user?.role === 'TEACHER')
                          .filter(s => modalMode === 'add' ? !selectedStaffIds.includes(s.id) : !classroomDetail?.staffAssignments?.find(sa => sa.staff.id === s.id))
                          .map(s => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName}` }))}
                        value=""
                        onChange={handleAssignStaff}
                      />
                      
                      <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1">
                        {modalMode === 'add' ? (
                          selectedStaffIds.map(id => {
                            const s = allStaff.find(x => x.id === id);
                            if(!s) return null;
                            return (
                              <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                                <span className="text-sm font-medium text-ink flex items-center gap-2">
                                  {s.user?.firstName} {s.user?.lastName}
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">Lead</span>
                                </span>
                                <button type="button" onClick={() => setSelectedStaffIds(prev => prev.filter(x => x !== id))} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                              </div>
                            )
                          })
                        ) : (
                          isLoadingDetail ? <div className="p-2 text-sm text-muted">Loading assignments...</div> : 
                          classroomDetail?.staffAssignments?.length === 0 ? <div className="p-2 text-sm text-muted border border-dashed border-border rounded-lg text-center">No teacher assigned</div> : (
                            classroomDetail?.staffAssignments?.map(({ staff, isPrimary }) => (
                              <div key={staff.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                                <span className="text-sm font-medium text-ink flex items-center gap-2">
                                  {staff.user?.firstName} {staff.user?.lastName}
                                  {isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">Lead</span>}
                                </span>
                                <button type="button" onClick={() => unassignStaffMut.mutate({ id: selectedClassroom.id, staffId: staff.id })} disabled={unassignStaffMut.isPending} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 border-l border-border pl-6">
                      <h3 className="text-sm font-bold text-ink flex items-center gap-2"><GraduationCap size={16}/> Enroll Students</h3>
                      <SearchableSelect
                        placeholder="Search students by name or number..."
                        disabled={enrollMut.isPending}
                        options={allStudents
                          .filter(s => modalMode === 'add' ? !selectedStudentIds.includes(s.id) : !classroomDetail?.enrollments?.find(e => e.student.id === s.id))
                          .map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.studentNumber})` }))}
                        value=""
                        onChange={handleEnroll}
                      />
                      
                      <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1">
                        {modalMode === 'add' ? (
                          selectedStudentIds.map(id => {
                            const s = allStudents.find(x => x.id === id);
                            if(!s) return null;
                            return (
                              <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                                <span className="text-sm font-medium text-ink">{s.firstName} {s.lastName}</span>
                                <button type="button" onClick={() => setSelectedStudentIds(prev => prev.filter(x => x !== id))} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                              </div>
                            )
                          })
                        ) : (
                          isLoadingDetail ? <div className="p-2 text-sm text-muted">Loading enrollments...</div> : 
                          classroomDetail?.enrollments?.length === 0 ? <div className="p-2 text-sm text-muted border border-dashed border-border rounded-lg text-center">No students enrolled</div> : (
                            classroomDetail?.enrollments?.map(({ student }) => (
                              <div key={student.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                                <span className="text-sm font-medium text-ink">{student.firstName} {student.lastName}</span>
                                <button type="button" onClick={() => unenrollMut.mutate({ id: selectedClassroom.id, studentId: student.id })} disabled={unenrollMut.isPending} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-bg flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-surface border border-border transition-colors">Cancel</button>
                {activeModalTab === 'details' && (
                  <button type="button" onClick={() => setActiveModalTab('assignments')} className="px-5 py-2 bg-secondary text-ink text-sm font-medium rounded-lg hover:bg-secondary-dark transition-colors">
                    Next: Assignments
                  </button>
                )}
                {activeModalTab === 'assignments' && (
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {modalMode === 'add' ? 'Complete & Save' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-5">
            <h3 className="text-lg font-bold text-ink mb-2">Delete Classroom</h3>
            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete {confirmDelete.name}? This will mark it as deleted and unassign any staff. Students will remain but will be unenrolled.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-bg transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteMut.mutate(confirmDelete.id)} disabled={deleteMut.isPending} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
