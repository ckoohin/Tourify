import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import tourService from '../../services/api/tourService';
import tourCategoryService from '../../services/api/tourCategoryService';
import { useNavigate } from 'react-router-dom';

// Nếu bạn muốn tách form ảnh ra riêng, có thể tạo ImageManager.jsx và import vào đây
// import ImageManager from './ImageManager';

const TourForm = ({ tourId, initialData }) => {
  const isEdit = !!tourId;
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // State form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    slug: '',
    category_id: '',
    description: '',
    highlights: '',
    duration_days: 1,
    duration_nights: 1,
    departure_location: '',
    destination: '',
    min_group_size: 1,
    max_group_size: 20,
    status: 'draft',
    created_by: 1 // TODO: Lấy từ AuthContext user.id
  });

  useEffect(() => {
    // 1. Load danh mục để chọn
    const fetchCategories = async () => {
        try {
            const res = await tourCategoryService.getAll({ is_active: 1 });
            if (res.success && res.data?.categories) {
                setCategories(res.data.categories);
            }
        } catch (err) { console.error(err); }
    };
    fetchCategories();

    // 2. Nếu là Edit, fill dữ liệu
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEdit) {
        res = await tourService.updateTour(tourId, formData);
        alert('Cập nhật thành công!');
      } else {
        res = await tourService.createTour(formData);
        alert('Tạo mới thành công!');
        // Sau khi tạo xong, chuyển hướng về danh sách hoặc trang edit để thêm ảnh
        navigate('/tours'); 
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
      <h2 className="text-xl font-bold mb-6 text-slate-800">{isEdit ? 'Cập nhật Tour' : 'Thông tin Tour Mới'}</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên Tour */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Tên Tour *</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Mã Tour */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mã Tour (Code) *</label>
          <input 
            name="code" 
            value={formData.code} 
            onChange={handleChange} 
            required 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) *</label>
          <input 
            name="slug" 
            value={formData.slug} 
            onChange={handleChange} 
            required 
            className="w-full border rounded-lg px-3 py-2 bg-slate-50"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục *</label>
          <select 
            name="category_id" 
            value={formData.category_id} 
            onChange={handleChange} 
            required 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Mô tả */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows="4" 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Các thông số khác */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số ngày</label>
                <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số đêm</label>
                <input type="number" name="duration_nights" value={formData.duration_nights} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
        </div>

        <div className="col-span-2 flex justify-end pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Save size={18} />
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Tour'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;