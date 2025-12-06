import api from './axios';

const debtService = {
  getAll: (params) => api.get('/debts', { params }),
  
  getById: (id) => api.get(`/debts/${id}`),
  
  create: (data) => api.post('/debts', data),
  
  pay: (id, amount) => api.patch(`/debts/${id}/pay`, { paid_amount: amount }),
  
  getSummary: (params) => api.get('/debts/summary', { params }),
  
  getUpcoming: (days) => api.get('/debts/upcoming', { params: { days } }),
};

export default debtService;