import api from './axios';

const permissionService = {
  getAllPermissions: async (params) => {
    return await api.get('/permissions', { params });
  },

  getPermissionById: async (id) => {
    return await api.get(`/permissions/${id}`);
  },

  createPermission: async (data) => {
    return await api.post('/permissions', data);
  },

  updatePermission: async (id, data) => {
    return await api.put(`/permissions/${id}`, data);
  },

  deletePermission: async (id) => {
    return await api.delete(`/permissions/${id}`);
  },

  getPermissionsByRole: async (roleId) => {
    return await api.get(`/permission-roles/roles/${roleId}/permissions`);
  }
};

export default permissionService;