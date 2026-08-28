'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '../../../../lib/api/sync';
import { useToast } from '../../../../lib/hooks/useToast';
import { useDispatch } from 'react-redux';
import { clearConflicts } from '../../../../store/syncSlice';
import { SkeletonCard } from '../../../../components/shared/Skeleton';
import { AlertTriangle, CheckCircle2, Server, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SyncConflictsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const dispatch = useDispatch();

  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['sync', 'conflicts'],
    queryFn: syncApi.listConflicts,
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, resolution }) => syncApi.resolveConflict(id, { resolution }),
    onSuccess: (_, { resolution }) => {
      toast.success('Conflict resolved', `Used: ${resolution.replace(/_/g, ' ').toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['sync', 'conflicts'] });
      // Update Redux sync state
      dispatch(clearConflicts());
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <AlertTriangle size={20} className="text-danger" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-ink">Sync Conflicts</h1>
      </div>

      <div className="rounded-lg bg-warning/5 border border-warning/30 p-3 text-sm text-muted">
        These records were edited on multiple devices while offline. Choose which version to keep —
        <strong className="text-ink"> no changes are applied until you decide</strong>.
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0,1].map(i => <SkeletonCard key={i} />)}</div>
      ) : !conflicts?.length ? (
        <div className="card text-center py-12">
          <CheckCircle2 size={36} className="text-success mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-ink">No conflicts</p>
          <p className="text-muted text-sm mt-1">All offline changes synced cleanly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((c) => (
            <div key={c.id} className="card border-danger/30 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-ink text-sm">{c.entity}</p>
                  <p className="text-xs text-muted">
                    Device: <span className="font-mono">{c.deviceId}</span> ·{' '}
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className="badge-chip bg-danger/10 text-danger text-xs">Conflict</span>
              </div>

              {/* Side-by-side diff */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-lg bg-bg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <Smartphone size={13} aria-hidden="true" /> Your version (device)
                  </div>
                  <pre className="text-xs text-ink whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-40">
                    {JSON.stringify(c.clientPayload, null, 2)}
                  </pre>
                </div>
                <div className="rounded-lg bg-bg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <Server size={13} aria-hidden="true" /> Server version
                  </div>
                  <pre className="text-xs text-ink whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-40">
                    {JSON.stringify(c.serverPayload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Resolution buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => resolveMut.mutate({ id: c.id, resolution: 'SERVER_WINS' })}
                  disabled={resolveMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark disabled:opacity-50 focusable">
                  <Server size={13} aria-hidden="true" /> Keep server version
                </button>
                <button
                  onClick={() => resolveMut.mutate({ id: c.id, resolution: 'CLIENT_WINS' })}
                  disabled={resolveMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-white rounded-lg text-xs font-medium hover:bg-secondary-dark disabled:opacity-50 focusable">
                  <Smartphone size={13} aria-hidden="true" /> Keep my version
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
