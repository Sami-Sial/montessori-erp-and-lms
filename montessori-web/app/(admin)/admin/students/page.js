'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useToast } from '../../../../lib/hooks/useToast';
import { Search, Plus, ChevronRight, User } from 'lucide-react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search],
    queryFn: () => studentsApi.list({ page, pageSize: 20, search: search || undefined }),
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err) => toast.error('Delete failed', err.message),
  });

  const students = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-bold text-ink">{t('students.title')}</h1>
        <Link href="/admin/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors focusable">
          <Plus size={16} aria-hidden="true" /> {t('students.addStudent')}
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={`${t('common.search')} students…`}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search students"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} cols={5} /></div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <User size={40} className="text-border mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted text-sm">{search ? 'No students match your search' : t('students.noStudents')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Student', 'Number', 'Age', 'Classroom', 'Guardian', 'Status', ''].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => {
                  const ageYears = Math.floor((Date.now() - new Date(s.dateOfBirth)) / (365.25 * 24 * 3600 * 1000));
                  const classroom = s.enrollments?.[0]?.classroom?.name ?? '—';
                  const guardian = s.guardians?.[0]?.guardian;
                  return (
                    <tr key={s.id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" aria-hidden="true" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" aria-hidden="true">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                          )}
                          <span className="font-medium text-ink">{s.firstName} {s.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted text-xs">{s.studentNumber}</td>
                      <td className="px-4 py-3 text-muted">{ageYears}y</td>
                      <td className="px-4 py-3 text-muted">{classroom}</td>
                      <td className="px-4 py-3 text-muted">
                        {guardian ? `${guardian.firstName} ${guardian.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge isActive={s.isActive} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/students/${s.id}`}
                          className="text-primary hover:text-primary-dark focusable inline-flex items-center gap-1 text-xs">
                          View <ChevronRight size={14} aria-hidden="true" />
                        </Link>
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
    </div>
  );
}
