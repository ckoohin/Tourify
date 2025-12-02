import api from './axios';

const bookingHistoryService = {
  // Lấy lịch sử
  getByBookingId: (bookingId) => api.get('/bookingStatusHistory', { params: { booking_id: bookingId } }),

  create: (data) => api.post('/bookingStatusHistory', data),
  
  delete: (id) => api.delete(`/bookingStatusHistory/${id}`),
};

export default bookingHistoryService;