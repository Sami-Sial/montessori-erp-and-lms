'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../../lib/api/communication';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationBell({ light = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => communicationApi.getNotifications({ pageSize: 8, unreadOnly: true }),
    refetchInterval: 30_000,
  });

  const readAll = useMutation({
    mutationFn: communicationApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = data?.pagination?.total ?? 0;
  const notifications = data?.data ?? [];

  const iconColor = light ? 'text-white/80 hover:text-white' : 'text-muted hover:text-ink';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-1.5 rounded-lg transition-colors focusable ${iconColor}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl shadow-modal border border-border z-50 animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => readAll.mutate()}
                className="text-xs text-primary hover:underline focusable"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-muted text-sm">All caught up!</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-bg transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                >
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted/60 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-border">
            <Link
              href="/communication/notifications"
              className="text-xs text-primary hover:underline focusable"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
