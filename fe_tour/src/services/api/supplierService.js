import api from '../api/axios';

const supplierService = {
  getAll: () => api.get('/supplier'),

  // Lấy chi tiết
  getById: (id) => api.get(`/supplier/${id}`),

  // Tạo mới
  create: (data) => api.post('/supplier', data),

  // Cập nhật
  update: (id, data) => api.put(`/supplier/${id}`, data),

  // Xóa
  delete: (id) => api.delete(`/supplier/${id}`),
};

export default supplierService;