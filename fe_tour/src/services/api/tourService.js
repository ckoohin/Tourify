import api from "./axios";

const getApiBaseUrl = () => {
    let apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    if (apiBase.endsWith("/api/v1")) {
        apiBase = apiBase.replace("/api/v1", "");
    }
    return apiBase;
};

const tourService = {
    // =================================================================
    // 1. QUẢN LÝ TOUR (Cơ bản)
    // =================================================================
    getTours: (params = {}) => {
        if (params.keyword) {
            return api.get("/tours/search/", {
                params: { keyword: params.keyword },
            });
        }
        return api.get("/tours", { params });
    },

    getTourById: (id) => api.get(`/tours/${id}`),

    createTour: (data) => api.post("/tours", data),

    updateTour: (id, data) => api.put(`/tours/${id}`, data),

    deleteTour: (id) => api.delete(`/tours/${id}`),

    cloneTour: (id, data) => api.post(`/tours/${id}/clone`, data),

    // =================================================================
    // 2. QUẢN LÝ DANH MỤC
    // =================================================================
    getCategories: (params = {}) => api.get("/tour-categories", { params }),

    // =================================================================
    // 3. QUẢN LÝ ẢNH TOUR
    // =================================================================
    uploadTourImage: (formData) =>
        api.post("/tours-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // =================================================================
    // 4. QUẢN LÝ PHIÊN BẢN TOUR (VERSIONS)
    // =================================================================
    getVersions: (tourId) =>
        api.get("/tours-version", { params: { tour_id: tourId } }),

    getVersionById: (id) => api.get(`/tours-version/${id}`),

    createVersion: (data) => api.post("/tours-version", data),

    updateVersion: (id, data) => api.put(`/tours-version/${id}`, data),

    deleteVersion: (id) => api.delete(`/tours-version/${id}`),

    // =================================================================
    // 5. QUẢN LÝ GIÁ TOUR (PRICES)
    // =================================================================
    getPrices: (params) => api.get("/tours-price", { params }),

    getPricesByVersion: (versionId) =>
        api.get(`/tours-price/tour-version/${versionId}`),

    getPriceById: (id) => api.get(`/tours-price/${id}`),

    createPrice: (data) => api.post("/tours-price", data),

    updatePrice: (id, data) => api.put(`/tours-price/${id}`, data),

    deletePrice: (id) => api.delete(`/tours-price/${id}`),

    // =================================================================
    // 6. QUẢN LÝ LỊCH TRÌNH
    // =================================================================
    getItineraries: (tourVersionId) => {
        return api.get(`/tour-itineraries/tour-version/${tourVersionId}`);
    },

    getItineraryById: (id) => {
        return api.get(`/tour-itineraries/${id}`);
    },

    createItinerary: (data) => {
        return api.post("/tour-itineraries", data);
    },

    updateItinerary: (id, data) => {
        return api.put(`/tour-itineraries/${id}`, data);
    },

    deleteItinerary: (id) => {
        return api.delete(`/tour-itineraries/${id}`);
    },

    deleteAllItineraries: (tourVersionId) => {
        return api.delete(
            `/tour-itineraries/tour-version/${tourVersionId}/all`
        );
    },

    // =================================================================
    // 7. QUẢN LÝ CHÍNH SÁCH
    // =================================================================
    getPolicies: (tourId, type = null) => {
        const params = type ? { type } : {};
        return api.get(`/tour-policies/tour/${tourId}`, { params });
    },

    getPolicyById: (id) => {
        return api.get(`/tour-policies/${id}`);
    },

    createPolicy: (data) => {
        return api.post("/tour-policies", data);
    },

    updatePolicy: (id, data) => {
        return api.put(`/tour-policies/${id}`, data);
    },

    deletePolicy: (id) => {
        return api.delete(`/tour-policies/${id}`);
    },

    updatePolicyStatus: (id, isActive) => {
        return api.patch(`/tour-policies/${id}/status`, {
            is_active: isActive,
        });
    },

    updatePolicyOrder: (id, order) => {
        return api.patch(`/tour-policies/${id}/display-order`, {
            display_order: order,
        });
    },


    getQrCodeImageUrl: (qrCodePath) => {
        if (!qrCodePath) return null;
        if (qrCodePath.startsWith("http")) return qrCodePath;
        return `${getApiBaseUrl()}${qrCodePath}`;
    },

    getBookingUrl: (tour) => {
        return tour?.booking_url || "";
    },

    // =================================================================
    // 9. QUẢN LÝ HOẠT ĐỘNG LỊCH TRÌNH CHI TIẾT (ITINERARY ACTIVITIES)
    // =================================================================
    
    // Lấy hoạt động theo ngày lịch trình (Itinerary ID)
    getActivitiesByItinerary: (itineraryId) => 
        api.get(`/itinerary-activities/itinerary/${itineraryId}`),

    // Lấy tất cả hoạt động của một phiên bản tour
    getActivitiesByTourVersion: (tourVersionId) => 
        api.get(`/itinerary-activities/tour-version/${tourVersionId}`),

    // Lấy chi tiết một hoạt động
    getActivityById: (id) => 
        api.get(`/itinerary-activities/${id}`),

    // Tạo hoạt động mới (Chi tiết giờ giấc, địa điểm...)
    createActivity: (data) => 
        api.post('/itinerary-activities', data),

    // Cập nhật hoạt động
    updateActivity: (id, data) => 
        api.put(`/itinerary-activities/${id}`, data),

    // Xóa hoạt động
    deleteActivity: (id) => 
        api.delete(`/itinerary-activities/${id}`),

    // Cập nhật trạng thái hoạt động (not_started, in_progress, closed, cancelled)
    updateActivityStatus: (id, status) => 
        api.patch(`/itinerary-activities/${id}/status`, { status }),

    // Kích hoạt tự động cập nhật trạng thái cho 1 chuyến đi (dựa trên giờ hiện tại)
    autoUpdateActivityStatus: (departureId) => 
        api.post(`/itinerary-activities/departures/${departureId}/auto-update-status`),

    // Lấy danh sách hoạt động theo ngày thực tế của chuyến đi (cho màn hình vận hành)
    getActivitiesByDepartureDate: (departureId, date) => 
        api.get(`/itinerary-activities/departures/${departureId}/by-date`, { params: { date } }),


    // =================================================================
    // 10. QUẢN LÝ ĐIỂM DANH (ACTIVITY CHECK-IN)
    // =================================================================

    // Khởi tạo danh sách điểm danh cho toàn bộ khách trong chuyến đi
    initializeCheckins: (departureId) => 
        api.post(`/activity-checkins/departures/${departureId}/initialize`),

    // Lấy thống kê điểm danh (Tổng, Đã check-in, Vắng...)
    getCheckinStats: (departureId) => 
        api.get(`/activity-checkins/departures/${departureId}/stats`),

    // Lấy danh sách các hoạt động ĐANG DIỄN RA cần điểm danh ngay
    getActiveCheckins: (departureId) => 
        api.get(`/activity-checkins/departures/${departureId}/active`),

    // Lấy danh sách hoạt động của ngày HÔM NAY kèm trạng thái điểm danh
    getTodayCheckinActivities: (departureId) => 
        api.get(`/activity-checkins/departures/${departureId}/today`),

    // Lấy danh sách check-in chi tiết theo ngày cụ thể
    getCheckinsByDate: (departureId, date) => 
        api.get(`/activity-checkins/departures/${departureId}/by-date`, { params: { date } }),

    // Chạy tiến trình tự động (Auto Check-in & Mark Missed) - Dành cho admin/test
    runAutoCheckinProcess: () => 
        api.post('/activity-checkins/auto-process'),

    // Lấy danh sách khách của một hoạt động cụ thể để điểm danh
    getCheckinsByActivity: (departureId, activityId) => 
        api.get(`/activity-checkins/departures/${departureId}/activities/${activityId}`),

    // Điểm danh hàng loạt (Chọn nhiều khách -> Check-in)
    bulkCheckIn: (departureId, activityId, guestIds) => 
        api.post(`/activity-checkins/departures/${departureId}/activities/${activityId}/bulk-checkin`, { guestIds }),

    // Lấy lịch sử điểm danh của một khách hàng
    getCheckinHistoryByGuest: (guestId) => 
        api.get(`/activity-checkins/guests/${guestId}`),

    // Điểm danh lẻ từng khách (có thể kèm tọa độ GPS)
    checkInSingleGuest: (checkinId, location = null) => 
        api.patch(`/activity-checkins/checkins/${checkinId}/check-in`, { location }),

    // Đánh dấu khách vắng mặt có phép
    markGuestExcused: (checkinId, excuseReason) => 
        api.patch(`/activity-checkins/checkins/${checkinId}/excuse`, { excuse_reason: excuseReason }),

};

export default tourService;
