'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../lib/api/students';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function TeacherStudentsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', search],
    queryFn: () => studentsApi.list({ pageSize: 50, search: search || undefined }),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-ink">{t('students.title')}</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          aria-label="Search students" />
      </div>

      {isLoading ? <SkeletonTable rows={8} cols={3} /> : (
        <div className="grid md:grid-cols-2 gap-3">
          {data?.data?.map((s) => {
            const ageYears = Math.floor((Date.now() - new Date(s.dateOfBirth)) / (365.25 * 24 * 3600 * 1000));
            return (
              <Link key={s.id} href={`/admin/students/${s.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow group focusable">
                {s.photoUrl
                  ? <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" aria-hidden="true" />
                  : <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold shrink-0" aria-hidden="true">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted">{ageYears}y · {s.enrollments?.[0]?.classroom?.name ?? '—'}</p>
                </div>
                <ChevronRight size={16} className="text-muted group-hover:text-ink transition-colors" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
