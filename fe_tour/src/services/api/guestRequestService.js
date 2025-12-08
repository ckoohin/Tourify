import api from './axios';

const guestRequestService = {
    // Lấy danh sách theo Departure (Cho điều hành)
    getByDeparture: (departureId) => 
        api.get(`/guest-special-requests/tour-departure/${departureId}`),

    // Lấy danh sách theo Booking (Cho Sale)
    getByBooking: (bookingId) => 
        api.get(`/guest-special-requests/booking/${bookingId}`),

    // Thống kê (Dashboard/Summary)
    getStats: (bookingId = null) => 
        api.get('/guest-special-requests/stats', { params: { bookingId } }),

    // Lấy các request chưa xử lý (Alerts)
    getPending: (departureId = null) => 
        api.get('/guest-special-requests/pending', { params: { tourDepartureId: departureId } }),

    // CRUD
    create: (data) => api.post('/guest-special-requests', data),
    
    update: (id, data) => api.put(`/guest-special-requests/${id}`, data),
    
    updateStatus: (id, status, notes) => 
        api.patch(`/guest-special-requests/${id}/status`, { status, notes }),
    
    delete: (id) => api.delete(`/guest-special-requests/${id}`),

    getById: (id) => 
        api.get(`/guest-special-requests/${id}`),

    getByGuest: (guestId) => 
        api.get(`/guest-special-requests/guest/${guestId}`),

};

export default guestRequestService;