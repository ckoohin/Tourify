import api from "./axios";

const customerService = {
    // Lấy danh sách (có tìm kiếm, lọc, phân trang)
    getAll: (params) => api.get("/customer", { params }),

    // Lấy tất cả danh sách khách hàng trong bảng quotes với status là sent
    getAllCustomerInQuotes: () => api.get("/customer/quotes"),

    // Lấy chi tiết
    getById: (id) => api.get(`/customer/${id}`),

    // Tạo mới
    create: (data) => api.post("/customer", data),

    // Cập nhật
    update: (id, data) => api.put(`/customer/${id}`, data),

    // Xóa
    delete: (id) => api.delete(`/customer/${id}`),

    // Xuất Excel
    exportExcel: async (params) => {
        return await api.get("/customer/export", {
            params,
            responseType: "blob",
        });
    },

    /**
     * @param {number} booking_id ID của Booking
     * @param {Array<Object>} guests Danh sách khách lẻ
     * @returns {Promise<Object>} 
     */
    createGuestsFromBooking: (booking_id, guests) => 
        api.post("/customer/from-booking", { booking_id, guests }),

    /**
     * (Route: GET /customer/from-booking/:booking_id)
     * @param {number} bookingId 
     * @returns {Promise<Object>}
     */
    getGuestsFromBooking: (booking_id) => 
        api.get(`/customer/from-booking/${booking_id}`),

    /**
     * (Route: GET /customer/booking-slots/:booking_id)
     * @param {number} bookingId 
     * @returns {Promise<Object>} 
     */
    checkBookingSlots: (booking_id) => 
        api.get(`/customer/booking-slots/${booking_id}`),

    /**
     * (Route: DELETE /customer/booking-guest/:booking_guest_id)
     * @param {number} bookingGuestId 
     * @returns {Promise<Object>}
     */
    deleteGuestFromBooking: (bookingGuestId) =>
        api.delete(`/customer/booking-guest/${bookingGuestId}`),
};

export default customerService;
