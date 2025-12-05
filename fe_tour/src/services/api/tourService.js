import api from "../api/axios"; // Đảm bảo đường dẫn đúng tới file axios.js

const tourService = {
    // --- TOUR ---
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

    // [THÊM MỚI] Hàm Clone Tour
    cloneTour: (id, data) => api.post(`/tours/${id}/clone`, data),

    // --- DANH MỤC ---
    getCategories: (params = {}) => api.get("/tour-categories", { params }),

    // --- ẢNH ---
    uploadTourImage: (formData) =>
        api.post("/tours-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // --- VERSION ---
    getVersions: (tourId) =>
        api.get("/tours-version", { params: { tour_id: tourId } }),
    createVersion: (data) => api.post("/tours-version", data),
    updateVersion: (id, data) => api.put(`/tours-version/${id}`, data),
    deleteVersion: (id) => api.delete(`/tours-version/${id}`),

    // --- GIÁ ---
    getPrices: (params) => api.get("/tours-price", { params }),

    getPriceById: (id) => api.get(`/tours-price/${id}`),

    // Lấy giá theo tour tour_version_id;
    getPriceByVersionID: (id) => api.get(`/tours-price/tour-version/${id}`),

    createPrice: (data) => api.post("/tours-price", data),

    updatePrice: (id, data) => api.put(`/tours-price/${id}`, data),

    deletePrice: (id) => api.delete(`/tours-price/${id}`),
};

export default tourService;
