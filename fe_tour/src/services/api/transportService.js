import api from './axios';

const transportService = {
    // --- TOUR TRANSPORTS (Quản lý xe/vé) ---
    
    // Lấy danh sách phương tiện theo chuyến đi
    getByDeparture: (departureId) => 
        api.get(`/tour-transports/tour-departure/${departureId}`),

    getById: (id) => api.get(`/tour-transports/${id}`),

    // Lấy thông tin ghế trống (API BE cung cấp nhưng FE chưa dùng)
    getAvailableSeats: (id) => 
        api.get(`/tour-transports/${id}/available-seats`),

    create: (data) => api.post('/tour-transports', data),

    update: (id, data) => api.put(`/tour-transports/${id}`, data),

    delete: (id) => api.delete(`/tour-transports/${id}`),

    updateBookingStatus: (id, status, reference) => 
        api.patch(`/tour-transports/${id}/booking-status`, { 
            booking_status: status, 
            booking_reference: reference 
        }),

    // --- ASSIGNMENTS (Xếp chỗ & Vé) ---

    getAssignmentsByTransport: (transportId) => 
        api.get(`/transport-guest-assignments/transport/${transportId}`),

    // Xếp 1 khách (Create Assignment)
    assignGuest: (data) => api.post('/transport-guest-assignments', data),

    // Cập nhật thông tin vé/ghế (Update Assignment)
    updateAssignment: (id, data) => api.put(`/transport-guest-assignments/${id}`, data),

    // Xếp nhiều khách cùng lúc (Bulk)
    bulkAssign: (assignments) => api.post('/transport-guest-assignments/bulk', { assignments }),

    unassignGuest: (id) => api.delete(`/transport-guest-assignments/${id}`),

    getUsedSeats: (transportId) => 
        api.get(`/transport-guest-assignments/transport/${transportId}/used-seats`),
};

export default transportService;