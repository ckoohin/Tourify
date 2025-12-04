import api from './axios';

const departureService = {
  getAll: (params) => api.get('/departures', { params }),
  
  getById: (id) => api.get(`/departures/${id}`),
  
  create: (data) => api.post('/departures', data),
  
  update: (id, data) => api.put(`/departures/${id}`, data),
  
  delete: (id) => api.delete(`/departures/${id}`),
  
  updateStatus: (id, status) => api.patch(`/departures/${id}/status`, { status }),
  
  getGuests: (id, params) => api.get(`/departures/${id}/guests`, { params }),
  
  checkInGuest: (id, guestId) => api.patch(`/departures/${id}/guests/${guestId}/check-in`),
  
  assignRoom: (id, guestId, data) => api.patch(`/departures/${id}/guests/${guestId}/assign-room`, data),
};

export default departureService;