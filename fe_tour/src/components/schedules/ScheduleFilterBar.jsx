import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Giả sử component DateRangePicker (nếu có), nếu không dùng 2 input date
// import DateRangePicker from '../ui/DateRangePicker'; 

const ScheduleFilterBar = ({ onFilterChange }) => {
  // State nội bộ cho các input
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [guideId, setGuideId] = useState('all');
  
  const [guides, setGuides] = useState([]); // Danh sách HDV (từ API)

  // TODO: useEffect để gọi API /api/v1/staff?role=guide và setGuides

  // Hàm xử lý khi nhấn nút Lọc (hoặc debounce)
  // (Để đơn giản, chúng ta dùng 1 nút 'Lọc')
  const handleApplyFilter = () => {
    onFilterChange({
      search: searchTerm,
      status: status,
      date_start: dateStart,
      date_end: dateEnd,
      guide_id: guideId,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Tìm kiếm</label>
        <div className="flex items-center bg-slate-50 border ... rounded-lg px-3 py-2 mt-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tên tour, Mã đoàn..."
            className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Date Range */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Ngày khởi hành</label>
        <div className="flex gap-2 mt-1">
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="input-class-tailwind w-full p-2" />
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="input-class-tailwind w-full p-2" />
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-class-tailwind w-full p-2 mt-1"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in_progress">Đang chạy</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      
      {/* Guide Filter */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Hướng dẫn viên</label>
        <select
          value={guideId}
          onChange={(e) => setGuideId(e.target.value)}
          className="input-class-tailwind w-full p-2 mt-1"
        >
          <option value="all">Tất cả HDV</option>
          {/* {guides.map(guide => <option key={guide.id} value={guide.id}>{guide.name}</option>)} */}
          <option value="1">Trần Văn An</option> {/* Mock */}
        </select>
      </div>

      {/* Apply Button */}
      <div className="self-end">
        <button
          onClick={handleApplyFilter}
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 mt-1"
        >
          Lọc
        </button>
      </div>
    </div>
  );
};

export default ScheduleFilterBar;