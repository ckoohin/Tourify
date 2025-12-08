import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import permissionService from "../../services/api/permissionService";
import PermissionTable from "../../components/rbac/PermissionTable";
import PermissionModal from "../../components/rbac/PermissionModal";

const PermissionList = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPermissions = async (page = currentPage, itemsPerPage = limit) => {
    setLoading(true);
    try {
      const res = await permissionService.getAllPermissions({
        page: page,
        limit: itemsPerPage,
      });

      if (res.success && res.data && res.pagination) {
        setPermissions(res.data);

        const { currentPage, limit, totalItems, totalPages } = res.pagination;

        setCurrentPage(currentPage);
        setLimit(limit);
        setTotalPages(totalPages);
        setTotalItems(totalItems);
      } else {
        setPermissions([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách quyền", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions(currentPage, limit);
  }, [currentPage, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await permissionService.updatePermission(editingItem.id, data);
        toast.success("Cập nhật quyền thành công");
      } else {
        await permissionService.createPermission(data);
        toast.success("Tạo quyền mới thành công");
      }
      setShowModal(false);
      fetchPermissions(currentPage, limit);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex items-center justify-between w-full gap-2">
          <span className="text-sm">Bạn có chắc chắn muốn xóa quyền này?</span>
          <div className="flex gap-2 shrink-0">
            <button
              className="btn-confirm"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await permissionService.deletePermission(id);
                  toast.success("Xóa thành công");
                  fetchPermissions(currentPage, limit);
                } catch (error) {
                  toast.error("Không thể xóa quyền đang được sử dụng", error);
                }
              }}
            >
              Xóa
            </button>
            <button className="btn-cancel" onClick={() => toast.dismiss(t.id)}>
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        className: "my-toast-confirm",
        position: "top-center",
        duration: 5000,
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">
          Danh sách Quyền hạn (Permissions) - Tổng: {totalItems}
        </h3>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Tạo quyền mới
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : (
        <>
          <PermissionTable
            permissions={permissions}
            onEdit={(p) => {
              setEditingItem(p);
              setShowModal(true);
            }}
            onDelete={handleDelete}
            currentPage={currentPage}
            limit={limit}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
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
