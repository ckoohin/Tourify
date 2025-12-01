import api from './axios';

const bookingService = {
  // Lấy danh sách
  getAll: (params) => api.get('/booking', { params }),

  // Lấy chi tiết
  getById: (id) => api.get(`/booking/${id}`),

  // Tạo mới
  create: (data) => api.post('/booking', data),

  // Cập nhật
  update: (id, data) => api.put(`/booking/${id}`, data),

  // Xóa
  delete: (id) => api.delete(`/booking/${id}`),
};

export default bookingService;