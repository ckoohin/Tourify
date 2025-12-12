import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const StaffFilter = ({ filters, onChange }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onChange({ search: '', staff_type: '', status: '' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full relative">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tìm kiếm</label>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Tên, Mã NV, SĐT, Email..." 
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
      </div>

      <div className="w-full md:w-48">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vai trò</label>
        <select 
            name="staff_type" 
            value={filters.staff_type} 
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
            <option value="">Tất cả</option>
            <option value="tour_guide">Hướng dẫn viên</option>
            <option value="tour_leader">Trưởng đoàn</option>
            <option value="driver">Tài xế</option>
            <option value="coordinator">Điều hành</option>
        </select>
      </div>

      <div className="w-full md:w-40">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Trạng thái</label>
        <select 
            name="status" 
            value={filters.status} 
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
            <option value="">Tất cả</option>
            <option value="active">Đang làm việc</option>
            <option value="on_leave">Nghỉ phép</option>
            <option value="inactive">Đã nghỉ việc</option>
        </select>
      </div>

      <button onClick={handleReset} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Reset bộ lọc">
        <RotateCcw size={20} />
      </button>
    </div>
  );
};

export default StaffFilter;