import api from './axios';

const reportService = {
  getTourProfit: (tourDepartureId) => api.get(`/reports/tour-profit/${tourDepartureId}`),
  getPeriodProfit: (params) => api.get('/reports/profit-by-period', { params }),
};

export default reportService;