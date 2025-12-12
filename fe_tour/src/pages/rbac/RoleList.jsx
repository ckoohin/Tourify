import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import roleService from '../../services/api/roleService';
import permissionService from '../../services/api/permissionService';
import { useAuth } from '../../context/AuthContext'; 

import RoleTable from '../../components/rbac/RoleTable';
import RoleModal from '../../components/rbac/RoleModal';
import RoleAssignmentModal from '../../components/rbac/RoleAssignmentModal';

const RoleList = () => {
  const { user, refreshPermissions } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissionIds, setRolePermissionIds] = useState([]); 
  const [originalPermissionIds, setOriginalPermissionIds] = useState([]); 
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await roleService.getAllRoles({ limit: 100 });
      if (res.success) setRoles(res.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleSaveRole = async (data) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, data);
        toast.success('Cập nhật thành công');
      } else {
        await roleService.createRole(data);
        toast.success('Tạo vai trò thành công');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleDeleteRole = (id) => {
    toast((t) => (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-sm">Bạn chắc chắn muốn xóa vai trò này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded text-xs"
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await roleService.deleteRole(id);
                toast.success('Đã xóa vai trò');
                fetchRoles();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Không thể xóa');
              }
            }}
          >
            Xóa
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ), {
      position: 'top-center',
      duration: 5000,
    });
  };

  const openAssignModal = async (role) => {
    setSelectedRole(role);
    setShowAssignModal(true);
    setAssignLoading(true);
    setRolePermissionIds([]); 
    setOriginalPermissionIds([]);

    try {
      const permRes = await permissionService.getAllPermissions({ limit: 100 });
      if (permRes.success) {
        const perms = Array.isArray(permRes.data) ? permRes.data : (permRes.data.permissions || permRes.data.data || []);
        setAllPermissions(perms);
      } else {
        toast.error("Không thể tải danh sách quyền hệ thống");
      }

      const roleRes = await roleService.getRolePermissions(role.id);
      if (roleRes.success && roleRes.data && Array.isArray(roleRes.data.permissions)) {
        const currentIds = roleRes.data.permissions.map(p => p.id);
        setRolePermissionIds(currentIds);
        setOriginalPermissionIds(currentIds);
      }
    } catch (error) {
      console.error("Lỗi load quyền:", error);
      toast.error("Lỗi kết nối server khi lấy dữ liệu quyền");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleTogglePermission = (id) => {
    setRolePermissionIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSaveAssignment = async () => {
    if (!selectedRole) return;
    setAssignLoading(true);
    try {
      const toAdd = rolePermissionIds.filter(id => !originalPermissionIds.includes(id));
      const toRemove = originalPermissionIds.filter(id => !rolePermissionIds.includes(id));

      const promises = [];
      if (toAdd.length > 0) promises.push(roleService.assignPermissions(selectedRole.id, toAdd));
      if (toRemove.length > 0) promises.push(roleService.revokePermissions(selectedRole.id, toRemove));

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        
        const hasError = results.some(res => !res || !res.success);

        if (hasError) {
          const errorMsg = results.find(res => !res.success)?.message || 'Lỗi lưu dữ liệu vào hệ thống';
          console.error("Chi tiết lỗi API:", results);
          toast.error(`Thất bại: ${errorMsg}`);
        } else {
          toast.success('Cập nhật phân quyền thành công!');
          fetchRoles(); 
          
          if (user && user.role_id === selectedRole.id) {
             await refreshPermissions(); 
             toast('Giao diện đã được cập nhật theo quyền mới', { icon: '🔄' });
          }
          setShowAssignModal(false);
        }
      } else {
        toast('Không có thay đổi nào', { icon: 'ℹ️' });
        setShowAssignModal(false);
      }
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Lỗi hệ thống khi lưu quyền');
    } finally {
      setAssignLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">Danh sách Vai trò (Roles)</h3>
        <button 
          onClick={() => { setEditingRole(null); setShowModal(true); }} 
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Tạo vai trò mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <RoleTable 
          roles={roles}
          onEdit={(r) => { setEditingRole(r); setShowModal(true); }}
          onDelete={handleDeleteRole}
          onAssign={openAssignModal}
        />
      )}

      <RoleModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={handleSaveRole}
        initialData={editingRole}
      />

      <RoleAssignmentModal 
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSave={handleSaveAssignment}
        roleName={selectedRole?.name}
        roleSlug={selectedRole?.slug} 
        allPermissions={allPermissions}
        selectedIds={rolePermissionIds}
        onToggle={handleTogglePermission}
        loading={assignLoading}
      />
    </div>
  );
};

export default RoleList;