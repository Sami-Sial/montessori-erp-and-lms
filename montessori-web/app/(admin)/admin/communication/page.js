'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { communicationApi } from '../../../../lib/api/communication';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { classroomsApi } from '../../../../lib/api/classrooms';
import { Plus, Megaphone, Pin, Loader2, Bell, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const TYPE_CHIP = {
  ATTENDANCE: 'bg-secondary/10 text-secondary',
  INVOICE:    'bg-warning/10 text-warning',
  MESSAGE:    'bg-primary/10 text-primary',
  BADGE:      'bg-accent/15 text-amber-700',
  AI_INSIGHT: 'bg-info/10 text-info',
  LOW_STOCK:  'bg-danger/10 text-danger',
  SYSTEM:     'bg-muted/10 text-muted',
  ANNOUNCEMENT:'bg-secondary/10 text-secondary',
};

export default function CommunicationPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState('announcements');
  const [showForm, setShowForm] = useState(false);

  const { data: announcements, isLoading: loadingAnn } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => communicationApi.listAnnouncements({ pageSize: 30 }),
    enabled: tab === 'announcements',
  });

  const { data: notifications, isLoading: loadingNotif } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => communicationApi.getNotifications({ pageSize: 30 }),
    enabled: tab === 'notifications',
  });

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => communicationApi.getMessages({ folder: 'inbox', pageSize: 30 }),
    enabled: tab === 'messages',
  });

  const { data: classrooms } = useQuery({ queryKey: ['classrooms'], queryFn: () => classroomsApi.list() });

  const createAnn = useMutation({
    mutationFn: communicationApi.createAnnouncement,
    onSuccess: () => {
      toast.success('Announcement posted');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      setShowForm(false); reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const deleteAnn = useMutation({
    mutationFn: communicationApi.deleteAnnouncement,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['announcements'] }); },
  });

  const markAllRead = useMutation({
    mutationFn: communicationApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { isPinned: false },
  });

  const onSubmit = (data) => createAnn.mutate(data);

  const tabs = [
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Communication</h1>
        {tab === 'announcements' && (
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">
            <Plus size={16} /> Post announcement
          </button>
        )}
        {tab === 'notifications' && (
          <button onClick={() => markAllRead.mutate()}
            className="text-xs text-primary hover:underline focusable">Mark all read</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} role="tab" aria-selected={tab === key}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focusable -mb-px ${
              tab === key ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {/* Create announcement form */}
      {tab === 'announcements' && showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card border-primary/30 space-y-3 animate-slide-up">
          <h2 className="font-semibold text-sm text-ink">New Announcement</h2>
          <input {...register('title', { required: true })} placeholder="Title *"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
          <textarea {...register('body', { required: true })} rows={3} placeholder="Message body *"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Classroom (optional)</label>
              <select {...register('classroomId')} className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="">All classrooms</option>
                {classrooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="pinned" {...register('isPinned')} className="rounded border-border" />
              <label htmlFor="pinned" className="text-sm text-muted cursor-pointer">Pin to top</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting || createAnn.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 focusable">
              {(isSubmitting || createAnn.isPending) && <Loader2 size={14} className="animate-spin" />}
              Post
            </button>
            <button type="button" onClick={() => { setShowForm(false); reset(); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
          </div>
        </form>
      )}

      {/* Announcements list */}
      {tab === 'announcements' && (
        <div className="space-y-3">
          {loadingAnn ? <SkeletonCard /> : announcements?.data?.length === 0 ? (
            <div className="card text-center py-10 text-muted text-sm">No announcements yet</div>
          ) : announcements?.data?.map((ann) => (
            <div key={ann.id} className={`card space-y-2 ${ann.isPinned ? 'border-primary/30 bg-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <Pin size={13} className="text-primary shrink-0" aria-hidden="true" />}
                  <p className="font-semibold text-ink text-sm">{ann.title}</p>
                </div>
                <button onClick={() => deleteAnn.mutate(ann.id)}
                  className="text-muted hover:text-danger transition-colors focusable shrink-0" aria-label="Delete announcement">
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-sm text-muted leading-relaxed">{ann.body}</p>
              <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                {ann.classroom && <span className="badge-chip bg-secondary/10 text-secondary">{ann.classroom.name}</span>}
                {ann.branch && <span className="badge-chip bg-info/10 text-info">{ann.branch.name}</span>}
                <span>{formatDistanceToNow(new Date(ann.publishAt), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Notifications center */}
      {tab === 'notifications' && (
        <div className="space-y-2">
          {loadingNotif ? <SkeletonCard /> : notifications?.data?.length === 0 ? (
            <div className="card text-center py-10 text-muted text-sm">All caught up!</div>
          ) : notifications?.data?.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 ${!n.isRead ? 'border-primary/20 bg-primary/5' : 'opacity-75'}`}>
              <span className={`badge-chip text-xs mt-0.5 shrink-0 ${TYPE_CHIP[n.type] ?? TYPE_CHIP.SYSTEM}`}>
                {n.type.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm">{n.title}</p>
                <p className="text-xs text-muted mt-0.5">{n.body}</p>
                <p className="text-xs text-muted/60 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" aria-label="Unread" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
