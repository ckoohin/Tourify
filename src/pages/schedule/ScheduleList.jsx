import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  Calendar,
  AlertTriangle,
  List,
} from 'lucide-react';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---

// Dữ liệu giả cho danh sách lịch trình (dựa trên HTML)
const mockSchedules = [
  {
    id: 'HL001',
    departureDate: '24/11/2025',
    tourName: 'Hạ Long Du Thuyền 5 Sao - Khám Phá Kỳ Quan',
    duration: '3N2Đ',
    status: 'active', // Đang chạy
    bookedSlots: 20,
    totalSlots: 20,
    guide: 'Nguyễn Văn A',
  },
  {
    id: 'SP002',
    departureDate: '26/11/2025',
    tourName: 'Sapa - Fansipan - Bản Cát Cát Mùa Lúa Chín',
    duration: '4N3Đ',
    status: 'upcoming', // Sắp khởi hành
    bookedSlots: 18,
    totalSlots: 20,
    guide: 'unassigned', // Chưa phân công
  },
  {
    id: 'DN003',
    departureDate: '28/11/2025',
    tourName: 'Đà Nẵng - Hội An - Bà Nà Hills: Con Đường Di Sản',
    duration: '4N3Đ',
    status: 'upcoming', // Sắp khởi hành
    bookedSlots: 12,
    totalSlots: 25,
    guide: 'Trần Thị B',
  },
  {
    id: 'NB004',
    departureDate: '20/11/2025',
    tourName: 'Ninh Bình: Tràng An - Bái Đính - Hang Múa',
    duration: '2N1Đ',
    status: 'completed', // Đã hoàn thành
    bookedSlots: 25,
    totalSlots: 25,
    guide: 'Lê Minh C',
  },
  {
    id: 'PQ005',
    departureDate: '19/11/2025',
    tourName: 'Phú Quốc - Thiên Đường Đảo Ngọc',
    duration: '3N2Đ',
    status: 'cancelled', // Đã hủy
    bookedSlots: 0,
    totalSlots: 20,
    guide: 'N/A',
  },
];

// Dữ liệu giả cho HDV (dùng cho bộ lọc)
const mockGuides = [
  { id: '1', name: 'Nguyễn Văn A' },
  { id: '2', name: 'Trần Thị B' },
  { id: '3', name: 'Lê Minh C' },
];

// --- CÁC COMPONENT CON & HÀM HỖ TRỢ ---

/**
 * Component render Badge trạng thái dựa trên status string
 */
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-primary border border-blue-200">
          Đang chạy
        </span>
      );
    case 'upcoming':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          Sắp khởi hành
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Đã hoàn thành
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Đã hủy
        </span>
      );
    default:
      return null;
  }
};

/**
 * Component render thanh "Số chỗ" (progress bar)
 */
