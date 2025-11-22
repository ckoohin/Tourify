import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import tourCategoryService from '../../services/api/tourCategoryService';

const CategoryForm = ({ isOpen, onClose, editData, onSuccess }) => {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]); // Danh sách để chọn danh mục cha

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '', // '' tương đương null
    display_order: 0,
    is_active: true
  });

  // Reset form khi mở/đóng hoặc đổi chế độ edit
  useEffect(() => {
    if (isOpen) {
      // Load danh sách cha (trừ chính nó ra nếu đang edit)
      fetchParents();

      if (editData) {
        setFormData({
          name: editData.name || '',
          slug: editData.slug || '',
          description: editData.description || '',
          parent_id: editData.parent_id || '',
          display_order: editData.display_order || 0,
          is_active: editData.is_active === 1
        });
      } else {
        // Reset form khi tạo mới
        setFormData({
          name: '',
          slug: '',
          description: '',
          parent_id: '',
          display_order: 0,
          is_active: true
        });
      }
    }
  }, [isOpen, editData]);

  const fetchParents = async () => {
    try {
      const res = await tourCategoryService.getAll();
      if (res.success) {
        setParents(res.data.categories);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục cha");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Tự động tạo slug khi nhập tên
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-")
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Chuẩn bị dữ liệu (chuyển parent_id rỗng thành null)
    const payload = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : Number(formData.parent_id),
        is_active: formData.is_active ? 1 : 0
    };

    try {
      let res;
      if (isEdit) {
        res = await tourCategoryService.update(editData.id, payload);
      } else {
        res = await tourCategoryService.create(payload);
      }

      if (res.success) {
        alert(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        onSuccess(); // Reload list ở trang cha
        onClose();   // Đóng modal
      }
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">
            {isEdit ? 'Cập nhật Danh mục' : 'Thêm Danh mục Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleNameChange}
              required 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ví dụ: Du lịch Biển"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <input 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              required 
              className="w-full border rounded-lg px-3 py-2 bg-slate-50 text-slate-600"
            />
          </div>

          {/* Danh mục Cha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục cha</label>
            <select 
              name="parent_id" 
              value={formData.parent_id} 
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Không có (Danh mục gốc) --</option>
              {parents
                .filter(p => p.id !== editData?.id) // Không cho chọn chính mình làm cha
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          {/* Checkbox Active & Order */}
          <div className="flex items-center gap-6">
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Thứ tự</label>
                <input 
                  type="number" 
                  name="display_order" 
                  value={formData.display_order} 
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
             </div>
             <div className="flex items-center h-full pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    checked={formData.is_active} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Kích hoạt</span>
                </label>
             </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              Lưu danh mục
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CategoryForm;