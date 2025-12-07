import api from './axios';

const supplierRatingService = {
  // Lấy thống kê đánh giá của 1 NCC
  getStats: (supplierId) => api.get(`/supplier-ratings/stats/supplier/${supplierId}`),

  // Lấy danh sách đánh giá của NCC (phân trang)
  getBySupplier: (supplierId, params) => api.get(`/supplier-ratings/supplier/${supplierId}`, { params }),

  // Lấy danh sách tất cả đánh giá trong 1 Tour Departure (để hiển thị list tổng quan)
  getByTourDeparture: (tourDepartureId) => api.get(`/supplier-ratings/tour-departure/${tourDepartureId}`),

  // Lấy chi tiết đánh giá của 1 NCC trong 1 Tour (để load vào modal sửa)
  getByTourAndSupplier: (tourDepartureId, supplierId) => 
    api.get(`/supplier-ratings/tour-departure/${tourDepartureId}/supplier/${supplierId}`),

  // Tạo đánh giá lẻ (ít dùng nếu dùng bulk)
  create: (data) => api.post('/supplier-ratings', data),

  // Tạo nhiều đánh giá cùng lúc (cho form đánh giá nhiều tiêu chí)
  createBulk: (data) => api.post('/supplier-ratings/bulk', data),

  // Cập nhật 1 đánh giá cụ thể
  update: (id, data) => api.put(`/supplier-ratings/${id}`, data),

  // Xóa đánh giá
  delete: (id) => api.delete(`/supplier-ratings/${id}`),
};

export default supplierRatingService;