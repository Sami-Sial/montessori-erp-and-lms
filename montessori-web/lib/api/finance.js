import { api } from './client';

export const financeApi = {
  // Fee structures
  getFeeStructures:   ()              => api.get('/finance/fee-structures'),
  createFeeStructure: (data)          => api.post('/finance/fee-structures', data),
  updateFeeStructure: (id, data)      => api.patch(`/finance/fee-structures/${id}`, data),

  // Invoices
  listInvoices:       (params)        => api.get('/finance/invoices', params),
  getInvoice:         (id)            => api.get(`/finance/invoices/${id}`),
  createInvoice:      (data)          => api.post('/finance/invoices', data),
  createBatchInvoices:(data)          => api.post('/finance/invoices/batch', data),
  sendReminder:       (id)            => api.post(`/finance/invoices/${id}/remind`),

  // Payments
  recordPayment:      (data)          => api.post('/finance/payments', data),
  listPayments:       (params)        => api.get('/finance/payments', params),

  // Expenses
  listExpenses:       (params)        => api.get('/finance/expenses', params),
  createExpense:      (data)          => api.post('/finance/expenses', data),

  // Summary & ledger
  getSummary:         (params)        => api.get('/finance/summary', params),
  getAnalytics:       (params)        => api.get('/finance/analytics', params),
  getLedger:          (params)        => api.get('/finance/ledger', params),

  // Stripe checkout
  createCheckoutSession: (invoiceId)  => api.post(`/finance/invoices/${invoiceId}/checkout`),
};
