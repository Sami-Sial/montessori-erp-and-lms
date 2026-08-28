import { api } from './client';

export const inventoryApi = {
  listItems:          (params)        => api.get('/inventory/items', params),
  getLowStock:        ()              => api.get('/inventory/items/low-stock'),
  getItem:            (id)            => api.get(`/inventory/items/${id}`),
  createItem:         (data)          => api.post('/inventory/items', data),
  updateItem:         (id, data)      => api.patch(`/inventory/items/${id}`, data),
  deleteItem:         (id)            => api.delete(`/inventory/items/${id}`),

  recordMovement:     (data)          => api.post('/inventory/movements', data),

  getCategories:      ()              => api.get('/inventory/categories'),
  getSuppliers:       ()              => api.get('/inventory/suppliers'),
  createSupplier:     (data)          => api.post('/inventory/suppliers', data),

  listPOs:            (params)        => api.get('/inventory/purchase-orders', params),
  createPO:           (data)          => api.post('/inventory/purchase-orders', data),
  receivePO:          (id)            => api.post(`/inventory/purchase-orders/${id}/receive`),
};
