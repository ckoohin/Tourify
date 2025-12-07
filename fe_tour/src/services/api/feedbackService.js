import api from './axios';

const feedbackService = {
  // =================================================================
  // 1. QUẢN LÝ PHẢN HỒI (CRUD CƠ BẢN)
  // =================================================================

  /**
   * Lấy danh sách phản hồi (có phân trang & lọc)
   * @param {object} params 
   */
  getAll: (params = {}) => api.get('/feedbacks', { params }),

  /**
   * Lấy chi tiết phản hồi theo ID
   * @param {number} id 
   */
  getById: (id) => api.get(`/feedbacks/${id}`),

  /**
   * Tạo phản hồi mới
   * @param {object} data - { subject, content, feedback_type, priority, ... }
   */
  create: (data) => api.post('/feedbacks', data),

  /**
   * Cập nhật nội dung phản hồi
   * @param {number} id 
   * @param {object} data - { subject, content, priority, status, assigned_to }
   */
  update: (id, data) => api.put(`/feedbacks/${id}`, data),

  /**
   * Xóa phản hồi
   * @param {number} id 
   */
  delete: (id) => api.delete(`/feedbacks/${id}`),

  // =================================================================
  // 2. XỬ LÝ QUY TRÌNH (WORKFLOW)
  // =================================================================

  /**
   * Cập nhật trạng thái xử lý (Open -> In Progress -> Resolved -> Closed)
   * @param {number} id 
   * @param {string} status - 'open' | 'in_progress' | 'resolved' | 'closed'
   */
  updateStatus: (id, status) => api.patch(`/feedbacks/${id}/status`, { status }),

  /**
   * Phân công người xử lý phản hồi
   * @param {number} id 
   * @param {number} assignedToId - ID của nhân viên được gán
   */
  assign: (id, assignedToId) => api.patch(`/feedbacks/${id}/assign`, { assigned_to: assignedToId }),

  // =================================================================
  // 3. LỌC CÁ NHÂN HÓA (PERSONALIZED)
  // =================================================================

  /**
   * Lấy danh sách phản hồi do tôi tạo
   * @param {object} params - { page, limit, status, priority... }
   */
  getMyFeedbacks: (params = {}) => api.get('/feedbacks/my-feedbacks', { params }),

  /**
   * Lấy danh sách phản hồi được gán cho tôi xử lý
   * @param {object} params - { page, limit, status, priority... }
   */
  getAssignedToMe: (params = {}) => api.get('/feedbacks/assigned-to-me', { params }),

  // =================================================================
  // 4. THỐNG KÊ & BÁO CÁO (STATS)
  // =================================================================

  /**
   * Lấy thống kê tổng quan theo loại phản hồi
   */
  getStats: () => api.get('/feedbacks/stats'),

  /**
   * Lấy thống kê phản hồi của một nhà cung cấp cụ thể
   * @param {number} supplierId 
   */
  getStatsBySupplier: (supplierId) => api.get(`/feedbacks/stats/supplier/${supplierId}`),
};

export default feedbackService;