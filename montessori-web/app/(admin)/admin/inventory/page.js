'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../../lib/api/inventory';
import { useToast } from '../../../../lib/hooks/useToast';
import { SkeletonTable } from '../../../../components/shared/Skeleton';
import { AlertTriangle, Package, CheckCircle2, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function AdminInventoryPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['inventory', 'items', lowStockOnly],
    queryFn: () => inventoryApi.listItems({ pageSize: 50, lowStock: lowStockOnly || undefined }),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  });

  const createMut = useMutation({
    mutationFn: inventoryApi.createItem,
    onSuccess: () => {
      toast.success('Item added');
      qc.invalidateQueries({ queryKey: ['inventory'] });
      closeModal();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => inventoryApi.updateItem(id, data),
    onSuccess: () => {
      toast.success('Item updated');
      qc.invalidateQueries({ queryKey: ['inventory'] });
      closeModal();
    },
    onError: (err) => toast.error('Failed', err.message),
  });

  const deleteMut = useMutation({
    mutationFn: inventoryApi.deleteItem,
    onSuccess: () => {
      toast.success('Item deleted');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => toast.error('Failed to delete item'),
  });

  const openAddModal = () => {
    setEditItem(null);
    reset({ name: '', sku: '', location: '', currentStock: 0, minimumStock: 0, reorderPoint: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    reset({
      name: item.name,
      sku: item.sku || '',
      location: item.location || '',
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      reorderPoint: item.reorderPoint,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    reset();
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      sku: data.sku || null,
      location: data.location || null,
      currentStock: Number(data.currentStock),
      minimumStock: Number(data.minimumStock),
      reorderPoint: Number(data.reorderPoint),
    };
    if (editItem) {
      updateMut.mutate({ id: editItem.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Inventory</h1>
          <p className="text-muted text-sm mt-0.5">Montessori materials and supplies</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock?.length > 0 && (
        <div className="card border-warning/40 bg-warning/5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-ink text-sm">{lowStock.length} item{lowStock.length !== 1 ? 's' : ''} below minimum stock</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStock.slice(0, 5).map(item => (
                <span key={item.id} className="badge-chip bg-danger/10 text-danger text-xs">
                  {item.name} ({item.currentStock}/{item.minimumStock} min)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} className="rounded border-border" />
          Show low-stock only
        </label>
      </div>
      
      <div className="card overflow-hidden p-0">
        {isLoading ? <div className="p-4"><SkeletonTable rows={8} cols={7} /></div> : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border bg-bg">
                {['Item', 'SKU', 'Location', 'Stock', 'Min', 'Status', ''].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itemsData?.data?.map(item => (
                <tr key={item.id} className={`hover:bg-bg/60 ${item.isLowStock ? 'bg-warning/5' : ''} group`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package size={13} className="text-primary" />
                      </div>
                      <span className="font-semibold text-ink">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{item.location ?? '—'}</td>
                  <td className={`px-4 py-3 font-mono font-bold ${item.isLowStock ? 'text-danger' : 'text-ink'}`}>{item.currentStock}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{item.minimumStock}</td>
                  <td className="px-4 py-3">
                    {item.isLowStock
                      ? <span className="badge-chip bg-danger/10 text-danger text-xs flex items-center gap-1 w-fit"><AlertTriangle size={11} />Low stock</span>
                      : <span className="badge-chip bg-success/10 text-success text-xs flex items-center gap-1 w-fit"><CheckCircle2 size={11} />OK</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-primary/10 transition-colors focusable" aria-label="Edit item"><Edit size={14} /></button>
                      <button onClick={() => { if(confirm('Are you sure you want to delete this item?')) deleteMut.mutate(item.id); }} className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors focusable" aria-label="Delete item"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-bg to-surface">
              <h2 className="font-display font-bold text-xl text-ink">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={closeModal} className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-bg focusable transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-ink mb-1.5">Item Name <span className="text-danger">*</span></label>
                    <input required {...register('name')} placeholder="e.g. Pink Tower" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">SKU (Optional)</label>
                    <input {...register('sku')} placeholder="e.g. MAT-001" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Location (Optional)</label>
                    <input {...register('location')} placeholder="e.g. Shelf A" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Current Stock <span className="text-danger">*</span></label>
                    <input required type="number" min="0" {...register('currentStock')} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Minimum Stock <span className="text-danger">*</span></label>
                    <input required type="number" min="0" {...register('minimumStock')} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Reorder Point <span className="text-danger">*</span></label>
                    <input required type="number" min="0" {...register('reorderPoint')} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-surface transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || createMut.isPending || updateMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm">
                  {(isSubmitting || createMut.isPending || updateMut.isPending) && <Loader2 size={15} className="animate-spin" />}
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
