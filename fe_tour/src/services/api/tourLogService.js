import api from './axios';

const tourLogService = {

  getByDepartureId: (departureId, params = {}) => 
    api.get(`/tour-logs/departure/${departureId}`, { params }),

  getLogs: (departureId, params) => api.get(`/departures/${departureId}/logs`, { params }),
  
  getStats: (departureId) => api.get(`/departures/${departureId}/logs/stats`),

  create: (data) => api.post('/tour-logs', data),
  
  update: (id, data) => api.put(`/tour-logs/${id}`, data),
  
  delete: (id) => api.delete(`/tour-logs/${id}`),
  
  getById: (id) => api.get(`/tour-logs/${id}`),
};

export default tourLogService;