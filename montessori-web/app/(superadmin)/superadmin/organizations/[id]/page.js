'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '../../../../../lib/api/superadmin';
import { SkeletonCard } from '../../../../../components/shared/Skeleton';
import {
  Building2, Users, GraduationCap, ArrowLeft,
  CheckCircle2, XCircle, Globe, Phone, Mail, MapPin, Calendar,
  ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

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

export default function OrgDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // Filters State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, branchFilter]);

  const { data: org, isLoading } = useQuery({
    queryKey: ['sa', 'org', id],
    queryFn: () => superAdminApi.getOrganization(id),
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['sa', 'org', id, 'users', page, debouncedSearch, roleFilter, statusFilter, branchFilter],
    queryFn: () => superAdminApi.getOrganizationUsers(id, {
      page,
      pageSize: 10,
      search: debouncedSearch,
      role: roleFilter,
      status: statusFilter,
      }),
  });

  if (isLoading) return <div className="space-y-4 max-w-5xl"><SkeletonCard /><SkeletonCard /></div>;
  if (!org) return <p className="text-muted">Organization not found.</p>;

  const totalPages = usersData?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">

      {/* Back + header */}
      <div className="flex items-center gap-10">
        <button onClick={() => router.back()}
          className="mt-1 text-muted hover:text-ink focusable" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={28} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{org.name}</h1>
              <span className={`badge-chip text-xs ${org.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {org.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-muted text-sm font-mono">/{org.slug}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Users',     value: org._count?.users ?? org.users?.length ?? 0,       icon: Users,         color: 'bg-secondary/10 text-secondary' },
          { label: 'Students',  value: org.studentCount ?? 0,                              icon: GraduationCap, color: 'bg-info/10 text-info' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-ink mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">

        {/* Organization info */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-ink text-sm">Organization details</h2>
          {[
            { icon: Globe,    label: 'Website',  value: org.website },
            { icon: Mail,     label: 'Email',    value: org.email },
            { icon: Phone,    label: 'Phone',    value: org.phone },
            { icon: MapPin,   label: 'Location', value: [org.address, org.city, org.country].filter(Boolean).join(', ') },
            { icon: Globe,    label: 'Timezone', value: org.timezone },
            { icon: Calendar, label: 'Registered', value: org.createdAt ? format(new Date(org.createdAt), 'MMMM d, yyyy') : '—' },
          ].map(({ icon: Icon, label, value }) => value ? (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center shrink-0">
                <Icon size={13} className="text-muted" />
              </div>
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm text-ink font-medium">{value}</p>
              </div>
            </div>
          ) : null)}
        </div>

      </div>

      {/* Users */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-border bg-bg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="font-semibold text-ink text-sm flex items-center gap-2 shrink-0">
            <Users size={14} className="text-muted" /> Users in this organization
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full md:w-48"
              />
            </div>

            {/* Branch filter removed */}

            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-1.5 pl-2 pr-6 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
              <option value="ORG_ADMIN">ORG ADMIN</option>
              <option value="TEACHER">TEACHER</option>
              <option value="FINANCE_STAFF">FINANCE STAFF</option>
              <option value="HR_STAFF">HR STAFF</option>
              <option value="FRONT_DESK">FRONT DESK</option>
              <option value="STUDENT">STUDENT</option>
              <option value="PARENT">PARENT</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 pl-2 pr-6 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              {['Name', 'Email', 'Role', 'Status', 'Last login'].map(h => (
                <th key={h} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border relative">
            {isLoadingUsers ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted text-sm">
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
                    Loading users...
                  </span>
                </td>
              </tr>
            ) : usersData?.data?.length > 0 ? (
              usersData.data.map(u => (
                <tr key={u.id} className="hover:bg-bg/60">
                  <td className="px-4 py-2.5 font-medium text-ink">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles ?? []).map(r => (
                        <span key={r} className={`badge-chip text-xs ${ROLE_CHIP[r] ?? ROLE_CHIP.FRONT_DESK}`}>
                          {r.replace(/_/g,' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {u.isActive
                      ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 size={12} />Active</span>
                      : <span className="flex items-center gap-1 text-xs text-danger"><XCircle size={12} />Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted">
                    {u.lastLoginAt ? formatDistanceToNow(new Date(u.lastLoginAt), { addSuffix: true }) : 'Never'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted text-sm">
                  No users found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination controls */}
        {usersData?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg">
            <p className="text-xs text-muted">
              Showing <span className="font-medium text-ink">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-ink">{Math.min(page * 10, usersData.pagination.total)}</span> of <span className="font-medium text-ink">{usersData.pagination.total}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded text-muted hover:bg-border disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-ink font-medium px-2">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1 rounded text-muted hover:bg-border disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
