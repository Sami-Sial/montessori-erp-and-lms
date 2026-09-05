'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { studentsApi } from '../../../../lib/api/students';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { Search, Plus, ChevronRight, User, Edit2, PowerOff, Trash2, X, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

function StatusBadge({ isActive }) {
  return (
    <span className={`badge-chip ${isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function StudentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [classroomId, setClassroomId] = useState('');
  const [status, setStatus] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const sortBy = 'age';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', classroomId: '', admissionFeePaid: false });
  const [confirmAction, setConfirmAction] = useState(null);
  const globalAcademicYearId = useSelector((s) => s.ui.selectedAcademicYearId);

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, classroomId, status, sortBy, sortDir, globalAcademicYearId],
    queryFn: () => studentsApi.list({ 
      page, pageSize: 20, 
      search: search || undefined,
      classroomId: classroomId || undefined,
      status: status || undefined,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
      academicYearId: globalAcademicYearId || undefined,
    }),
    keepPreviousData: true,
  });

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list({ pageSize: 100 }),
  });
  const classrooms = Array.isArray(classroomsData) ? classroomsData : (classroomsData?.data ?? []);

  const deleteMut = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err) => toast.error('Delete failed', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err) => toast.error('Update failed', err.message),
  });

  const createMut = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => { 
      toast.success('Student added'); 
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', dateOfBirth: '', classroomId: '', admissionFeePaid: false });
      qc.invalidateQueries({ queryKey: ['students'] }); 
    },
    onError: (err) => toast.error('Failed to add student', err.message),
  });

  const students = data?.data ?? [];
  const pagination = data?.pagination;

  const handleDeleteClick = (student) => {
    setConfirmAction({ type: 'delete', student });
  };

  const handleToggleStatusClick = (student) => {
    setConfirmAction({ type: 'toggleStatus', student });
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') {
      deleteMut.mutate(confirmAction.student.id);
    } else if (confirmAction.type === 'toggleStatus') {
      updateMut.mutate({ id: confirmAction.student.id, data: { isActive: !confirmAction.student.isActive } });
    }
    setConfirmAction(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      joinedAcademicYearId: globalAcademicYearId,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-bold text-ink">{t('students.title')}</h1>
        <button onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors focusable">
          <Plus size={16} aria-hidden="true" /> {t('students.addStudent')}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={`${t('common.search')} students or guardians…`}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search students or guardians"
          />
        </div>
        <select value={classroomId} onChange={(e) => { setClassroomId(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Classrooms</option>
          {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); setPage(1); }} className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none hover:bg-bg transition-colors flex items-center justify-between" title="Toggle Age sort direction">
            <span>Sort by Age</span>
            <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} cols={6} /></div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <User size={40} className="text-border mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted text-sm">{search || classroomId || status ? 'No students match your filters' : t('students.noStudents')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Student', 'Number', 'Age', 'Classroom', 'Guardian', 'Status', 'Actions'].map((h) => (
                    <th key={h} scope="col" className={`px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => {
                  const ageYears = s.dateOfBirth ? Math.floor((Date.now() - new Date(s.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : '—';
                  const enrollment = s.enrollments?.[0];
                  const classroom = enrollment?.classroom?.name ?? '—';
                  const academicYear = enrollment?.academicYear?.name ?? '';
                  const classroomDisplay = academicYear ? `${classroom} (${academicYear})` : classroom;
                  const guardian = s.guardians?.[0]?.guardian;
                  return (
                    <tr key={s.id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" aria-hidden="true" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" aria-hidden="true">
                              {s.firstName?.[0]}{s.lastName?.[0]}
                            </div>
                          )}
                          <span className="font-medium text-ink">{s.firstName} {s.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted text-xs">{s.studentNumber}</td>
                      <td className="px-4 py-3 text-muted">{ageYears}y</td>
                      <td className="px-4 py-3 text-muted">{classroomDisplay}</td>
                      <td className="px-4 py-3 text-muted">
                        {guardian ? `${guardian.firstName} ${guardian.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge isActive={s.isActive} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/students/${s.id}`}
                            className="p-1.5 text-muted hover:text-primary transition-colors focusable rounded-lg hover:bg-primary/10" aria-label="View">
                            <ChevronRight size={16} />
                          </Link>
                          <button onClick={() => handleToggleStatusClick(s)} className={`p-1.5 transition-colors focusable rounded-lg ${s.isActive ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`} aria-label={s.isActive ? 'Deactivate' : 'Activate'} title={s.isActive ? 'Deactivate' : 'Activate'}>
                            {s.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button onClick={() => handleDeleteClick(s)} className="p-1.5 text-muted hover:text-danger transition-colors focusable rounded-lg hover:bg-danger/10" aria-label="Delete" title="Delete">
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">
              Showing {(page - 1) * pagination.pageSize + 1}–{Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-border text-sm text-muted hover:text-ink disabled:opacity-40 focusable">
                Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-border text-sm text-muted hover:text-ink disabled:opacity-40 focusable">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Add New Student</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted hover:text-ink rounded focusable">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 space-y-4 overflow-y-auto">
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
              <div>
                <label className="block text-sm font-medium mb-1">Classroom</label>
                <select required value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="" disabled>Select Classroom</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg mt-2">
                <input type="checkbox" id="admissionFee" checked={formData.admissionFeePaid} onChange={e => setFormData({...formData, admissionFeePaid: e.target.checked})} className="w-4 h-4 text-primary rounded border-border focus:ring-primary" />
                <label htmlFor="admissionFee" className="text-sm font-medium cursor-pointer">Admission Fee Collected</label>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
