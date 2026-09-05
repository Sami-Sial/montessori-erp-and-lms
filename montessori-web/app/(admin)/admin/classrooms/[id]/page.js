'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { classroomsApi } from '../../../../../lib/api/classrooms';
import { studentsApi } from '../../../../../lib/api/students';
import { hrApi } from '../../../../../lib/api/hr';
import { SkeletonCard } from '../../../../../components/shared/Skeleton';
import { useToast } from '../../../../../lib/hooks/useToast';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, ChevronRight, UserCheck, UserX, Trash2, Edit2, X, Briefcase, GraduationCap } from 'lucide-react';

function StatusBadge({ isActive }) {
  return (
    <span className={`badge-chip ${isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function ClassroomDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const router = useRouter();

  const [confirmAction, setConfirmAction] = useState(null);
  
  // Edit Modal State
  const [modalMode, setModalMode] = useState(null); // 'edit' or null
  const [activeModalTab, setActiveModalTab] = useState('details');
  const [formData, setFormData] = useState({ name: '', ageGroupMin: '', ageGroupMax: '', capacity: '', roomNumber: '' });
  const [confirmDeleteClassroom, setConfirmDeleteClassroom] = useState(false);

  const { data: classroom, isLoading } = useQuery({
    queryKey: ['classrooms', id],
    queryFn: () => classroomsApi.get(id),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => studentsApi.list({ pageSize: 100, status: 'active', unenrolledOnly: true }),
    enabled: modalMode === 'edit',
  });
  const allStudents = studentsData?.data ?? [];

  const { data: staffData } = useQuery({
    queryKey: ['staff-all'],
    queryFn: () => hrApi.listStaff({ pageSize: 100 }),
    enabled: modalMode === 'edit',
  });
  const allStaff = staffData?.data ?? [];

  const deleteMut = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      toast.success('Student deleted');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to delete student', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    onSuccess: () => {
      toast.success('Student status updated');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to update student', err.message),
  });

  const updateClassroomMut = useMutation({
    mutationFn: ({ id, data }) => classroomsApi.update(id, data),
    onSuccess: () => {
      toast.success('Classroom updated successfully');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to update classroom', err.message),
  });

  const deleteClassroomMut = useMutation({
    mutationFn: classroomsApi.delete,
    onSuccess: () => {
      toast.success('Classroom deleted');
      router.push('/admin/classrooms');
    },
    onError: (err) => toast.error('Failed to delete classroom', err.message),
  });

  const enrollMut = useMutation({
    mutationFn: ({ studentId }) => classroomsApi.enrollStudent(id, studentId),
    onSuccess: () => {
      toast.success('Student enrolled');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to enroll student', err.message),
  });

  const unenrollMut = useMutation({
    mutationFn: ({ studentId }) => classroomsApi.unenrollStudent(id, studentId),
    onSuccess: () => {
      toast.success('Student removed from classroom');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to remove student', err.message),
  });

  const assignStaffMut = useMutation({
    mutationFn: ({ staffId }) => classroomsApi.assignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Staff assigned');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to assign staff', err.message),
  });

  const unassignStaffMut = useMutation({
    mutationFn: ({ staffId }) => classroomsApi.unassignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Staff removed from classroom');
      qc.invalidateQueries({ queryKey: ['classrooms', id] });
    },
    onError: (err) => toast.error('Failed to remove staff', err.message),
  });

  const handleDeleteClick = (student) => setConfirmAction({ type: 'delete', student });
  const handleToggleStatusClick = (student) => setConfirmAction({ type: 'toggleStatus', student });

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') {
      deleteMut.mutate(confirmAction.student.id);
    } else if (confirmAction.type === 'toggleStatus') {
      updateMut.mutate({ id: confirmAction.student.id, data: { isActive: !confirmAction.student.isActive } });
    }
    setConfirmAction(null);
  };

  const openEditModal = () => {
    setFormData({
      name: classroom.name,
      ageGroupMin: classroom.ageGroupMin,
      ageGroupMax: classroom.ageGroupMax,
      capacity: classroom.capacity,
      roomNumber: classroom.roomNumber || '',
    });
    setModalMode('edit');
  };

  const handleClassroomSubmit = (e) => {
    e.preventDefault();
    updateClassroomMut.mutate({
      id: classroom.id,
      data: {
        ...formData,
        ageGroupMin: Number(formData.ageGroupMin),
        ageGroupMax: Number(formData.ageGroupMax),
        capacity: Number(formData.capacity),
      },
    });
  };

  const handleEnroll = (e) => {
    const studentId = e.target.value;
    if (!studentId) return;
    enrollMut.mutate({ studentId });
    e.target.value = '';
  };

  const handleAssignStaff = (e) => {
    const staffId = e.target.value;
    if (!staffId) return;
    assignStaffMut.mutate({ staffId });
    e.target.value = '';
  };

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (!classroom) return <p className="text-muted">Classroom not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/classrooms" className="text-muted hover:text-ink focusable">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{classroom.name}</h1>
            <p className="text-muted text-sm mt-0.5">
              {classroom.ageGroupMin}–{classroom.ageGroupMax} years · {classroom.branch?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openEditModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-ink hover:bg-bg focusable">
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => setConfirmDeleteClassroom(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-danger/30 text-sm text-danger hover:bg-danger/10 focusable">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Building2 size={16} className="text-muted" /> Details
          </h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Capacity</span>
              <span className="font-medium">{classroom.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Room Number</span>
              <span className="font-medium">{classroom.roomNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Academic Year</span>
              <span className="font-medium">{classroom.academicYear?.name}</span>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Users size={16} className="text-muted" /> Staff
          </h2>
          {classroom.staffAssignments?.length === 0 && <p className="text-sm text-muted">No staff assigned</p>}
          <div className="space-y-3">
            {classroom.staffAssignments?.map(({ staff, isPrimary }) => (
              <div key={staff.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-semibold">
                  {staff.user?.firstName?.[0]}{staff.user?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    {staff.user?.firstName} {staff.user?.lastName}
                    {isPrimary && <span className="ml-2 text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">Lead</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
          <Users size={16} className="text-muted" /> Enrolled Students ({classroom.enrollments?.length || 0})
        </h2>
        {classroom.enrollments?.length === 0 ? (
          <p className="text-sm text-muted">No students enrolled</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg text-muted font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Student</th>
                  <th className="px-4 py-3">Student #</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classroom.enrollments?.map(({ student }) => {
                  const ageYears = student.dateOfBirth ? Math.floor((Date.now() - new Date(student.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : '—';
                  const guardian = student.guardians?.[0]?.guardian;
                  return (
                    <tr key={student.id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" aria-hidden="true" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" aria-hidden="true">
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </div>
                          )}
                          <span className="font-medium text-ink">{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted text-xs">{student.studentNumber}</td>
                      <td className="px-4 py-3 text-muted">{ageYears}y</td>
                      <td className="px-4 py-3 text-muted">{guardian ? `${guardian.firstName} ${guardian.lastName}` : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge isActive={student.isActive} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/students/${student.id}`}
                            className="p-1.5 text-muted hover:text-primary transition-colors focusable rounded-lg hover:bg-primary/10" aria-label="View">
                            <ChevronRight size={16} />
                          </Link>
                          <button onClick={() => handleToggleStatusClick(student)} className={`p-1.5 transition-colors focusable rounded-lg ${student.isActive ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`} aria-label={student.isActive ? 'Deactivate' : 'Activate'} title={student.isActive ? 'Deactivate' : 'Activate'}>
                            {student.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button onClick={() => handleDeleteClick(student)} className="p-1.5 text-muted hover:text-danger transition-colors focusable rounded-lg hover:bg-danger/10" aria-label="Delete" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-5">
            <h3 className="text-lg font-bold text-ink mb-2">
              {confirmAction.type === 'delete' ? 'Delete Student' : confirmAction.student.isActive ? 'Deactivate Student' : 'Activate Student'}
            </h3>
            <p className="text-sm text-muted mb-6">
              {confirmAction.type === 'delete' 
                ? `Are you sure you want to delete ${confirmAction.student.firstName} ${confirmAction.student.lastName}? This action cannot be undone.` 
                : `Are you sure you want to ${confirmAction.student.isActive ? 'deactivate' : 'activate'} ${confirmAction.student.firstName} ${confirmAction.student.lastName}?`}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-bg transition-colors">
                Cancel
              </button>
              <button onClick={executeConfirmAction} className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${confirmAction.type === 'delete' ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-dark'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Delete Modal */}
      {confirmDeleteClassroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-5">
            <h3 className="text-lg font-bold text-ink mb-2">Delete Classroom</h3>
            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete {classroom.name}? This will mark it as deleted and unassign any staff. Students will remain but will be unenrolled.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteClassroom(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-bg transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteClassroomMut.mutate(classroom.id)} disabled={deleteClassroomMut.isPending} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Classroom Modal */}
      {modalMode === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col min-h-[85vh] max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold text-ink">Edit Classroom</h2>
              <button onClick={() => setModalMode(null)} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface focusable">
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

            <form onSubmit={handleClassroomSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {activeModalTab === 'details' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div>
                      <label className="block text-sm font-medium mb-1">Classroom Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Early Years A" />
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
                      <select onChange={handleAssignStaff} defaultValue="" disabled={assignStaffMut.isPending} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="" disabled>Select staff to assign...</option>
                        {allStaff
                          .filter(s => s.user?.role === 'TEACHER')
                          .filter(s => !classroom.staffAssignments?.find(sa => sa.staff.id === s.id))
                          .map(s => (
                          <option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName}</option>
                        ))}
                      </select>
                      
                      <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1">
                        {classroom.staffAssignments?.length === 0 ? <div className="p-2 text-sm text-muted border border-dashed border-border rounded-lg text-center">No teacher assigned</div> : (
                          classroom.staffAssignments?.map(({ staff, isPrimary }) => (
                            <div key={staff.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                              <span className="text-sm font-medium text-ink flex items-center gap-2">
                                {staff.user?.firstName} {staff.user?.lastName}
                                {isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider">Lead</span>}
                              </span>
                              <button type="button" onClick={() => unassignStaffMut.mutate({ staffId: staff.id })} disabled={unassignStaffMut.isPending} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 border-l border-border pl-6">
                      <h3 className="text-sm font-bold text-ink flex items-center gap-2"><GraduationCap size={16}/> Enroll Students</h3>
                      <select onChange={handleEnroll} defaultValue="" disabled={enrollMut.isPending} className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="" disabled>Select a student to enroll...</option>
                        {allStudents
                          .filter(s => !classroom.enrollments?.find(e => e.student.id === s.id))
                          .map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentNumber})</option>
                        ))}
                      </select>
                      
                      <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1">
                        {classroom.enrollments?.length === 0 ? <div className="p-2 text-sm text-muted border border-dashed border-border rounded-lg text-center">No students enrolled</div> : (
                          classroom.enrollments?.map(({ student }) => (
                            <div key={student.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg/50 animate-in fade-in zoom-in-95 duration-150">
                              <span className="text-sm font-medium text-ink">{student.firstName} {student.lastName}</span>
                              <button type="button" onClick={() => unenrollMut.mutate({ studentId: student.id })} disabled={unenrollMut.isPending} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable"><X size={14} /></button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-bg flex justify-end gap-3">
                <button type="button" onClick={() => setModalMode(null)} className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-surface border border-border transition-colors">Cancel</button>
                {activeModalTab === 'details' && (
                  <button type="button" onClick={() => setActiveModalTab('assignments')} className="px-5 py-2 bg-secondary text-ink text-sm font-medium rounded-lg hover:bg-secondary-dark transition-colors">
                    Next: Assignments
                  </button>
                )}
                {activeModalTab === 'assignments' && (
                  <button type="submit" disabled={updateClassroomMut.isPending} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    Save Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
