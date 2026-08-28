'use client';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/uiSlice';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   XCircle,
  info:    Info,
};

const STYLES = {
  success: 'bg-success/10 border-success/30 text-success',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  error:   'bg-danger/10  border-danger/30  text-danger',
  info:    'bg-info/10    border-info/30    text-info',
};

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  const Icon = ICONS[toast.type] ?? Info;

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card animate-slide-up min-w-64 max-w-sm bg-surface ${STYLES[toast.type] ?? STYLES.info}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        {toast.message && <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focusable"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useSelector((s) => s.ui);
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
