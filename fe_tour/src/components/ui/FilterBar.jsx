import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react';

/**
 *
 *
 * @param {object} props
 * @param {function} props.onFilterChange 
 * 
 * @param {Array} props.categories 
 * 
 * @param {string} [props.defaultViewMode='grid'] 
 */
const FilterBar = ({ onFilterChange, categories = [], defaultViewMode = 'grid' }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState(defaultViewMode);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {

      onFilterChange({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
      });
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); 

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    let newFilters = {
      search: searchTerm,
      category: selectedCategory,
      status: selectedStatus,
    };

    if (name === 'category') {
      setSelectedCategory(value);
      newFilters.category = value;
    } else if (name === 'status') {
      setSelectedStatus(value);
      newFilters.status = value;
    }

    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        
        {/* Search Input */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tên tour, mã tour..."
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          name="category"
          value={selectedCategory}
          onChange={handleDropdownChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          {categories.length === 0 && (
            <>
              <option value="1">Du lịch Biển</option>
              <option value="2">Du lịch Núi</option>
            </>
          )}
        </select>

        <select
          name="status"
          value={selectedStatus}
          onChange={handleDropdownChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang mở bán</option>
          <option value="inactive">Đã đóng</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      <div className="flex items-center bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-md transition-all ${
            viewMode === 'grid'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Xem dạng lưới"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-md transition-all ${
            viewMode === 'list'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Xem dạng danh sách"
        >
          <ListIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;