import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, List, Calendar as CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import FullCalendar from '@fullcalendar/react'; // Bạn cần cài: npm install @fullcalendar/react @fullcalendar/daygrid
import dayGridPlugin from '@fullcalendar/daygrid';

// Component con được thiết kế mới (Chi tiết ở mục 2 & 3)
import ScheduleFilterBar from '../../components/schedules/ScheduleFilterBar';
import ScheduleListView from '../../components/schedules/ScheduleListView';
import Pagination from '../../components/ui/Pagination'; // Tái sử dụng component Pagination

// API URL (Giả định)
const API_URL = 'http://localhost:5000/api/v1/departures';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' (mặc định) hoặc 'calendar'
  
  // State chung
  const [departures, setDepartures] = useState([]); // Dữ liệu cho List View
  const [calendarEvents, setCalendarEvents] = useState([]); // Dữ liệu riêng cho Calendar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho bộ lọc và phân trang
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date_start: '',
    date_end: '',
    guide_id: 'all',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Hàm gọi API chính (cho cả List và Calendar)
  const fetchDepartures = async (page = pagination.currentPage, currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 15, // Hiển thị 15 mục mỗi trang list
        ...currentFilters,
      });

      // const response = await fetch(`${API_URL}?${params.toString()}`);
      // if (!response.ok) throw new Error('Không thể tải lịch khởi hành');
      // const data = await response.json();
      
      // --- GIẢ LẬP DỮ LIỆU (Vì đang bỏ qua BE) ---
      // BE cần trả về dữ liệu JOIN với bảng 'tours' và 'staff'
      const mockListData = {
        departures: [
          { id: 1, departure_code: 'HL032-20251120', tour_name: 'Hạ Long Du Thuyền 5 Sao', departure_date: '2025-11-20', return_date: '2025-11-22', guests: '15/20', guide_name: 'Trần Văn An', status: 'confirmed' },
          { id: 2, departure_code: 'SP001-20251125', tour_name: 'Sapa - Fansipan Mùa Lúa Chín', departure_date: '2025-11-25', return_date: '2025-11-28', guests: '10/15', guide_name: 'Lê Thị Bình', status: 'scheduled' },
          { id: 3, departure_code: 'DN005-20251128', tour_name: 'Đà Nẵng - Hội An - Huế', departure_date: '2025-11-28', return_date: '2025-12-02', guests: '20/20', guide_name: 'Nguyễn Văn C', status: 'in_progress' },
        ],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 3 }
      };
      
      // Dữ liệu cho Calendar (thường được gọi với dải ngày rộng hơn)
      const mockCalendarData = mockListData.departures.map(d => ({
        id: d.id,
        title: d.tour_name,
        start: d.departure_date,
        end: d.return_date, // FullCalendar sẽ tự động +1 ngày nếu cần
        // (Thêm màu sắc dựa trên status)
        backgroundColor: d.status === 'confirmed' ? '#22c55e' : (d.status === 'scheduled' ? '#f59e0b' : '#3b82f6'),
        borderColor: d.status === 'confirmed' ? '#16a34a' : (d.status === 'scheduled' ? '#d97706' : '#2563eb'),
      }));
      // --- KẾT THÚC GIẢ LẬP ---

      setDepartures(mockListData.departures);
      setPagination(mockListData.pagination);
      setCalendarEvents(mockCalendarData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc bộ lọc/phân trang thay đổi
  useEffect(() => {
    fetchDepartures(pagination.currentPage, filters);
  }, [pagination.currentPage, filters]); // Chạy lại khi đổi trang hoặc lọc

  // Xử lý khi bộ lọc thay đổi (từ con)
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Quay về trang 1
  };

  // Xử lý khi đổi trang (từ con)
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  // Xử lý khi click vào sự kiện trên Lịch
  const handleEventClick = (clickInfo) => {
    navigate(`/schedules/${clickInfo.event.id}`); // Chuyển đến trang chi tiết
  };

  // Hàm render nội dung chính
  const renderContent = () => {
    if (loading) {
      return <div className="flex h-64 items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
    }
    if (error) {
      return <div className="text-center p-10"><AlertTriangle className="inline-block w-6 h-6 mr-2 text-red-500" /> {error}</div>;
    }
    
    if (viewMode === 'list') {
      return (
        <>
          <ScheduleListView departures={departures} />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={15}
          />
        </>
      );
    }

    if (viewMode === 'calendar') {
      return (
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          eventClick={handleEventClick}
          locale="vi"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          height="650px"
        />
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch Khởi Hành</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý, điều phối và xem trạng thái các chuyến đi.</p>
        </div>
        <Link 
          to="/schedules/create" // Liên kết đến trang tạo mới
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Lịch Khởi Hành
        </Link>
      </div>

      {/* 2. FILTER BAR & VIEW TOGGLE */}
      <ScheduleFilterBar onFilterChange={handleFilterChange} />
      
      <div className="flex justify-end">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT (List hoặc Calendar) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}