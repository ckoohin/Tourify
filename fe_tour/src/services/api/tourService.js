import api from '../api/axios'; // Đảm bảo đường dẫn đúng tới file axios.js

const tourService = {
  // --- TOUR ---
  getTours: (params = {}) => {
    if (params.keyword) {
      return api.get('/tours/search/', { params: { keyword: params.keyword } });
    }
    return api.get('/tours', { params });
  },
  
  getTourById: (id) => api.get(`/tours/${id}`),
  createTour: (data) => api.post('/tours', data),
  updateTour: (id, data) => api.put(`/tours/${id}`, data),
  deleteTour: (id) => api.delete(`/tours/${id}`),

  // --- DANH MỤC ---
  getCategories: (params = {}) => api.get('/tour-categories', { params }),

  // --- ẢNH ---
  uploadTourImage: (formData) => api.post('/tours-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // --- VERSION ---
  createVersion: (data) => api.post('/tours-version', data),
  updateVersion: (id, data) => api.put(`/tours-version/${id}`, data),
  deleteVersion: (id) => api.delete(`/tours-version/${id}`),

  // --- GIÁ ---
  createPrice: (data) => api.post('/tours-price', data),
  updatePrice: (id, data) => api.put(`/tours-price/${id}`, data),
  deletePrice: (id) => api.delete(`/tours-price/${id}`),
};

export default tourService;