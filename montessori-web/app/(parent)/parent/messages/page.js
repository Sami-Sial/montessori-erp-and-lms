'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../../../../lib/api/communication';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../../lib/hooks/useToast';
import { useSelector } from 'react-redux';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ParentMessagesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const [activeMessage, setActiveMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  const { data: inbox, isLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => communicationApi.getMessages({ folder: 'inbox', pageSize: 20 }),
  });

  const markRead = useMutation({
    mutationFn: communicationApi.markMessageRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });

  const sendMsg = useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: () => {
      toast.success('Message sent');
      qc.invalidateQueries({ queryKey: ['messages'] });
      setShowCompose(false);
      reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openMessage = (msg) => {
    setActiveMessage(msg);
    if (msg.status !== 'READ') markRead.mutate(msg.id);
  };

  const messages = inbox?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Messages</h1>
        <button onClick={() => setShowCompose((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors focusable">
          <Send size={15} /> Compose
        </button>
      </div>

      {/* Compose form */}
      {showCompose && (
        <form onSubmit={handleSubmit((data) => sendMsg.mutate(data))}
          className="card border-accent/30 space-y-3 animate-slide-up">
          <p className="font-semibold text-sm text-ink">New message to teacher</p>
          <div>
            <label className="text-xs text-muted mb-1 block">Recipient user ID</label>
            <input {...register('recipientId', { required: 'Required' })} placeholder="Teacher user ID"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none" />
            {errors.recipientId && <p className="text-xs text-danger mt-1">{errors.recipientId.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Subject (optional)</label>
            <input {...register('subject')} placeholder="Subject"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Message *</label>
            <textarea {...register('body', { required: 'Required' })} rows={3}
              placeholder="Write your message…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none resize-none" />
            {errors.body && <p className="text-xs text-danger mt-1">{errors.body.message}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={sendMsg.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500 disabled:opacity-50 focusable">
              {sendMsg.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send
            </button>
            <button type="button" onClick={() => { setShowCompose(false); reset(); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Message list */}
      {isLoading ? <SkeletonCard /> : messages.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare size={36} className="text-border mx-auto mb-3" aria-hidden="true" />
          <p className="text-muted text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <button key={msg.id} onClick={() => openMessage(msg)} className="w-full text-left focusable">
              <div className={`card hover:shadow-md transition-shadow ${msg.status !== 'READ' ? 'border-accent/30 bg-accent/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0" aria-hidden="true">
                    {msg.sender?.firstName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm ${msg.status !== 'READ' ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>
                        {msg.sender?.firstName} {msg.sender?.lastName}
                      </p>
                      <p className="text-xs text-muted shrink-0">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {msg.subject && <p className="text-sm text-muted">{msg.subject}</p>}
                    <p className="text-xs text-muted line-clamp-2 mt-0.5">{msg.body}</p>
                  </div>
                  {msg.status !== 'READ' && (
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" aria-label="Unread" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message detail overlay */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40" role="dialog" aria-modal="true" aria-label="Message">
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-modal overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="font-semibold text-ink text-sm">
                {activeMessage.sender?.firstName} {activeMessage.sender?.lastName}
              </p>
              <button onClick={() => setActiveMessage(null)} className="text-muted hover:text-ink focusable" aria-label="Close">✕</button>
            </div>
            {activeMessage.subject && <p className="px-4 pt-3 text-sm font-medium text-muted">{activeMessage.subject}</p>}
            <div className="px-4 py-4">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{activeMessage.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
