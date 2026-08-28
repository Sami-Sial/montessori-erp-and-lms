import { useDispatch } from 'react-redux';
import { addToast } from '../../store/uiSlice';

/**
 * Convenience hook for dispatching toasts.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Attendance saved');
 *   toast.error('Save failed', 'Network error');
 */
export function useToast() {
  const dispatch = useDispatch();

  const show = (type, title, message, duration) =>
    dispatch(addToast({ type, title, message, duration }));

  return {
    success: (title, message, duration) => show('success', title, message, duration),
    error:   (title, message, duration) => show('error',   title, message, duration),
    warning: (title, message, duration) => show('warning', title, message, duration),
    info:    (title, message, duration) => show('info',    title, message, duration),
  };
}
