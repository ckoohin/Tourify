import api from '../api/axios';

const permissionService = {
  // Lấy danh sách quyền của một Role cụ thể
  getPermissionsByRole: async (roleId) => {
    // Endpoint dựa trên file permissionRoleRoutes.js bạn gửi
    return await api.get(`/roles/${roleId}/permissions`);
  },
  
  // Lấy tất cả quyền (Dành cho trang quản lý phân quyền của Admin)
  getAllPermissions: async () => {
    return await api.get('/permissions');
  }
};

export default permissionService;