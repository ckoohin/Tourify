import api from './axios';

export const tourService = {
  // Get all tours
  getTours: (params) => api.get('/tours', { params }),
  
  // Get tour by ID
  getTourById: (id) => api.get(`/tours/${id}`),
  
  // Create tour
  createTour: (data) => api.post('/tours', data),
  
  // Update tour
  updateTour: (id, data) => api.put(`/tours/${id}`, data),
  
  // Delete tour
  deleteTour: (id) => api.delete(`/tours/${id}`),
  
  // Clone tour
  cloneTour: (id) => api.post(`/tours/${id}/clone`),
  
  // Get tour departures
  getDepartures: (tourId) => api.get(`/tours/${tourId}/departures`),
};