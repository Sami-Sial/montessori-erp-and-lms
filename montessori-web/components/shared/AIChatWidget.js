'use client';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sparkles, X, Send, Loader2, ChevronDown } from 'lucide-react';
import { toggleAIChat } from '../../store/uiSlice';
import { aiApi } from '../../lib/api/ai';
import useHasPermission from '../../lib/hooks/useHasPermission';
import { formatDistanceToNow } from 'date-fns';

export default function AIChatWidget() {
  const dispatch = useDispatch();
  const { aiChatOpen } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const canChat = useHasPermission('ai:chat');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Role-aware greeting
  const greeting = {
    TEACHER: `Hi ${user?.firstName}! I can help with lesson planning, observation notes, or student progress. What do you need?`,
    GUIDE: `Hi ${user?.firstName}! Ask me about Montessori curriculum, student progress, or observation drafts.`,
    PARENT: `Hi ${user?.firstName}! I can answer questions about your child's learning, attendance, and school activities.`,
    ORG_ADMIN: `Hi ${user?.firstName}! Ask me about school metrics, attendance trends, fee status, or operational summaries.`,
    FINANCE_STAFF: `Hi ${user?.firstName}! I can help with invoice summaries, fee status, and financial overviews.`,
  }[user?.roles?.[0]] ?? `Hi ${user?.firstName}! How can I help?`;

  useEffect(() => {
    if (aiChatOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting, ts: new Date() }]);
    }
  }, [aiChatOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (aiChatOpen) inputRef.current?.focus();
  }, [aiChatOpen]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim(), ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payload = { message: userMsg.content };
      if (conversationId) payload.conversationId = conversationId;
      
      const res = await aiApi.chat(payload);
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, ts: new Date() }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again.',
        ts: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!canChat) return null;

  return (
    <>
      {/* Floating trigger button */}
      {!aiChatOpen && (
        <button
          onClick={() => dispatch(toggleAIChat())}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-modal flex items-center justify-center hover:bg-primary-dark transition-colors focusable"
          aria-label="Open AI assistant"
        >
          <Sparkles size={22} />
        </button>
      )}

      {/* Chat panel */}
      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[520px] bg-surface rounded-2xl shadow-modal border border-border flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={18} />
              <span className="font-semibold text-sm">AI Assistant</span>
            </div>
            <button
              onClick={() => dispatch(toggleAIChat())}
              className="text-white/70 hover:text-white transition-colors focusable"
              aria-label="Close AI assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : msg.error
                      ? 'bg-danger/10 text-danger rounded-bl-sm'
                      : 'bg-bg text-ink rounded-bl-sm border border-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-muted'}`}>
                    {formatDistanceToNow(new Date(msg.ts), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg border border-border px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2 text-muted text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
              placeholder="Ask anything…"
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              aria-label="Message to AI assistant"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-40 focusable"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
