'use client';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) ?? 'en';

  const toggle = () => {
    const next = current === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-border/60 transition-colors focusable ${className}`}
      aria-label={`Switch language (current: ${current === 'en' ? 'English' : 'Español'})`}
    >
      <Globe size={14} aria-hidden="true" />
      <span className="uppercase">{current}</span>
    </button>
  );
}
