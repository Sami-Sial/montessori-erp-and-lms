'use client';
import { useSelector } from 'react-redux';
import { Cloud, CloudOff, CloudCog, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  synced:  { icon: CheckCircle2, label: 'Synced',   color: 'text-success',         bg: 'bg-success/10' },
  pending: { icon: CloudCog,     label: 'Pending',  color: 'text-warning',         bg: 'bg-warning/10' },
  syncing: { icon: CloudCog,     label: 'Syncing…', color: 'text-info animate-spin', bg: 'bg-info/10' },
  conflict:{ icon: AlertTriangle,label: 'Conflict', color: 'text-danger',          bg: 'bg-danger/10' },
  offline: { icon: CloudOff,     label: 'Offline',  color: 'text-muted',           bg: 'bg-border' },
};

export default function SyncStatusIndicator({ light = false }) {
  const { status, pendingCount, conflictCount, isOnline } = useSelector((s) => s.sync);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.synced;
  const Icon = cfg.icon;

  const label = status === 'pending'
    ? `${pendingCount} pending`
    : status === 'conflict'
    ? `${conflictCount} conflict${conflictCount !== 1 ? 's' : ''}`
    : cfg.label;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
      title={`Sync status: ${label}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={13} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
