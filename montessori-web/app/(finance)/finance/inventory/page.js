'use client';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../../../lib/api/inventory';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { AlertTriangle, Package } from 'lucide-react';

export default function InventoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'items'],
    queryFn: () => inventoryApi.listItems({ pageSize: 50 }),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-ink">Inventory</h1>

      {/* Low stock alert */}
      {lowStock?.length > 0 && (
        <div className="card border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" aria-hidden="true" />
            <p className="font-semibold text-sm text-ink">{lowStock.length} item{lowStock.length !== 1 ? 's' : ''} below minimum stock</p>
          </div>
          <div className="space-y-1.5">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{item.name}</span>
                <span className="font-mono text-danger font-semibold">{item.currentStock} / {item.minimumStock} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full inventory table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={8} cols={6} /></div> : items.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={36} className="text-border mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted text-sm">No inventory items</p>
          </div>
        ) : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border bg-bg">
                {['Item', 'SKU', 'Location', 'Stock', 'Min', 'In Classroom', 'Status'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className={`hover:bg-bg/60 ${item.isLowStock ? 'bg-warning/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-ink">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{item.location ?? '—'}</td>
                  <td className={`px-4 py-3 font-mono font-semibold ${item.isLowStock ? 'text-danger' : 'text-ink'}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{item.minimumStock}</td>
                  <td className="px-4 py-3">
                    {item.inClassroomUse
                      ? <span className="badge-chip bg-secondary/10 text-secondary text-xs">In use</span>
                      : <span className="badge-chip bg-border text-muted text-xs">Storage</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.isLowStock
                      ? <span className="badge-chip bg-danger/10 text-danger text-xs flex items-center gap-1"><AlertTriangle size={11} />Low stock</span>
                      : <span className="badge-chip bg-success/10 text-success text-xs">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
