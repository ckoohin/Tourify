import api from './axios';

const serviceBookingService = {
  getByDepartureId: (departureId) => api.get(`/departures/${departureId}/services`),

  // Thống kê
  getStats: (departureId) => api.get(`/departures/${departureId}/services/stats`),

  // CRUD
  create: (data) => api.post('/service-bookings', data),
  update: (id, data) => api.put(`/service-bookings/${id}`, data),
  delete: (id) => api.delete(`/service-bookings/${id}`),

  // Cập nhật trạng thái (Confirm/Cancel)
  updateStatus: (id, status, confirmationNumber) => 
    api.patch(`/service-bookings/${id}/status`, { status, confirmation_number: confirmationNumber }),
    
  // Lấy chi tiết
  getById: (id) => api.get(`/service-bookings/${id}`),
};

export default serviceBookingService;