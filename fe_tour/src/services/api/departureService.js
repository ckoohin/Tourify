import api from './axios';

const departureService = {
  getAll: (params) => api.get('/departures', { params }),
  getById: (id) => api.get(`/departures/${id}`),
  create: (data) => api.post('/departures', data),
  update: (id, data) => api.put(`/departures/${id}`, data),
  delete: (id) => api.delete(`/departures/${id}`),
  
  // Cập nhật trạng thái
  updateStatus: (id, status) => api.patch(`/departures/${id}/status`, { status }),

  // Lấy danh sách khách
  getGuests: (id, params) => api.get(`/departures/${id}/guests`, { params }),
  
  // Check-in khách
  checkInGuest: (id, guestId) => api.patch(`/departures/${id}/guests/${guestId}/check-in`),
};

export default departureService;