import api from './axios';

const roleService = {
  getAllRoles: async (params) => {
    return await api.get('/roles', { params });
  },

  getRoleById: async (id) => {
    return await api.get(`/roles/${id}`);
  },

  createRole: async (data) => {
    return await api.post('/roles', data);
  },

  updateRole: async (id, data) => {
    return await api.put(`/roles/${id}`, data);
  },

  deleteRole: async (id) => {
    return await api.delete(`/roles/${id}`);
  },

  getRolePermissions: async (roleId) => {
    return await api.get(`/permission-roles/roles/${roleId}/permissions`);
  },
  
  // Gán quyền
  assignPermissions: async (roleId, permissionIds) => {
    return await api.post(`/permission-roles/roles/${roleId}/permissions`, { permissionIds });
  },

  // Thu hồi quyền
  revokePermissions: async (roleId, permissionIds) => {
    return await api.delete(`/permission-roles/roles/${roleId}/permissions`, {
      data: { permissionIds }
    });
  }
};

export default roleService;