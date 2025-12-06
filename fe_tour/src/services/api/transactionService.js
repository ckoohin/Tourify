import api from './axios';

const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  approve: (id) => api.patch(`/transactions/${id}/approve`),
  getSummary: (tourId) => api.get(`/transactions/summary/${tourId}`),
};

export default transactionService;