'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../../lib/api/communication';
import { useForm } from 'react-hook-form';
import { useToast } from '../../lib/hooks/useToast';
import { useSelector } from 'react-redux';
import { SkeletonCard } from './Skeleton';
import { Send, Loader2, MessageSquare, X, Edit } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';

function ChatInterfaceInner() {
  const toast = useToast();
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get('chat');
  
  const { user } = useSelector((s) => s.auth);
  
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [showCompose, setShowCompose] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: inbox, isLoading: loadingInbox } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => communicationApi.getMessages({ folder: 'inbox', pageSize: 100 }),
  });

  const { data: sent, isLoading: loadingSent } = useQuery({
    queryKey: ['messages', 'sent'],
    queryFn: () => communicationApi.getMessages({ folder: 'sent', pageSize: 100 }),
  });

  const { data: recipients } = useQuery({
    queryKey: ['messages', 'recipients'],
    queryFn: () => communicationApi.getRecipients(),
  });

  const markRead = useMutation({
    mutationFn: communicationApi.markMessageRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const sendMsg = useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: (newMsg) => {
      toast.success('Message sent');
      qc.invalidateQueries({ queryKey: ['messages'] });
      setShowCompose(false);
      reset();
      resetQuick();
      setActiveChatId(newMsg.recipientId);
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerQuick, handleSubmit: handleQuickSubmit, reset: resetQuick } = useForm();

  // Group messages by chat
  const allMessages = [...(inbox?.data ?? []), ...(sent?.data ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const chatsMap = {};
  
  allMessages.forEach(msg => {
    const isSent = msg.senderId === user?.id;
    const otherUser = isSent ? msg.recipient : msg.sender;
    const otherUserId = otherUser?.id;
    if (!otherUserId) return;
    
    if (!chatsMap[otherUserId]) {
      chatsMap[otherUserId] = {
        user: otherUser,
        messages: [],
        unreadCount: 0,
        lastMessage: msg,
      };
    }
    chatsMap[otherUserId].messages.push(msg);
    if (!isSent && msg.status !== 'READ') {
      chatsMap[otherUserId].unreadCount++;
    }
  });

  const chatList = Object.values(chatsMap).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  chatList.forEach(c => c.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));

  const activeChat = activeChatId ? chatsMap[activeChatId] : null;

  const openChat = (chat) => {
    setActiveChatId(chat.user.id);
    // Remove query param without refreshing
    const url = new URL(window.location.href);
    if (url.searchParams.has('chat')) {
      url.searchParams.delete('chat');
      window.history.replaceState({}, '', url);
    }

    chat.messages.forEach(msg => {
      if (msg.recipientId === user?.id && msg.status !== 'READ') {
         markRead.mutate(msg.id);
      }
    });
  };
  
  // Auto-open chat from URL if it exists
  useEffect(() => {
    if (initialChatId && chatsMap[initialChatId] && activeChatId === initialChatId) {
      openChat(chatsMap[initialChatId]);
    }
  }, [initialChatId, chatsMap, activeChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const onQuickSend = (data) => {
    if (!activeChatId) return;
    sendMsg.mutate({
      recipientId: activeChatId,
      body: data.quickBody,
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="font-display text-xl font-bold text-ink">Messages</h1>
        <button onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors shadow-sm focusable">
          <Edit size={16} /> New Chat
        </button>
      </div>

      <div className="flex flex-1 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden min-h-0">
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-1/3 border-r border-border flex flex-col h-full bg-bg/30">
          <div className="p-4 border-b border-border bg-surface shrink-0">
            <h2 className="font-semibold text-ink text-sm">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingInbox || loadingSent ? (
              <div className="p-4 space-y-4"><SkeletonCard /><SkeletonCard /></div>
            ) : chatList.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={32} className="mx-auto text-muted mb-3 opacity-50" />
                <p className="text-sm text-muted">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {chatList.map(chat => (
                  <button key={chat.user.id} onClick={() => openChat(chat)} 
                    className={`w-full text-left p-4 focusable transition-colors hover:bg-surface flex items-start gap-3
                      ${activeChatId === chat.user.id ? 'bg-surface border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {chat.user.firstName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
                          {chat.user.firstName} {chat.user.lastName}
                        </p>
                        <p className="text-[10px] text-muted shrink-0 ml-2">
                          {format(new Date(chat.lastMessage.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-semibold text-ink' : 'text-muted'}`}>
                        {chat.lastMessage.senderId === user?.id ? 'You: ' : ''}{chat.lastMessage.body}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {chat.unreadCount}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Chat View */}
        <div className={`w-full md:w-2/3 flex flex-col h-full bg-surface ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg/30">
              <div className="w-16 h-16 rounded-full bg-border/50 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-muted" />
              </div>
              <h3 className="font-display font-semibold text-ink text-lg mb-2">Your Messages</h3>
              <p className="text-muted text-sm max-w-sm">Select a conversation from the sidebar or start a new chat to begin messaging.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-surface flex items-center gap-3 shrink-0 shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {activeChat.user.firstName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{activeChat.user.firstName} {activeChat.user.lastName}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50">
                {activeChat.messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  const showDate = idx === 0 || new Date(activeChat.messages[idx-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-border/50 text-[10px] font-medium text-muted uppercase tracking-wider rounded-full">
                            {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-ink rounded-bl-none shadow-sm'}`}>
                          {msg.subject && <p className="text-xs font-bold mb-1 opacity-80 border-b border-white/20 pb-1">{msg.subject}</p>}
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                        </div>
                        <span className="text-[10px] text-muted mt-1 px-1">
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Form */}
              <div className="p-4 bg-surface border-t border-border shrink-0">
                <form onSubmit={handleQuickSubmit(onQuickSend)} className="flex items-end gap-2">
                  <textarea {...registerQuick('quickBody', { required: true })} rows={1}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none resize-none max-h-32 min-h-[44px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleQuickSubmit(onQuickSend)();
                      }
                    }}
                  />
                  <button type="submit" disabled={sendMsg.isPending}
                    className="p-3 bg-accent text-white rounded-xl hover:bg-amber-500 disabled:opacity-50 transition-colors focusable shadow-sm shrink-0 h-[44px] w-[44px] flex items-center justify-center">
                    {sendMsg.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 ">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold font-display text-ink">New Conversation</h2>
              <button onClick={() => { setShowCompose(false); reset(); }} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-surface focusable">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit((data) => sendMsg.mutate(data))} className="flex flex-col overflow-y-auto">
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <label className="text-sm font-semibold text-ink mb-1 block">Recipient</label>
                  <select {...register('recipientId', { required: 'Please select a recipient' })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none">
                    <option value="">Select a Recipient...</option>
                    {recipients?.data?.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                    ))}
                  </select>
                  {errors.recipientId && <p className="text-xs text-danger mt-1">{errors.recipientId.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink mb-1 block">Subject (optional)</label>
                  <input {...register('subject')} placeholder="Subject"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink mb-1 block">Message *</label>
                  <textarea {...register('body', { required: 'Please write a message' })} rows={6}
                    placeholder="Write your message here..."
                    className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-accent focus:outline-none resize-none" />
                  {errors.body && <p className="text-xs text-danger mt-1">{errors.body.message}</p>}
                </div>
              </div>
              <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowCompose(false); reset(); }}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface focusable transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={sendMsg.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-amber-500 disabled:opacity-50 focusable transition-all shadow-sm">
                  {sendMsg.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatInterface() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <ChatInterfaceInner />
    </Suspense>
  );
}