const SlotProgressBar = ({ booked, total }) => {
  const percentage = total > 0 ? (booked / total) * 100 : 0;
  let barColor = 'bg-primary';
  if (percentage >= 90) barColor = 'bg-amber-500';
  if (percentage === 100) barColor = 'bg-green-500';
  if (status === 'cancelled') barColor = 'bg-red-500';

  return (
    <>
      <div className="font-medium text-slate-800">
        {booked} / {total}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
        <div
          className={`${barColor} h-1.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </>
  );
};

/**
 * Component render tên HDV hoặc "Chưa phân công"
 */
const GuideDisplay = ({ guide }) => {
  if (guide === 'unassigned') {
    return (
      <span className="font-medium text-red-500 italic flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Chưa phân công
      </span>
    );
  }
  return <span className="font-medium text-slate-700">{guide}</span>;
};

/**
 * Component render các nút Hành động
 */
const ActionButtons = ({ schedule }) => {
  const handleAssignGuide = () => {
    // Logic mở modal gán HDV
    alert(`Mở modal gán HDV cho tour: ${schedule.tourName}`);
  };

  if (schedule.guide === 'unassigned') {
    return (
      <td className="px-6 py-4 text-right space-x-2">
        <button
          onClick={handleAssignGuide}
          className="px-3 py-1 bg-primary text-white hover:bg-blue-700 text-xs font-medium rounded-md transition-colors shadow-sm shadow-blue-500/30"
        >
          Gán HDV
        </button>
        <Link
          to={`/schedules/${schedule.id}`}
          className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
        >
          Xem
        </Link>
      </td>
    );
  }

  return (
    <td className="px-6 py-4 text-right">
      <Link
        to={`/schedules/${schedule.id}`}
        className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
      >
        Xem chi tiết
      </Link>
    </td>
  );
};

// --- COMPONENT CHÍNH ---

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [guides, setGuides] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [filters, setFilters] = useState({
    startDate: '2025-11-25',
    endDate: '2025-12-25',
    guideId: 'all',
    status: 'all',
  });

  // 1. Khởi tạo dữ liệu (giả lập API call)
  useEffect(() => {
    // Giả lập fetch API
    setSchedules(mockSchedules);
    setFilteredSchedules(mockSchedules); // Ban đầu hiển thị tất cả
    setGuides(mockGuides);
  }, []);

  // 2. Xử lý logic lọc mỗi khi filter thay đổi
  useEffect(() => {
    let result = [...schedules];

    // Lọc theo HDV
    if (filters.guideId !== 'all') {
      if (filters.guideId === 'unassigned') {
        result = result.filter((s) => s.guide === 'unassigned');
      } else {
        // Tìm tên HDV từ ID
        const guideName = guides.find((g) => g.id === filters.guideId)?.name;
        if (guideName) {
          result = result.filter((s) => s.guide === guideName);
        }
      }
    }

    // Lọc theo trạng thái
    if (filters.status !== 'all') {
      result = result.filter((s) => s.status === filters.status);
    }
    
    // TODO: Thêm logic lọc theo ngày (startDate, endDate)
    // (Bỏ qua trong ví dụ này để giữ sự đơn giản)

    setFilteredSchedules(result);
  }, [filters, schedules, guides]); // Thêm 'guides' vào dependency array

  // 3. Hàm xử lý khi thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch khởi hành</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và điều phối các tour sắp/đang diễn ra.
          </p>
        </div>
        <Link
          to="/schedules/create" // Đường dẫn này được định nghĩa trong App.jsx
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <CalendarPlus className="mr-2 text-lg" />
          Thêm lịch khởi hành
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Date Pickers */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:ring-primary focus:border-primary"
            />
          </div>
          <span className="text-slate-400">đến</span>
          <div className="relative">
            <Calendar className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Guide Filter */}
        <select
          name="guideId"
          value={filters.guideId}
          onChange={handleFilterChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer md:w-48"
        >
          <option value="all">Tất cả HDV</option>
          <option value="unassigned" className="text-red-600 font-medium">
            Chưa phân công
          </option>
          {guides.map((guide) => (
            <option key={guide.id} value={guide.id}>
              {guide.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer md:w-48"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="upcoming">Sắp khởi hành</option>
          <option value="active">Đang chạy</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg ml-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SCHEDULE TABLE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ngày khởi hành</th>
                  <th className="px-6 py-4">Tên Tour</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Số chỗ (Đã đặt / Tổng)</th>
                  <th className="px-6 py-4">Hướng dẫn viên</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSchedules.map((schedule) => {
                  // Class đặc biệt cho hàng cần gán HDV
                  const specialRowClass =
                    schedule.status === 'upcoming' && schedule.guide === 'unassigned'
                      ? 'bg-amber-50/50 border-l-4 border-amber-400'
                      : '';
                  // Class cho hàng đã hủy
                  const cancelledRowClass =
                    schedule.status === 'cancelled' ? 'opacity-70' : '';

                  return (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-slate-50 transition-colors ${specialRowClass} ${cancelledRowClass}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {schedule.departureDate}
                        </div>
                        <div className="text-xs text-slate-500">Mã: {schedule.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">
                          {schedule.tourName}
                        </div>
                        <div className="text-xs text-slate-500">{schedule.duration}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td className="px-6 py-4">
                        <SlotProgressBar
                          booked={schedule.bookedSlots}
                          total={schedule.totalSlots}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <GuideDisplay guide={schedule.guide} />
                      </td>
                      {/* Tách riêng component ActionButtons */}
                      <ActionButtons schedule={schedule} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION (Giao diện tĩnh) */}
          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-800">1</span> đến{' '}
              <span className="font-medium text-slate-800">{filteredSchedules.length}</span> trong
              tổng số <span className="font-medium text-slate-800">{schedules.length}</span> lịch
              trình
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                disabled
              >
                Trước
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                3
              </button>
              <span className="px-2 py-1 text-slate-500">...</span>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                9
              </button>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* TODO: Giao diện Lịch (Calendar View) */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-700">Giao diện Lịch</h3>
          <p className="text-slate-500 mt-2">
            Chức năng xem lịch (calendar) sẽ được phát triển ở giai đoạn sau.
          </p>
        </div>
      )}
    </div>
  );
}