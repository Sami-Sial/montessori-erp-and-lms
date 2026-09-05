'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '../../../../lib/api/superadmin';
import { Users, Search, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

const ROLE_CHIP = {
  SUPER_ADMIN:   'bg-primary/10 text-primary',
  ORG_ADMIN:     'bg-secondary/10 text-secondary',
  TEACHER:       'bg-info/10 text-info',
  PARENT:        'bg-warning/10 text-warning',
  STUDENT:       'bg-accent/15 text-amber-700',
  FINANCE_STAFF: 'bg-muted/10 text-muted',
  HR_STAFF:      'bg-muted/8 text-muted',
  FRONT_DESK:    'bg-border text-muted',
};

const ALL_ROLES = ['SUPER_ADMIN','ORG_ADMIN','TEACHER','PARENT','STUDENT','FINANCE_STAFF','HR_STAFF','FRONT_DESK'];

export default function SuperAdminUsersPage() {
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage]           = useState(1);
  const toast = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, orgFilter, branchFilter]);

  // When org changes, reset branch filter
  useEffect(() => {
    setBranchFilter('');
  }, [orgFilter]);

  const { data: orgsData } = useQuery({ 
    queryKey: ['sa','orgs_list'], 
    queryFn: () => superAdminApi.listOrganizations({ pageSize: 100 }) // Fetch enough for dropdown
  });

  const { data: selectedOrg } = useQuery({
    queryKey: ['sa', 'org', orgFilter],
    queryFn: () => superAdminApi.getOrganization(orgFilter),
    enabled: !!orgFilter,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sa', 'users', page, debouncedSearch, roleFilter, orgFilter, branchFilter],
    queryFn: () => superAdminApi.listUsers({ 
      page, 
      pageSize: 30, 
      search: debouncedSearch || undefined,
      role: roleFilter || undefined,
      organizationId: orgFilter || undefined,
      }),
    keepPreviousData: true,
  });

  const toggleMut = useMutation({
    mutationFn: (id) => superAdminApi.toggleUser(id),
    onSuccess: (res) => {
      toast.success(`User ${res.isActive ? 'activated' : 'deactivated'}`);
      qc.invalidateQueries({ queryKey: ['sa','users'] });
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const allUsers = data?.data ?? [];
  const pagination = data?.pagination;
  const orgsList = orgsData?.data ?? [];
  const branchesList = selectedOrg?.branches ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">All Users</h1>
        <p className="text-muted text-sm mt-0.5">
          Every user across all organizations · {pagination?.total ?? '…'} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64" />
        </div>
        
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
        </select>

        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-[200px]">
          <option value="">All organizations</option>
          {orgsList.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        {orgFilter && branchesList.length > 0 && (
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-[200px]">
            <option value="">All branches</option>
            {branchesList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={8} cols={6} /></div>
        : allUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="text-border mx-auto mb-3" />
            <p className="text-muted text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['User','Email','Role','Organization','Status','Joined',''].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-ink">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map(r => (
                          <span key={r} className={`badge-chip text-xs ${ROLE_CHIP[r] ?? ROLE_CHIP.FRONT_DESK}`}>
                            {r.replace(/_/g,' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted text-sm">
                      {u.organizationName ?? <span className="badge-chip bg-primary/10 text-primary text-xs">Platform</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 size={13} />Active</span>
                        : <span className="flex items-center gap-1 text-xs text-danger"><XCircle size={13} />Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {u.createdAt ? formatDistanceToNow(new Date(u.createdAt), { addSuffix: true }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleMut.mutate(u.id)} disabled={toggleMut.isPending}
                        className={`p-1.5 rounded-lg transition-colors focusable ${u.isActive ? 'text-success hover:bg-success/10' : 'text-muted hover:bg-border'}`}
                        title={u.isActive ? 'Deactivate user' : 'Activate user'}>
                        {u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">Page {page} of {pagination.totalPages} · {pagination.total} total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page===1}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page>=pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
