import api from './axios';

const staffAssignmentService = {
  // --- CÁC HÀM QUẢN LÝ (CHO ADMIN/ĐIỀU HÀNH) ---
  getById: (id) => api.get(`/staff-assignments/${id}`), 
  create: (data) => api.post('/staff-assignments', data),
  update: (id, data) => api.put(`/staff-assignments/${id}`, data),
  delete: (id) => api.delete(`/staff-assignments/${id}`),
  confirm: (id) => api.patch(`/staff-assignments/${id}/confirm`),
  checkAvailability: (staffId, params) => 
    api.get(`/staff-assignments/check-availability/${staffId}`, { params }),

  // --- CÁC HÀM CHO GUIDE (MY TOURS) ---
  
  // 1. Lấy danh sách tour (Dashboard)
  getMyTours: (params) => api.get('/staff-assignments/my-assignments', { params }),
  
  getMyAssignmentDetail: (departureId) => 
    api.get(`/staff-assignments/my-assignments/${departureId}`),

  // 3. Thống kê
  getMyStats: (params) => api.get('/staff-assignments/my-assignments/stats/summary', { params }),
    
  // 4. Xác nhận nhận tour
  confirmAssignment: (id) => api.patch(`/staff-assignments/${id}/confirm`),
};

export default staffAssignmentService;