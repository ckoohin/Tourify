import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, FolderTree } from 'lucide-react';
import toast from 'react-hot-toast'; // Import Toast
import tourCategoryService from '../../services/api/tourCategoryService';
import CategoryForm from '../../components/categories/CategoryForm';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm load dữ liệu
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await tourCategoryService.getAll();
      if (res.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error('Không thể tải danh sách danh mục', {
        className: 'my-toast-error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-sm font-medium text-slate-700">Xóa danh mục này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="btn-confirm" 
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await tourCategoryService.delete(id);
                toast.success('Xóa danh mục thành công!', {
                  className: 'my-toast-success'
                });
                fetchCategories();
              } catch (error) {
                toast.error('Xóa thất bại: ' + (error.response?.data?.message || error.message), {
                  className: 'my-toast-error'
                });
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

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh mục Tour</h1>
          <p className="text-sm text-slate-500">Quản lý phân loại tour du lịch</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} /> Thêm Danh mục
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200 max-w-md">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Tìm kiếm danh mục..." 
             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 text-sm font-semibold">
            <tr>
              <th className="p-4 border-b w-16">#</th>
              <th className="p-4 border-b">Tên Danh mục</th>
              <th className="p-4 border-b">Slug</th>
              <th className="p-4 border-b">Danh mục Cha</th>
              <th className="p-4 border-b text-center">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
               <tr><td colSpan="6" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : filteredCategories.length === 0 ? (
               <tr><td colSpan="6" className="p-8 text-center text-slate-500">Không có dữ liệu.</td></tr>
            ) : (
              filteredCategories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500">{index + 1}</td>
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                    <FolderTree size={16} className="text-blue-500"/>
                    {cat.name}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                    {cat.slug}
                  </td>
                  <td className="p-4 text-slate-600">
                    {cat.parent_name || <span className="text-slate-400 italic">- Gốc -</span>}
                  </td>
                  <td className="p-4 text-center">
                    {cat.is_active === 1 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1"/> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} className="mr-1"/> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editingCategory}
        onSuccess={(data, isUpdate) => {
            fetchCategories();
        }}
      />
    </div>
  );
};

export default CategoryList;