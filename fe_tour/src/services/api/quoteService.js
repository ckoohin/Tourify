import api from './axios';

const quoteService = {
  // Lấy danh sách báo giá
  getAll: (params) => api.get('/quotes', { params }),

  // Lấy chi tiết
  getById: (id) => api.get(`/quotes/${id}`),

  calculatePrice: (data) => api.post('/quotes/calculate', data),

  // Tạo báo giá chính thức
  create: (data) => api.post('/quotes', data),

  // Cập nhật trạng thái (Gửi, Chấp nhận...)
  updateStatus: (id, status) => api.put(`/quotes/${id}/status`, { status }),
};

export default quoteService;