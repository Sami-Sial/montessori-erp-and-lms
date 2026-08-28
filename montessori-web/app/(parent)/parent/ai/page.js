'use client';
// Parent AI assistant — full page version of the chat widget
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { toggleAIChat } from '../../../../store/uiSlice';
import { Sparkles } from 'lucide-react';

export default function ParentAIPage() {
  const dispatch = useDispatch();

  // Auto-open the AI chat widget when this page loads
  useEffect(() => { dispatch(toggleAIChat()); }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
        <Sparkles size={32} className="text-accent" aria-hidden="true" />
      </div>
      <h1 className="font-display text-xl font-bold text-ink">AI Assistant</h1>
      <p className="text-muted text-sm max-w-xs">
        Ask me anything about your child's learning, attendance, or upcoming activities. 
        I use real data from the school — not generic answers.
      </p>
      <p className="text-xs text-muted">The chat panel is open in the bottom-right corner.</p>
    </div>
  );
}
