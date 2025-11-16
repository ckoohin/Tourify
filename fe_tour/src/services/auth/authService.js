// fe_tour/src/services/authService.js
import api from '../api/axios';

/**
 * Service xử lý authentication
 */
const authService = {
  /**
   * Đăng nhập
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Đăng ký
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    
    if (response.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Cập nhật profile
   */
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    if (response.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Lấy user từ localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Lấy token
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;