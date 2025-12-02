import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Users, Filter, Search, 
  ChevronLeft, ChevronRight, Shield, MapPin, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

import departureService from '../../services/api/departureService';
import staffService from '../../services/api/staffService';
import staffAssignmentService from '../../services/api/staffAssignmentService';

import StaffAssignmentManager from '../../components/operations/staff/StaffAssignmentManager';
import StatusBadge from '../../components/ui/StatusBadge';

const StaffAllocationPage = () => {
  const [activeTab, setActiveTab] = useState('tours'); // 'tours' | 'staff'
  const [currentDate, setCurrentDate] = useState(new Date()); // Tháng đang xem
  const [loading, setLoading] = useState(false);

  // Data States
  const [departures, setDepartures] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Modal State
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  
  // Staff Schedule State
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffSchedule, setStaffSchedule] = useState([]);

  // --- FETCH DATA ---
  const fetchDepartures = async () => {
    setLoading(true);
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const res = await departureService.getAll({
        departure_date_from: startDate,
        departure_date_to: endDate,
        limit: 100 // Lấy nhiều để hiển thị lịch
      });

      if (res.success) {
        setDepartures(res.data || []); // Chú ý cấu trúc trả về của API getAll
      }
    } catch (error) {
      toast.error("Lỗi tải lịch khởi hành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tours') {
      fetchDepartures();
    } else {
      // Load danh sách nhân viên để chọn xem lịch
      const loadStaff = async () => {
        try {
            const res = await staffService.getAll({ status: 'active', limit: 100 });
            if(res.success) setStaffList(res.data.staffs || []);
        } catch(e) { console.error(e); }
      };
      loadStaff();
    }
  }, [activeTab, currentDate]);

  // Load lịch riêng của nhân viên khi chọn
  useEffect(() => {
    if (activeTab === 'staff' && selectedStaff) {
        const loadSchedule = async () => {
            try {
                const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
                const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
                const res = await staffAssignmentService.getStaffSchedule(selectedStaff, {
                    date_from: startDate,
                    date_to: endDate
                });
                if(res.success) setStaffSchedule(res.data || []);
            } catch(e) { console.error(e); }
        };
        loadSchedule();
    }
  }, [selectedStaff, currentDate, activeTab]);

  // --- HANDLERS ---
  const handleMonthChange = (direction) => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()}/${s.getMonth()+1} - ${e.getDate()}/${e.getMonth()+1}`;
  };

  // --- RENDER ---

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Điều Phối Nhân Sự</h1>
            <p className="text-sm text-slate-500">Quản lý phân công Hướng dẫn viên, Lái xe và Cộng tác viên</p>
        </div>
        
        {/* Month Navigator */}
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <button onClick={() => handleMonthChange('prev')} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={20}/></button>
            <span className="px-4 font-bold text-slate-700 w-32 text-center">Tháng {format(currentDate, 'MM/yyyy')}</span>
            <button onClick={() => handleMonthChange('next')} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('tours')}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'tours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16}/> Phân bổ theo Tour
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarIcon size={16}/> Xem Lịch Nhân viên
          </button>
      </div>

      {/* TAB 1: TOUR ALLOCATION LIST */}
      {activeTab === 'tours' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Lịch trình</th>
                            <th className="px-4 py-3">Tour / Tuyến</th>
                            <th className="px-4 py-3">Nhân sự Chính (Hiện tại)</th>
                            <th className="px-4 py-3 text-center">Trạng thái Tour</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {departures.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="font-bold text-slate-700">{item.departure_code}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Clock size={12}/> {formatDateRange(item.departure_date, item.return_date)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                    <div className="font-medium text-slate-800 line-clamp-1" title={item.tour_name}>{item.tour_name}</div>
                                    <div className="text-xs text-slate-500">{item.max_guests} chỗ • {item.confirmed_guests} khách</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        {/* Hiển thị Leader/Guide lấy từ bảng Departures (Main) */}
                                        <div className="flex items-center gap-2 text-xs">
                                            <Shield size={12} className="text-blue-600"/>
                                            {item.tour_leader_name ? (
                                                <span className="font-medium text-slate-700">{item.tour_leader_name}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">-- Chưa có Leader --</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <MapPin size={12} className="text-green-600"/>
                                            {item.tour_guide_name ? (
                                                <span className="font-medium text-slate-700">{item.tour_guide_name}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">-- Chưa có HDV --</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge text={item.status} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => setSelectedDeparture(item)}
                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                    >
                                        Điều phối
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {departures.length === 0 && !loading && (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Không có lịch khởi hành trong tháng này.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* TAB 2: STAFF SCHEDULE CALENDAR */}
      {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
              {/* Staff Selector */}
              <div className="mb-6 w-full md:w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn nhân sự để xem lịch:</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                      <option value="">-- Chọn nhân sự --</option>
                      {staffList.map(s => (
                          <option key={s.id} value={s.id}>{s.full_name} ({s.staff_type})</option>
                      ))}
                  </select>
              </div>

              {/* Schedule List */}
              {selectedStaff ? (
                  <div className="space-y-3">
                      <h3 className="font-bold text-slate-700 mb-3">Lịch trình tháng {format(currentDate, 'MM/yyyy')}</h3>
                      {staffSchedule.length === 0 ? (
                          <div className="text-slate-500 italic text-sm">Nhân sự này đang trống lịch trong tháng này.</div>
                      ) : (
                          <div className="grid gap-3">
                              {staffSchedule.map(sch => (
                                  <div key={sch.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm bg-slate-50">
                                      <div>
                                          <div className="font-bold text-blue-700 text-sm">{sch.tour_code} - {sch.tour_name}</div>
                                          <div className="text-xs text-slate-500 mt-1">
                                              Vai trò: <span className="font-semibold uppercase">{sch.role}</span>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="font-mono text-sm font-bold text-slate-700">
                                              {formatDateRange(sch.departure_date, sch.return_date)}
                                          </div>
                                          <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${sch.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                              {sch.confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
                      Vui lòng chọn một nhân sự để xem lịch trình chi tiết.
                  </div>
              )}
          </div>
      )}

      {/* MODAL ĐIỀU PHỐI (Sử dụng lại component Manager đã làm) */}
      {selectedDeparture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">
                          Điều phối: {selectedDeparture.departure_code}
                      </h3>
                      <button onClick={() => setSelectedDeparture(null)} className="text-slate-400 hover:text-slate-600"><div className="p-1 rounded-full hover:bg-slate-200"><Users size={20}/></div></button>
                  </div>
                  
                  <div className="flex-1 overflow-hidden bg-white">
                      <StaffAssignmentManager 
                        departureId={selectedDeparture.id}
                        assignments={selectedDeparture.staff_assignments || []} 
                        onRefresh={() => {
                            fetchDepartures(); 
                        }}
                        departureDates={{
                            start: selectedDeparture.departure_date,
                            end: selectedDeparture.return_date
                        }}
                      />
                  </div>

                  <div className="px-6 py-3 border-t bg-slate-50 flex justify-end">
                      <button onClick={() => setSelectedDeparture(null)} className="px-4 py-2 bg-white border rounded text-sm hover:bg-slate-100">Đóng</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default StaffAllocationPage;