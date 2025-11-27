import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import permissionService from '../../services/api/permissionService';
import PermissionTable from '../../components/rbac/PermissionTable';
import PermissionModal from '../../components/rbac/PermissionModal';

const PermissionList = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await permissionService.getAllPermissions({ limit: 100 });
      if (res.success) setPermissions(res.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await permissionService.updatePermission(editingItem.id, data);
        toast.success('Cập nhật quyền thành công');
      } else {
        await permissionService.createPermission(data);
        toast.success('Tạo quyền mới thành công');
      }
      setShowModal(false);
      fetchPermissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (id) => {
    // Gọi Custom Toast Confirm
    toast((t) => (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-sm">Bạn có chắc chắn muốn xóa quyền này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="btn-confirm" 
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await permissionService.deletePermission(id);
                toast.success('Xóa thành công');
                fetchPermissions();
              } catch (error) {
                toast.error('Không thể xóa quyền đang được sử dụng');
              }
            }}
          >
            Xóa
          </button>
          <button
            className="btn-cancel" 
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ), {
      className: 'my-toast-confirm',
      position: 'top-center',
      duration: 5000,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">Danh sách Quyền hạn (Permissions)</h3>
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Tạo quyền mới
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : (
        <PermissionTable 
          permissions={permissions}
          onEdit={(p) => { setEditingItem(p); setShowModal(true); }}
          onDelete={handleDelete}
        />
      )}

      <PermissionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
        initialData={editingItem}
      />
    </div>
  );
};

export default PermissionList;