'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../../lib/api/communication';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Loader2 } from 'lucide-react';

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => communicationApi.getNotifications({ pageSize: 50 }),
  });

  const readOne = useMutation({
    mutationFn: communicationApi.markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const readAll = useMutation({
    mutationFn: communicationApi.markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={() => readAll.mutate()} disabled={readAll.isPending}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border text-ink rounded-lg text-sm font-medium hover:bg-bg transition-colors focusable">
            {readAll.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface rounded-xl"></div>)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={36} className="text-border mx-auto mb-3" />
          <p className="text-muted text-sm">You have no notifications.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm border border-border divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">{n.title}</h3>
                  <p className="text-sm text-muted mt-1">{n.body}</p>
                  <p className="text-xs text-muted/60 mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && (
                  <button onClick={() => readOne.mutate(n.id)}
                    className="text-xs font-semibold text-primary hover:underline focusable shrink-0">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
