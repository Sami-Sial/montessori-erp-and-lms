'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { communicationApi } from '../../../../lib/api/communication';
import Link from 'next/link';
import { ClipboardCheck, MessageSquare, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { SkeletonCard, SkeletonStatCard } from '../../../../components/shared/Skeleton';

function QuickAction({ href, icon: Icon, label, color }) {
  const bg = color.replace('text-', 'bg-') + '/10';
  return (
    <Link href={href} className="stat-card group hover:shadow-md transition-shadow cursor-pointer block">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} ${bg}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="text-sm font-medium text-ink mt-4 group-hover:text-primary transition-colors">Go to {label} →</p>
    </Link>
  );
}

export default function FrontDeskDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const { data: classrooms, isLoading: loadingClassrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list(),
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => communicationApi.getMessages({ folder: 'inbox', pageSize: 5 }),
  });

  const totalClassrooms = classrooms?.length ?? 0;
  const unreadMessages = messages?.data?.filter((m) => m.status !== 'READ')?.length ?? 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-muted text-sm mt-1">
            {format(now, 'EEEE, MMMM d')} — Front Desk Overview
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction href="/frontdesk/attendance" icon={ClipboardCheck} label={t('attendance.markAttendance')} color="text-secondary" />
        <QuickAction href="/frontdesk/messages" icon={MessageSquare} label="Messages" color="text-primary" />
        {loadingClassrooms ? <SkeletonStatCard /> : (
          <div className="stat-card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Active Classrooms</p>
              <Building2 size={16} className="text-muted" />
            </div>
            <p className="font-display text-2xl font-bold text-ink">{totalClassrooms}</p>
          </div>
        )}
        {loadingMessages ? <SkeletonStatCard /> : (
          <div className="stat-card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Unread Messages</p>
              <MessageSquare size={16} className="text-muted" />
            </div>
            <p className="font-display text-2xl font-bold text-ink">{unreadMessages}</p>
          </div>
        )}
      </div>
    </div>
  );
}
