'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '../../../../lib/api/superadmin';
import { ScrollText, Search, Filter } from 'lucide-react';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { format, formatDistanceToNow } from 'date-fns';

const ACTION_CHIP = {
  CREATE:          'bg-success/10 text-success',
  UPDATE:          'bg-info/10 text-info',
  DELETE:          'bg-danger/10 text-danger',
  LOGIN:           'bg-secondary/10 text-secondary',
  LOGOUT:          'bg-muted/10 text-muted',
  EXPORT:          'bg-warning/10 text-warning',
  ROLE_CHANGE:     'bg-primary/10 text-primary',
  PERMISSION_CHANGE:'bg-primary/8 text-primary',
  PAYMENT_EDIT:    'bg-warning/10 text-warning',
  PASSWORD_RESET:  'bg-danger/10 text-danger',
  INVITE_SENT:     'bg-info/10 text-info',
};

const ACTIONS = ['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','ROLE_CHANGE','PAYMENT_EDIT','PASSWORD_RESET','INVITE_SENT'];

export default function SuperAdminAuditPage() {
  const [page, setPage]             = useState(1);
  const [actionFilter, setAction]   = useState('');
  const [entityFilter, setEntity]   = useState('');
  const [orgFilter, setOrgFilter]   = useState('');
  const [startDate, setStart]       = useState('');
  const [endDate, setEnd]           = useState('');

  const { data: orgsData } = useQuery({ 
    queryKey: ['sa','orgs_list'], 
    queryFn: () => superAdminApi.listOrganizations({ pageSize: 100 }) 
  });
  const orgsList = orgsData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['sa','audit', page, actionFilter, entityFilter, orgFilter, startDate, endDate],
    queryFn: () => superAdminApi.getAuditLog({
      page, pageSize: 30,
      action:    actionFilter || undefined,
      entity:    entityFilter || undefined,
      organizationId: orgFilter || undefined,
      startDate: startDate || undefined,
      endDate:   endDate || undefined,
    }),
    keepPreviousData: true,
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <ScrollText size={20} className="text-muted" /> Audit Log
        </h1>
        <p className="text-muted text-sm mt-0.5">Platform-wide audit trail — all sensitive actions across all organizations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Filter size={13} /> Filter:
        </div>
        <select value={actionFilter} onChange={e => { setAction(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
        </select>
        
        <select value={entityFilter} onChange={e => { setEntity(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All entities</option>
          {['User', 'Organization', 'Branch', 'Classroom', 'Student', 'Guardian', 'Staff', 'Payment', 'Invoice', 'Role', 'Permission'].map(ent => (
            <option key={ent} value={ent}>{ent}</option>
          ))}
        </select>

        <select value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-[200px]">
          <option value="">All organizations</option>
          {orgsList.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        <input type="date" value={startDate} onChange={e => setStart(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <span className="text-muted text-xs">to</span>
        <input type="date" value={endDate} onChange={e => setEnd(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        {(actionFilter || entityFilter || orgFilter || startDate || endDate) && (
          <button onClick={() => { setAction(''); setEntity(''); setOrgFilter(''); setStart(''); setEnd(''); setPage(1); }}
            className="text-xs text-muted hover:text-danger transition-colors focusable">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={10} cols={5} /></div>
        : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={36} className="text-border mx-auto mb-3" />
            <p className="text-muted text-sm">No audit entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['Time', 'Actor', 'Action', 'Entity', 'Organization', 'IP'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-bg/60">
                    <td className="px-4 py-2.5 text-xs text-muted font-mono whitespace-nowrap">
                      <span title={format(new Date(log.createdAt), 'PPpp')}>
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {log.actor ? (
                        <div>
                          <p className="font-medium text-ink text-xs">{log.actor.firstName} {log.actor.lastName}</p>
                          <p className="text-[10px] text-muted">{log.actor.email}</p>
                        </div>
                      ) : <span className="text-muted text-xs">System</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`badge-chip text-xs ${ACTION_CHIP[log.action] ?? 'bg-border text-muted'}`}>
                        {log.action.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-ink text-xs font-medium">{log.entity}</span>
                      {log.entityId && (
                        <p className="text-[10px] text-muted font-mono truncate max-w-[100px]">{log.entityId.slice(0,8)}…</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted text-xs">
                      {log.organization?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted font-mono text-xs">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">Page {page} of {pagination.totalPages} · {pagination.total} entries</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p-1)} disabled={page===1}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Previous</button>
              <button onClick={() => setPage(p => p+1)} disabled={page>=pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-ink disabled:opacity-40 focusable">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
