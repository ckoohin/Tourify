import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, FolderTree, RefreshCw, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import tourCategoryService from '../../services/api/tourCategoryService';
import CategoryForm from '../../components/categories/CategoryForm';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await tourCategoryService.getAll();
      if (res.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error('Không thể tải danh sách danh mục');
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
      <div className="flex items-center justify-between w-full gap-3">
        <span className="text-sm font-medium text-slate-700">Xóa danh mục này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await tourCategoryService.delete(id);
                toast.success('Đã xóa danh mục');
                fetchCategories();
              } catch (error) {
                toast.error('Xóa thất bại: ' + (error.response?.data?.message || error.message));
              }
            }}
          >
            Xóa
          </button>
          <button
            className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20">
        
        {/* Title Section */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Danh mục Tour</h1>
            <p className="text-xs text-slate-500 font-medium">Quản lý phân loại & cấu trúc tour</p>
          </div>
        </div>

        {/* Actions Section: Search + Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative group w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
             <input 
               type="text" 
               placeholder="Tìm kiếm danh mục..." 
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

          <button 
            onClick={fetchCategories} 
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Làm mới"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-500" : ""} />
          </button>

          <button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 font-semibold text-sm whitespace-nowrap"
          >
            <Plus size={18} /> 
            <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 backdrop-blur-sm text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b border-slate-200">
              <tr>
                <th className="p-4 w-16 text-center">#</th>
                <th className="p-4">Tên Danh mục</th>
                <th className="p-4">Slug (Đường dẫn)</th>
                <th className="p-4">Danh mục Cha</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                 <tr>
                    <td colSpan="6" className="p-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">Đang tải dữ liệu...</span>
                        </div>
                    </td>
                 </tr>
              ) : filteredCategories.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="p-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <FolderTree size={32} className="text-slate-300"/>
                            </div>
                            <p className="font-medium">Không tìm thấy danh mục nào.</p>
                        </div>
                    </td>
                 </tr>
              ) : (
                filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-blue-50/30 transition-colors group border-l-4 border-l-transparent hover:border-l-blue-500">
                    <td className="p-4 text-center text-slate-400 font-medium group-hover:text-blue-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all border border-slate-200 group-hover:border-blue-100">
                            <FolderTree size={18}/>
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors select-all">
                        /{cat.slug}
                      </span>
                    </td>
                    <td className="p-4">
                        {cat.parent_name ? (
                            <span className="text-slate-600 flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-full w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {cat.parent_name}
                            </span>
                        ) : (
                            <span className="text-slate-400 italic text-xs px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 w-fit block">Gốc</span>
                        )}
                    </td>
                    <td className="p-4 text-center">
                      {cat.is_active === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                          <CheckCircle size={12} className="mr-1.5" strokeWidth={2.5}/> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <XCircle size={12} className="mr-1.5" strokeWidth={2.5}/> Ẩn
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                            onClick={() => handleEdit(cat)} 
                            className="p-2 text-blue-600 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all shadow-sm hover:shadow"
                            title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(cat.id)} 
                            className="p-2 text-red-600 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all shadow-sm hover:shadow"
                            title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Summary */}
        {!loading && filteredCategories.length > 0 && (
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between items-center sticky bottom-0 z-10">
                <span>Hiển thị <b>{filteredCategories.length}</b> danh mục</span>
                <span className="opacity-70">Cập nhật: Vừa xong</span>
            </div>
        )}
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