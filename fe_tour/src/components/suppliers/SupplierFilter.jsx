import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const SupplierFilter = ({ filters, onChange }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onChange({ search: '', type: '', status: '' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tìm kiếm</label>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Tên công ty, Mã số thuế, SĐT..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
      </div>

      <div className="w-full md:w-48">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Loại hình</label>
        <select 
            name="type" 
            value={filters.type} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
            <option value="">Tất cả</option>
            <option value="hotel">Khách sạn</option>
            <option value="restaurant">Nhà hàng</option>
            <option value="transport">Vận chuyển</option>
            <option value="attraction">Điểm tham quan</option>
            <option value="visa">Visa</option>
            <option value="insurance">Bảo hiểm</option>
            <option value="other">Khác</option>
        </select>
      </div>

      <div className="w-full md:w-40">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Trạng thái</label>
        <select 
            name="status" 
            value={filters.status} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
            <option value="">Tất cả</option>
            <option value="active">Đang hợp tác</option>
            <option value="inactive">Tạm ngưng</option>
            <option value="blacklist">Blacklist</option>
        </select>
      </div>

      <button onClick={handleReset} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200" title="Đặt lại">
        <RotateCcw size={20} />
      </button>
    </div>
  );
};

export default SupplierFilter;