import api from './axios';

const tourExpenseService = {
  // Lấy danh sách chi phí của một tour
  getByDepartureId: (departureId) => {
    return api.get(`/tour-expenses/departure/${departureId}`);
  },

  // Lấy dữ liệu so sánh Thực tế vs Dự toán
  compareWithBudget: (departureId) => {
    return api.get(`/tour-expenses/departure/${departureId}/budget-comparison`);
  },

  create: (data) => api.post('/tour-expenses', data),
  
  update: (id, data) => api.put(`/tour-expenses/${id}`, data),
  
  delete: (id) => api.delete(`/tour-expenses/${id}`),
  
  approve: (id) => api.patch(`/tour-expenses/${id}/approve`),
  
  getById: (id) => api.get(`/tour-expenses/${id}`),
};

export default tourExpenseService;