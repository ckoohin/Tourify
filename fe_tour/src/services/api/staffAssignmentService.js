import api from './axios';

const staffAssignmentService = {
  // Lấy danh sách phân công 
  getById: (id) => api.get(`/staff-assignments/${id}`), 

  // Tạo phân công mới
  create: (data) => api.post('/staff-assignments', data),

  // Cập nhật
  update: (id, data) => api.put(`/staff-assignments/${id}`, data),

  // Xóa
  delete: (id) => api.delete(`/staff-assignments/${id}`),

  // Xác nhận phân công
  confirm: (id) => api.patch(`/staff-assignments/${id}/confirm`),

  // Kiểm tra tính khả dụng (Check availability)
  checkAvailability: (staffId, params) => 
    api.get(`/staff-assignments/check-availability/${staffId}`, { params }),
         // params: { departure_date, return_date }
};

export default staffAssignmentService;