'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../../../../lib/api/hr';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { CheckCircle2, XCircle, Users, ClipboardCheck, DollarSign, Clock, Plus, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const LEAVE_CHIP = {
  PENDING:  'bg-warning/10 text-warning',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-danger/10 text-danger',
};

export default function AdminStaffPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState('staff');
  
  // Modals state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form states
  const [staffForm, setStaffForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'TEACHER', 
    employeeNumber: '', jobTitle: '', employmentType: 'FULL_TIME', 
    startDate: '', salary: '', currency: 'USD'
  });

  // Queries
  const { data: staffData, isLoading: loadingStaff } = useQuery({
    queryKey: ['hr', 'staff'],
    queryFn: () => hrApi.listStaff({ pageSize: 50 }),
  });

  const { data: leaveData, isLoading: loadingLeave } = useQuery({
    queryKey: ['hr', 'leave'],
    queryFn: () => hrApi.listLeave({ pageSize: 30 }),
    enabled: tab === 'leave',
  });

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list(),
  });

  // Mutations
  const createStaffMut = useMutation({
    mutationFn: hrApi.createStaff,
    onSuccess: () => {
      toast.success('Staff created & email sent');
      setStaffModalOpen(false);
      qc.invalidateQueries({ queryKey: ['hr', 'staff'] });
    },
    onError: (err) => toast.error('Failed to create staff', err.message),
  });

  const updateStaffMut = useMutation({
    mutationFn: ({ id, data }) => hrApi.updateStaff(id, data),
    onSuccess: () => {
      toast.success('Staff updated');
      qc.invalidateQueries({ queryKey: ['hr', 'staff'] });
    },
    onError: (err) => toast.error('Failed to update staff', err.message),
  });

  const assignStaffClassroomMut = useMutation({
    mutationFn: ({ id, staffId }) => classroomsApi.assignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Assigned to classroom');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
      qc.invalidateQueries({ queryKey: ['hr', 'staff'] });
    },
    onError: (err) => toast.error('Failed to assign classroom', err.message),
  });

  const unassignStaffClassroomMut = useMutation({
    mutationFn: ({ id, staffId }) => classroomsApi.unassignStaff(id, staffId),
    onSuccess: () => {
      toast.success('Removed from classroom');
      qc.invalidateQueries({ queryKey: ['classrooms'] });
      qc.invalidateQueries({ queryKey: ['hr', 'staff'] });
    },
    onError: (err) => toast.error('Failed to remove classroom', err.message),
  });

  const decideMut = useMutation({
    mutationFn: ({ id, status }) => hrApi.decideLeave(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['hr', 'leave'] });
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  // Handlers
  const openAddStaff = () => {
    setStaffForm({
      firstName: '', lastName: '', email: '', phone: '', role: 'TEACHER', 
      employeeNumber: `EMP-${Math.floor(Math.random()*10000)}`, jobTitle: '', employmentType: 'FULL_TIME', 
      startDate: new Date().toISOString().split('T')[0], salary: '', currency: 'USD'
    });
    setSelectedStaff(null);
    setStaffModalOpen(true);
  };

  const openEditStaff = (staff) => {
    setStaffForm({
      firstName: staff.user?.firstName || '', lastName: staff.user?.lastName || '', email: staff.user?.email || '', phone: staff.user?.phone || '', role: staff.user?.role || 'TEACHER',
      employeeNumber: staff.employeeNumber, jobTitle: staff.jobTitle, employmentType: staff.employmentType, 
      startDate: new Date(staff.startDate).toISOString().split('T')[0], salary: staff.salary || '', currency: staff.currency
    });
    setSelectedStaff(staff);
    setStaffModalOpen(true);
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    const payload = { ...staffForm, salary: staffForm.salary ? Number(staffForm.salary) : null };
    if (selectedStaff) {
      // For updates, we usually don't update user fields from the staff endpoint directly in this demo, but let's assume it patches staff.
      updateStaffMut.mutate({ id: selectedStaff.id, data: { jobTitle: payload.jobTitle, salary: payload.salary, employmentType: payload.employmentType } });
    } else {
      createStaffMut.mutate(payload);
    }
  };

  const handlePayrollSubmit = (e) => {
    e.preventDefault();
    createPayrollMut.mutate({
      ...payrollForm,
      month: Number(payrollForm.month), year: Number(payrollForm.year),
      baseSalary: Number(payrollForm.baseSalary), allowances: Number(payrollForm.allowances), deductions: Number(payrollForm.deductions)
    });
  };

  const TABS = [
    { key: 'staff',   label: 'Staff Members', icon: Users },
    { key: 'leave',   label: 'Leave Requests', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Staff & HR</h1>
          <p className="text-muted text-sm mt-0.5">Manage staff, leave requests and payroll</p>
        </div>
        {tab === 'staff' && (
          <button onClick={openAddStaff} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Add Staff
          </button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted uppercase tracking-wide">Total staff</p>
          <p className="font-display text-3xl font-bold text-ink mt-1">{staffData?.pagination?.total ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted uppercase tracking-wide">Pending leave</p>
          <p className="font-display text-3xl font-bold text-warning mt-1">
            {leaveData?.data?.filter(l => l.status === 'PENDING').length ?? '—'}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted uppercase tracking-wide">Active roles</p>
          <p className="font-display text-3xl font-bold text-ink mt-1">
            {new Set(staffData?.data?.map(s => s.jobTitle)).size ?? '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} role="tab" aria-selected={tab === key}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focusable ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Staff list */}
      {tab === 'staff' && (
        <div className="card overflow-hidden p-0">
          {loadingStaff ? <div className="p-4"><SkeletonTable rows={6} cols={6} /></div> : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Name', 'Job Title', 'Salary', 'Type', 'Since', 'Actions'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffData?.data?.map(s => (
                  <tr key={s.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{s.user?.firstName} {s.user?.lastName}</p>
                          <p className="text-xs text-muted">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.user?.userRoles?.[0]?.role?.name?.replace(/_/g, ' ') || s.jobTitle}
                    </td>
                    <td className="px-4 py-3 text-muted">{s.salary ? `${s.currency} ${Number(s.salary).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3"><span className="badge-chip bg-info/10 text-info text-xs">{s.employmentType}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{format(new Date(s.startDate), 'MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEditStaff(s)} className="p-1.5 text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors focusable" title="Edit Staff">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Leave requests */}
      {tab === 'leave' && (
        <div className="space-y-3">
          {loadingLeave ? <SkeletonTable rows={5} cols={4} /> :
           leaveData?.data?.length === 0 ? (
            <div className="card text-center py-10 text-muted text-sm">No leave requests</div>
          ) : leaveData?.data?.map(lr => (
            <div key={lr.id} className="card flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-ink text-sm">{lr.staff?.user?.firstName} {lr.staff?.user?.lastName}</p>
                  <span className="badge-chip bg-info/10 text-info text-xs">{lr.leaveType}</span>
                  <span className={`badge-chip text-xs ${LEAVE_CHIP[lr.status]}`}>{lr.status}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {format(new Date(lr.startDate), 'MMM d')} – {format(new Date(lr.endDate), 'MMM d, yyyy')} · {lr.totalDays} days
                </p>
                {lr.reason && <p className="text-xs text-muted mt-0.5 italic">"{lr.reason}"</p>}
              </div>
              {lr.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => decideMut.mutate({ id: lr.id, status: 'APPROVED' })}
                    className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors focusable" aria-label="Approve">
                    <CheckCircle2 size={18} />
                  </button>
                  <button onClick={() => decideMut.mutate({ id: lr.id, status: 'REJECTED' })}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors focusable" aria-label="Reject">
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Staff Modal */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">{selectedStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
              <button onClick={() => setStaffModalOpen(false)} className="p-1 text-muted hover:text-ink rounded focusable"><X size={20}/></button>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${selectedStaff ? 'grid md:grid-cols-2' : ''}`}>
              <form onSubmit={handleStaffSubmit} className="p-4 space-y-4 border-r border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input required disabled={!!selectedStaff} type="text" value={staffForm.firstName} onChange={e=>setStaffForm({...staffForm, firstName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input required disabled={!!selectedStaff} type="text" value={staffForm.lastName} onChange={e=>setStaffForm({...staffForm, lastName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input required disabled={!!selectedStaff} type="email" value={staffForm.email} onChange={e=>setStaffForm({...staffForm, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input disabled={!!selectedStaff} type="tel" value={staffForm.phone} onChange={e=>setStaffForm({...staffForm, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                </div>

                {!selectedStaff && (
                  <div>
                    <label className="block text-sm font-medium mb-1">System Role</label>
                    <select value={staffForm.role} onChange={e=>setStaffForm({...staffForm, role: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="TEACHER">Teacher</option>
                      <option value="HR_STAFF">HR Staff</option>
                      <option value="FINANCE_STAFF">Finance Staff</option>
                      <option value="ADMIN">Admin</option>
                      <option value="FRONT_DESK">Front Desk</option>
                    </select>
                  </div>
                )}

                <hr className="border-border my-2" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee #</label>
                    <input required disabled={!!selectedStaff} type="text" value={staffForm.employeeNumber} onChange={e=>setStaffForm({...staffForm, employeeNumber: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <input required type="text" value={staffForm.jobTitle} onChange={e=>setStaffForm({...staffForm, jobTitle: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Lead Guide" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select value={staffForm.employmentType} onChange={e=>setStaffForm({...staffForm, employmentType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input required disabled={!!selectedStaff} type="date" value={staffForm.startDate} onChange={e=>setStaffForm({...staffForm, startDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Salary</label>
                    <input required type="number" min="0" value={staffForm.salary} onChange={e=>setStaffForm({...staffForm, salary: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 50000" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setStaffModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-bg transition-colors">Cancel</button>
                  <button type="submit" disabled={createStaffMut.isPending || updateStaffMut.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                    {selectedStaff ? 'Save Changes' : 'Create Staff & Send Email'}
                  </button>
                </div>
              </form>
              
              {selectedStaff && (
                <div className="p-4 bg-bg/30">
                  <h3 className="font-bold text-ink mb-4">Classroom Assignments</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Assign to Classroom</label>
                    <select 
                      onChange={(e) => {
                        if(e.target.value) {
                          assignStaffClassroomMut.mutate({ id: e.target.value, staffId: selectedStaff.id });
                          e.target.value = '';
                        }
                      }} 
                      defaultValue="" 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={assignStaffClassroomMut.isPending}
                    >
                      <option value="" disabled>Select classroom...</option>
                      {classroomsData?.filter(cls => !cls.staffAssignments?.find(sa => sa.staffId === selectedStaff.id)).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {classroomsData?.filter(cls => cls.staffAssignments?.find(sa => sa.staffId === selectedStaff.id)).length === 0 ? (
                      <p className="text-sm text-muted">Not assigned to any classrooms.</p>
                    ) : (
                      classroomsData?.filter(cls => cls.staffAssignments?.find(sa => sa.staffId === selectedStaff.id)).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
                          <div>
                            <p className="font-semibold text-sm text-ink">{c.name}</p>
                            <p className="text-xs text-muted">{c.branch?.name}</p>
                          </div>
                          <button onClick={() => unassignStaffClassroomMut.mutate({ id: c.id, staffId: selectedStaff.id })} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focusable" title="Remove Assignment">
                            <X size={16}/>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
