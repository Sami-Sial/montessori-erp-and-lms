'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { superAdminApi } from '../../../../lib/api/superadmin';
import {
  Building2, Search, ToggleLeft, ToggleRight, Plus,
  Pencil, Trash2, Eye, CheckCircle2, XCircle, X, Loader2, AlertTriangle,
} from 'lucide-react';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const orgSchema = z.object({
  name:     z.string().min(2, 'Required'),
  slug:     z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers and hyphens only'),
  city:     z.string().optional(),
  country:  z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
  phone:    z.string().optional(),
});

function OrgModal({ org, onClose, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(orgSchema),
    defaultValues: org ?? {},
  });

  const onSubmit = async (data) => {
    try {
      if (org) { await superAdminApi.updateOrganization(org.id, data); }
      else      { await superAdminApi.createOrganization(data); }
      onSaved();
    } catch (err) {
      alert(err.message);
    }
  };

  const fields = [
    { id: 'name',    label: 'School name *',  placeholder: 'Sunrise Montessori Academy' },
    { id: 'slug',    label: 'URL slug *',      placeholder: 'sunrise-montessori' },
    { id: 'city',    label: 'City',            placeholder: 'Austin' },
    { id: 'country', label: 'Country',         placeholder: 'US' },
    { id: 'email',   label: 'Contact email',   placeholder: 'admin@school.edu' },
    { id: 'phone',   label: 'Phone',           placeholder: '+1 512 555 0100' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-modal overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-ink">{org ? 'Edit Organization' : 'Create Organization'}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink focusable" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ id, label, placeholder }) => (
              <div key={id} className={id === 'name' || id === 'slug' ? 'col-span-2' : ''}>
                <label htmlFor={id} className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">{label}</label>
                <input id={id} {...register(id)} placeholder={placeholder}
                  className={`w-full px-3 py-2 rounded-lg border text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary ${errors[id] ? 'border-danger' : 'border-border'}`} />
                {errors[id] && <p className="text-xs text-danger mt-1">{errors[id].message}</p>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 focusable">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {org ? 'Save changes' : 'Create organization'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ org, onClose, onDeleted }) {
  const [confirmSlug, setConfirmSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await superAdminApi.deleteOrganization(org.id);
      onDeleted();
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-modal overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <h2 className="font-display font-bold text-ink text-center mb-2">Delete Organization</h2>
          <p className="text-muted text-sm text-center mb-4">
            This will permanently delete <strong className="text-ink">{org.name}</strong> and all its data. This cannot be undone.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
              Type <span className="font-mono text-danger">{org.slug}</span> to confirm
            </label>
            <input value={confirmSlug} onChange={e => setConfirmSlug(e.target.value)}
              placeholder={org.slug} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-danger" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete}
              disabled={confirmSlug !== org.slug || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger/80 disabled:opacity-40 focusable">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Delete permanently
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleModal({ org, onClose, onToggled }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await superAdminApi.toggleOrganization(org.id);
      onToggled(org);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const action = org.isActive ? 'Deactivate' : 'Activate';
  const colorClass = org.isActive ? 'text-danger' : 'text-success';
  const bgClass = org.isActive ? 'bg-danger/10' : 'bg-success/10';
  const btnClass = org.isActive ? 'bg-danger hover:bg-danger/80 text-white' : 'bg-success hover:bg-success/80 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-modal overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle size={24} className={colorClass} />
          </div>
          <h2 className="font-display font-bold text-ink text-center mb-2">{action} Organization</h2>
          <p className="text-muted text-sm text-center mb-6">
            Are you sure you want to {action.toLowerCase()} <strong className="text-ink">{org.name}</strong>?
            {org.isActive ? " Users won't be able to log in until it's reactivated." : " Users will regain access immediately."}
          </p>
          <div className="flex gap-2">
            <button onClick={handleToggle}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 focusable ${btnClass}`}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {action}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-ink focusable" disabled={loading}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminOrganizationsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [deleteOrg, setDeleteOrg] = useState(null);
  const [toggleOrg, setToggleOrg] = useState(null);
  const toast = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['sa', 'orgs', page, debouncedSearch],
    queryFn: () => superAdminApi.listOrganizations({ page, pageSize: 15, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const orgs = data?.data ?? [];
  const pagination = data?.pagination;

  const onSaved = () => {
    toast.success(editOrg ? 'Organization updated' : 'Organization created');
    qc.invalidateQueries({ queryKey: ['sa'] });
    setShowCreate(false);
    setEditOrg(null);
  };

  const onDeleted = () => {
    toast.success('Organization deleted');
    qc.invalidateQueries({ queryKey: ['sa'] });
    setDeleteOrg(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">All Organizations</h1>
          <p className="text-muted text-sm mt-0.5">Every school registered on the platform</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors focusable">
          <Plus size={16} /> Create organization
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or slug…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={6} cols={6} /></div>
        : orgs.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={36} className="text-border mx-auto mb-3" />
            <p className="text-muted text-sm">{search ? 'No organizations match your search' : 'No organizations yet'}</p>
          </div>
        ) : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border bg-bg">
                {['School','Slug','Location','Users','Status','Actions'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orgs.map(org => (
                <tr key={org.id} className="hover:bg-bg/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 size={13} className="text-primary" />
                      </div>
                      <span className="font-semibold text-ink">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{org.slug}</td>
                  <td className="px-4 py-3 text-muted text-xs">{[org.city, org.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-center">{org._count?.users ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-chip text-xs flex items-center gap-1 w-fit ${org.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {org.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/superadmin/organizations/${org.id}`}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/8 transition-colors focusable" title="View details">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => setEditOrg(org)}
                        className="p-1.5 rounded-lg text-muted hover:text-info hover:bg-info/8 transition-colors focusable" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setToggleOrg(org)}
                        className={`p-1.5 rounded-lg transition-colors focusable ${org.isActive ? 'text-success hover:bg-success/10' : 'text-muted hover:bg-border'}`} title={org.isActive ? 'Deactivate' : 'Activate'}>
                        {org.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                      </button>
                      <button onClick={() => setDeleteOrg(org)}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/8 transition-colors focusable" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg">
            <p className="text-xs text-muted">Page {page} of {pagination.totalPages} · {pagination.total} total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreate || editOrg) && (
        <OrgModal org={editOrg} onClose={() => { setShowCreate(false); setEditOrg(null); }} onSaved={onSaved} />
      )}
      {deleteOrg && <DeleteModal org={deleteOrg} onClose={() => setDeleteOrg(null)} onDeleted={onDeleted} />}
      {toggleOrg && <ToggleModal org={toggleOrg} onClose={() => setToggleOrg(null)} onToggled={() => { setToggleOrg(null); qc.invalidateQueries({ queryKey: ['sa'] }); toast.success(`Organization ${toggleOrg.isActive ? 'deactivated' : 'activated'}`); }} />}
    </div>
  );
}
