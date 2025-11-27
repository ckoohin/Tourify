import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth/authService';
import ApiHelper from '../utils/api';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Hàm lấy quyền của 1 role (để hiển thị số lượng quyền)
  const getRolePermissions = async (roleId) => {
    try {
      // FIX: Xóa /api/v1 (Axios đã tự thêm)
      const res = await ApiHelper.get(`/roles/${roleId}/permissions`);
      
      if (res.success && res.data?.permissions && Array.isArray(res.data.permissions)) {
        return res.data.permissions;
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      if (!authService.isAuthenticated()) return;

      // FIX: Xóa /api/v1
      const response = await ApiHelper.get('/roles');

      if (response.success && response.data) {
        // Xử lý dữ liệu trả về (mảng hoặc object phân trang)
        const rawRoles = Array.isArray(response.data) ? response.data : (response.data.data || []);

        const rolesWithCount = await Promise.all(
          rawRoles.map(async (role) => {
            const perms = await getRolePermissions(role.id);
            return {
              ...role,
              permission_count: perms.length,
            };
          })
        );

        setRoles(rolesWithCount);
      } else {
        console.error('Lỗi tải roles:', response.message);
      }
    } catch (error) {
      console.error('Lỗi tải roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (data) => {
    try {
      // FIX: Xóa /api/v1
      const res = await ApiHelper.post('/roles', data);
      if (res.success) {
        await fetchRoles();
        return true;
      }
      alert(res.message);
      return false;
    } catch (e) {
      alert(e.message);
      return false;
    }
  };

  const updateRole = async (id, data) => {
    try {
      const updateData = { name: data.name, slug: data.slug, description: data.description };
      // FIX: Xóa /api/v1 và dùng PUT
      const res = await ApiHelper.put(`/roles/${id}`, updateData);
      if (res.success) {
        await fetchRoles();
        return true;
      }
      alert(res.message);
      return false;
    } catch (e) {
      alert(e.message);
      return false;
    }
  };

  const deleteRole = async (role) => {
    if (!role?.id || !confirm(`Xóa vai trò "${role.name}"?`)) return;
    try {
      // FIX: Xóa /api/v1
      const res = await ApiHelper.delete(`/roles/${role.id}`);
      if (res.success) {
        await fetchRoles();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const assignPermissionToRole = async (roleId, permissionId) => {
    try {
      const existing = await getRolePermissions(roleId);
      if (existing.some((p) => p.id === Number(permissionId))) {
         alert('Quyền đã tồn tại');
         return false;
      }
      // FIX: Xóa /api/v1 và gửi mảng permissionIds
      const res = await ApiHelper.post(`/roles/${roleId}/permissions`, {
        permissionIds: [Number(permissionId)], 
      });
      
      if (res.success) {
        await fetchRoles(); 
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const revokePermissionFromRole = async (roleId, permissionId) => {
    try {
      // FIX: Xóa /api/v1 và dùng DELETE kèm body data
      const res = await ApiHelper.delete(`/roles/${roleId}/permissions`, {
        data: {
            permissionIds: [Number(permissionId)]
        }
      });

      if (res.success) {
        await fetchRoles();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      role.name.toLowerCase().includes(q) ||
      role.slug.toLowerCase().includes(q) ||
      (role.description && role.description.toLowerCase().includes(q))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  return {
    roles, currentRoles, loading, currentPage, searchQuery, totalPages,
    setSearchQuery, setCurrentPage, fetchRoles,
    createRole, updateRole, deleteRole,
    assignPermissionToRole, revokePermissionFromRole, getRolePermissions,
  };
}