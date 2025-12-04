import api from './axios';

const tourLogService = {
  getByDepartureId: (departureId, params = {}) => 
    api.get(`/tour-logs/departure/${departureId}`, { params }),

  getStats: (departureId) => api.get(`/tour-logs/departure/${departureId}/stats`),

  create: (data) => api.post('/tour-logs', data),
  
  update: (id, data) => api.put(`/tour-logs/${id}`, data),
  
  delete: (id) => api.delete(`/tour-logs/${id}`),
  
  getById: (id) => api.get(`/tour-logs/${id}`),
};

export default tourLogService;