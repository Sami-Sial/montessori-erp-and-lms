'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleAIChat } from '../../../../store/uiSlice';
import { Sparkles } from 'lucide-react';

export default function TeacherAIPage() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(toggleAIChat()); }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
        <Sparkles size={32} className="text-secondary" aria-hidden="true" />
      </div>
      <h1 className="font-display text-xl font-bold text-ink">AI Assistant</h1>
      <p className="text-muted text-sm max-w-sm">
        Ask me about a student's progress, get help drafting observation notes, or brainstorm lesson plan ideas for any Montessori area.
      </p>
      <p className="text-xs text-muted">The chat panel is open in the bottom-right corner.</p>
    </div>
  );
}
