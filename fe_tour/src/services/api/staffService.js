import api from "./axios";

const staffService = {
  /**
   * Lấy danh sách nhân viên
   */
  getAll: async (params = {}) => {
    return await api.get('/staff', { params });
  },

  /**
   * Lấy chi tiết nhân viên
   */
  getById: async (id) => {
    return await api.get(`/staff/${id}`);
  },

  /**
   * Lấy nhân viên theo loại
   */
  getByType: async (type, status = 'active') => {
    return await api.get(`/staff/type/${type}`, { params: { status } });
  },

  /**
   * Tìm nhân viên rảnh
   */
  findAvailable: async (startDate, endDate, staffType = null) => {
    const params = { start_date: startDate, end_date: endDate };
    if (staffType) params.staff_type = staffType;
    return await api.get('/staff/available', { params });
  },

  /**
   * Tạo nhân viên mới
   */
  create: async (data) => {
    return await api.post('/staff', data);
  },

  /**
   * Cập nhật nhân viên
   */
  update: async (id, data) => {
    return await api.put(`/staff/${id}`, data);
  },

  /**
   * Xóa nhân viên
   */
  delete: async (id) => {
    return await api.delete(`/staff/${id}`);
  },

  /**
   * Lấy lịch làm việc
   */
  getSchedule: async (id, startDate, endDate) => {
    return await api.get(`/staff/${id}/schedule`, {
      params: { start_date: startDate, end_date: endDate }
    });
  },

  /**
   * Thêm/Cập nhật lịch làm việc
   */
  addSchedule: async (id, scheduleData) => {
    return await api.post(`/staff/${id}/schedule`, scheduleData);
  },

  /**
   * Kiểm tra có rảnh không
   */
  checkAvailability: async (id, date) => {
    return await api.get(`/staff/${id}/availability`, {
      params: { date }
    });
  },

  /**
   * Lấy thống kê
   */
  getStats: async (id) => {
    return await api.get(`/staff/${id}/stats`);
  }
};

export default staffService;