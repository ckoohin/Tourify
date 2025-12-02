import api from './axios';

const tourExpenseService = {
  // Lấy danh sách chi phí
  getByDepartureId: (departureId) => api.get(`/tour-expenses/${departureId}/expenses`),

  // So sánh với dự toán
  compareBudget: (departureId) => api.get(`/tour-expenses/${departureId}/expenses/compare-budget`),

  // CRUD
  create: (data) => api.post('/tour-expenses', data),
  update: (id, data) => api.put(`/tour-expenses/${id}`, data),
  delete: (id) => api.delete(`/tour-expenses/${id}`),
  approve: (id) => api.patch(`/tour-expenses/${id}/approve`),
};

export default tourExpenseService;