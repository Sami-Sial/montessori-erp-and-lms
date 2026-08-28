'use client';
// Teacher messages — shared with admin communication page
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../../../../lib/api/communication';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TeacherMessagesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [folder, setFolder] = useState('inbox');

  const { data, isLoading } = useQuery({
    queryKey: ['messages', folder],
    queryFn: () => communicationApi.getMessages({ folder, pageSize: 30 }),
  });

  const sendMsg = useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: () => {
      toast.success('Message sent');
      qc.invalidateQueries({ queryKey: ['messages'] });
      setShowCompose(false); reset();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const onSubmit = (data) => sendMsg.mutate(data);

  const messages = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Messages</h1>
        <button onClick={() => setShowCompose((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-dark focusable">
          <Send size={15} /> Compose
        </button>
      </div>

      {/* Folder tabs */}
      <div className="flex gap-2">
        {['inbox', 'sent'].map((f) => (
          <button key={f} onClick={() => setFolder(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors focusable ${folder === f ? 'bg-secondary text-white' : 'border border-border text-muted hover:text-ink'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Compose */}
      {showCompose && (
        <form onSubmit={handleSubmit(onSubmit)} className="card border-secondary/30 space-y-3 animate-slide-up">
          <p className="font-semibold text-sm text-ink">New Message</p>
          <div>
            <label className="text-xs text-muted mb-1 block">Recipient user ID</label>
            <input {...register('recipientId', { required: 'Required' })} placeholder="Paste recipient user ID"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-secondary focus:outline-none" />
            {errors.recipientId && <p className="text-xs text-danger mt-1">{errors.recipientId.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Subject (optional)</label>
            <input {...register('subject')} placeholder="Subject"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Message *</label>
            <textarea {...register('body', { required: 'Required' })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:ring-2 focus:ring-secondary focus:outline-none resize-none" />
            {errors.body && <p className="text-xs text-danger mt-1">{errors.body.message}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={sendMsg.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium disabled:opacity-50 focusable">
              {sendMsg.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
            </button>
            <button type="button" onClick={() => { setShowCompose(false); reset(); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink focusable">Cancel</button>
          </div>
        </form>
      )}

      {/* Message list */}
      {isLoading ? <SkeletonCard /> : messages.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare size={36} className="text-border mx-auto mb-3" aria-hidden="true" />
          <p className="text-muted text-sm">No messages in {folder}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id}
              className={`card flex items-start gap-3 ${msg.status !== 'READ' && folder === 'inbox' ? 'border-secondary/30 bg-secondary/5' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-semibold shrink-0" aria-hidden="true">
                {msg.sender?.firstName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink text-sm">{msg.sender?.firstName} {msg.sender?.lastName}</p>
                  <p className="text-xs text-muted shrink-0">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {msg.subject && <p className="text-xs font-medium text-muted">{msg.subject}</p>}
                <p className="text-sm text-muted mt-0.5 line-clamp-2">{msg.body}</p>
              </div>
              {msg.status !== 'READ' && folder === 'inbox' && (
                <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" aria-label="Unread" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
