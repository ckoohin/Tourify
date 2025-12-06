import api from './axios'; 

const tourService = {
  // =================================================================
  // 1. QUẢN LÝ TOUR (Cơ bản)
  // =================================================================
  getTours: (params = {}) => {
    // Hỗ trợ tìm kiếm và lọc
    if (params.keyword) {
      return api.get('/tours/search/', { params: { keyword: params.keyword } });
    }
    return api.get('/tours', { params });
  },
  
  getTourById: (id) => api.get(`/tours/${id}`),
  
  createTour: (data) => api.post('/tours', data),
  
  updateTour: (id, data) => api.put(`/tours/${id}`, data),
  
  deleteTour: (id) => api.delete(`/tours/${id}`),

  cloneTour: (id, data) => api.post(`/tours/${id}/clone`, data),

  // =================================================================
  // 2. QUẢN LÝ DANH MỤC
  // =================================================================
  getCategories: (params = {}) => api.get('/tour-categories', { params }),

  // =================================================================
  // 3. QUẢN LÝ ẢNH TOUR
  // =================================================================
  uploadTourImage: (formData) => api.post('/tours-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // =================================================================
  // 4. QUẢN LÝ PHIÊN BẢN TOUR (VERSIONS)
  // =================================================================
  // Lấy danh sách version của 1 tour
  // BE: tourVersionController trả về { data: { tourVersions: [] } }
  getVersions: (tourId) => api.get('/tours-version', { params: { tour_id: tourId } }),
  
  createVersion: (data) => api.post('/tours-version', data),
  
  updateVersion: (id, data) => api.put(`/tours-version/${id}`, data),
  
  deleteVersion: (id) => api.delete(`/tours-version/${id}`),

  // =================================================================
  // 5. QUẢN LÝ GIÁ TOUR (PRICES)
  // =================================================================
  getPrices: (params) => api.get('/tours-price', { params }),

  // [MỚI] Hàm gọi API lấy giá theo version ID (Khớp với route BE /tour-version/:id)
  getPricesByVersion: (versionId) => api.get(`/tours-price/tour-version/${versionId}`),
  
  getPriceById: (id) => api.get(`/tours-price/${id}`),
  
  createPrice: (data) => api.post('/tours-price', data),
  
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
    return api.post('/tour-itineraries', data);
  },

  updateItinerary: (id, data) => {
    return api.put(`/tour-itineraries/${id}`, data);
  },

  deleteItinerary: (id) => {
    return api.delete(`/tour-itineraries/${id}`);
  },

  deleteAllItineraries: (tourVersionId) => {
    return api.delete(`/tour-itineraries/tour-version/${tourVersionId}/all`);
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
    return api.post('/tour-policies', data);
  },

  updatePolicy: (id, data) => {
    return api.put(`/tour-policies/${id}`, data);
  },

  deletePolicy: (id) => {
    return api.delete(`/tour-policies/${id}`);
  },

  updatePolicyStatus: (id, isActive) => {
    return api.patch(`/tour-policies/${id}/status`, { is_active: isActive });
  },

  updatePolicyOrder: (id, order) => {
    return api.patch(`/tour-policies/${id}/display-order`, { display_order: order });
  }
};

export default tourService;
