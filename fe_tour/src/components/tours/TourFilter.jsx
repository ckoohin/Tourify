import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import tourCategoryService from '../../services/api/tourCategoryService';

const TourFilter = ({ onFilterChange }) => {
  // State lưu trữ các điều kiện lọc
  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    status: '', // active, draft, inactive
    // min_price: '',
    // max_price: ''
  });

  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // Để mở rộng bộ lọc nâng cao nếu cần

  // Load danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await tourCategoryService.getAll(); 
        
        if (res.success && res.data?.categories) {
          const activeCategories = res.data.categories.filter(cat => cat.is_active === 1);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý khi người dùng thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gửi dữ liệu lọc lên component cha
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  // Reset bộ lọc về mặc định
  const handleReset = () => {
    const defaultFilters = {
      keyword: '',
      category_id: '',
      status: ''
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* 1. Tìm kiếm từ khóa */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                name="keyword"
                value={filters.keyword}
                onChange={handleChange}
                placeholder="Nhập tên tour, mã tour..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {filters.keyword && (
                <button 
                  type="button"
                  onClick={() => handleChange({ target: { name: 'keyword', value: '' } })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Lọc theo Danh mục */}
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Danh mục</label>
            <select 
              name="category_id" 
              value={filters.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Lọc theo Trạng thái */}
          <div className="w-full md:w-40">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Trạng thái</label>
            <select 
              name="status" 
              value={filters.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="draft">Bản nháp</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors h-[38px]"
            >
              <Filter className="w-4 h-4" /> Lọc
            </button>
            
            <button 
              type="button" 
              onClick={handleReset}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors h-[38px]"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TourFilter;