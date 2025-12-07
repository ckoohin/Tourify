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

    /**
     * Helper: Lấy đường dẫn đầy đủ của ảnh QR Code
     * Backend lưu đường dẫn tương đối (vd: /qrcodes/abc.png) trong DB
     */
    getQrCodeImageUrl: (qrCodePath) => {
        if (!qrCodePath) return null;
        // Nếu đã là link đầy đủ (http...) thì trả về luôn, nếu không thì ghép với API URL
        if (qrCodePath.startsWith("http")) return qrCodePath;
        return `${getApiBaseUrl()}${qrCodePath}`;
    },

    /**
     * Helper: Lấy Booking URL từ dữ liệu tour
     * Ưu tiên lấy từ DB vì Backend đã sinh ra và lưu chính xác
     */
    getBookingUrl: (tour) => {
        return tour?.booking_url || "";
    },
};

export default tourService;
