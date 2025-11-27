import api from './axios';

const permissionService = {
  // --- QUẢN LÝ QUYỀN HẠN (PERMISSIONS) ---

  // Lấy danh sách tất cả quyền (cho Admin quản lý)
  getAllPermissions: async (params) => {
    return await api.get('/permissions', { params });
  },

  // Lấy chi tiết 1 quyền
  getPermissionById: async (id) => {
    return await api.get(`/permissions/${id}`);
  },

  // Tạo quyền mới
  createPermission: async (data) => {
    return await api.post('/permissions', data);
  },

  // Cập nhật quyền
  updatePermission: async (id, data) => {
    return await api.put(`/permissions/${id}`, data);
  },

  // Xóa quyền
  deletePermission: async (id) => {
    return await api.delete(`/permissions/${id}`);
  },

  // (Optional) Helper lấy quyền theo Role ID - Thường dùng để check quyền nhanh
  getPermissionsByRole: async (roleId) => {
    return await api.get(`/roles/${roleId}/permissions`);
  }
};

export default permissionService;