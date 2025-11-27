import api from './axios';

const roleService = {
  // --- QUẢN LÝ VAI TRÒ (ROLES) ---
  
  // Lấy danh sách vai trò (có phân trang/tìm kiếm)
  getAllRoles: async (params) => {
    return await api.get('/roles', { params });
  },

  // Lấy chi tiết 1 vai trò
  getRoleById: async (id) => {
    return await api.get(`/roles/${id}`);
  },

  // Tạo vai trò mới
  createRole: async (data) => {
    return await api.post('/roles', data);
  },

  // Cập nhật vai trò
  updateRole: async (id, data) => {
    return await api.put(`/roles/${id}`, data);
  },

  // Xóa vai trò
  deleteRole: async (id) => {
    return await api.delete(`/roles/${id}`);
  },

  // --- QUẢN LÝ PHÂN QUYỀN CHO VAI TRÒ (ASSIGNMENT) ---

  // Lấy danh sách quyền hiện có của một role
  getRolePermissions: async (roleId) => {
    return await api.get(`/roles/${roleId}/permissions`);
  },
  
  // Gán quyền (Thêm quyền vào role)
  assignPermissions: async (roleId, permissionIds) => {
    return await api.post(`/roles/${roleId}/permissions`, { permissionIds });
  },

  // Thu hồi quyền (Xóa quyền khỏi role)
  revokePermissions: async (roleId, permissionIds) => {
    // Lưu ý: Axios delete cần bọc body trong property `data`
    return await api.delete(`/roles/${roleId}/permissions`, {
      data: { permissionIds }
    });
  }
};

export default roleService;