import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Bus, Receipt, FileText, UserCog, 
  Clock, MapPin, AlertCircle, Edit, ArrowLeft,
  CheckCircle, Star, ChevronDown, RefreshCcw, Lock,
  ClipboardCheck, MessageSquare, Briefcase
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- REAL IMPORTS ---
import staffAssignmentService from '../../../services/api/staffAssignmentService';
import departureService from '../../../services/api/departureService';

import DepartureStatusBadge, { STATUS_CONFIG } from '../../../components/operations/DepartureStatusBadge';
import DepartureFormModal from '../../../components/operations/DepartureFormModal'; 
import GuestList from '../../../components/operations/GuestList';
import StaffAssignmentManager from '../../../components/operations/staff/StaffAssignmentManager';
import TourLogList from '../../../components/operations/log/TourLogList';
import TourSupplierList from '../../../components/suppliers/ratings/TourSupplierList';
import ActivityCheckinManager from '../../../components/operations/checkin/ActivityCheckinManager'; 
import GuestRequestManager from '../../../components/operations/guest-requests/GuestRequestManager';
import TourTransportManager from '../../../components/operations/transport/TourTransportManager';

const DepartureDetailGuide = () => {
  // Lấy departureId từ URL (khớp với route /my-assignments/:departureId)
  const { departureId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [departure, setDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guests');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State cho dropdown trạng thái
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Hàm load dữ liệu chi tiết Departure
  // Dùng API getMyAssignmentDetail để đảm bảo Guide có quyền truy cập
  const fetchDepartureDetail = useCallback(async () => {
    if (!departureId) return;

    try {
        const res = await staffAssignmentService.getMyAssignmentDetail(departureId);
        
        if (res.success) {
            setDeparture(res.data);
        } else {
            toast.error(res.message || "Không tải được thông tin chuyến đi");
            // Nếu lỗi 403 (Forbidden), đẩy về trang danh sách
            if (res.status === 403) {
                navigate('/departures_guide');
            }
        }
    } catch (e) {
        console.error(e);
        toast.error("Lỗi kết nối hoặc không có quyền truy cập");
    } finally {
        setLoading(false);
    }
  }, [departureId, navigate]);

  // Load dữ liệu khi mount
  useEffect(() => {
    setLoading(true);
    fetchDepartureDetail();
  }, [fetchDepartureDetail]);

  // 2. Xử lý cập nhật trạng thái nhanh
  const handleStatusChange = async (newStatus) => {
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      if(!window.confirm(`Bạn có muốn thay đổi trạng thái thành "${statusLabel}"?`)) return;
      
      try {
          // Guide cập nhật trạng thái tour thông qua departureService
          await departureService.updateStatus(departureId, newStatus);
          toast.success(`Đã cập nhật trạng thái: ${statusLabel}`);
          fetchDepartureDetail();
          setIsStatusMenuOpen(false);
      } catch (e) {
          console.error(e);
          toast.error(e.response?.data?.message || "Lỗi cập nhật trạng thái");
      }
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu chuyến đi...</p>
            </div>
        </div>
      );
  }

  if (!departure) {
      return (
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy chuyến đi</h3>
            <p className="text-slate-500 mt-2 mb-6">Chuyến đi này có thể đã bị xóa hoặc không tồn tại.</p>
            <button onClick={() => navigate('/departures_guide')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Quay lại danh sách</button>
        </div>
      );
  }

  // Guide có thể chỉnh sửa trạng thái và thông tin cơ bản
  const isReadOnly = false; 

  const currentGuests = departure.confirmed_guests || 0;
  const maxGuests = departure.max_guests || 1; 
  const progressPercent = Math.round((currentGuests / maxGuests) * 100);

  const getProgressColor = () => {
      if (progressPercent >= 100) return 'bg-red-500'; 
      if (progressPercent >= 80) return 'bg-orange-500';
      return 'bg-blue-600'; 
  };

  // --- CẤU HÌNH NHÓM TAB ---
  const CLIENT_TABS = [
      { id: 'guests', label: 'Danh sách Khách', icon: Users, count: departure.confirmed_guests },
      { id: 'requests', label: 'Yêu cầu', icon: MessageSquare, count: 0 },
      
      { id: 'logs', label: 'Nhật ký', icon: FileText }
  ];

  const OPERATION_TABS = [
    { id: 'checkin', label: 'Điểm danh', icon: ClipboardCheck },
      { id: 'services', label: 'Phương tiện', icon: Bus, count: (departure.service_bookings?.length || 0) + (departure.transports?.length || 0) },
      { id: 'ratings', label: 'Đánh giá', icon: Star }
  ];

  const TabItem = ({ tab, isActive, onClick }) => (
      <button
          onClick={onClick}
          className={`
              flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
              ${isActive 
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1' 
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100'
              }
          `}
      >
          <div className="relative">
              <tab.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
              {/* Badge số lượng (nếu có) */}
              {tab.count !== undefined && tab.count > 0 && (
                  <span className={`absolute -top-2 -right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isActive ? 'bg-white text-blue-600 border-white' : 'bg-red-500 text-white border-white'
                  }`}>
                      {tab.count}
                  </span>
              )}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide">{tab.label}</span>
          
          {isActive && (
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          )}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      <Toaster position="top-right" />
      
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-slate-200 pt-5 pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <button onClick={() => navigate('/departures_guide')} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16}/> Danh sách nhiệm vụ
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-medium text-slate-700">{departure.departure_code}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Title & Info */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{departure.tour_name}</h1>
                        <DepartureStatusBadge status={departure.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mt-2">
                         <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/>
                            <span className="font-medium">{new Date(departure.departure_date).toLocaleDateString('vi-VN')}</span>
                            <span className="text-slate-400">-</span>
                            <span className="font-medium">{new Date(departure.return_date).toLocaleDateString('vi-VN')}</span>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200 ml-1">
                                {departure.duration_days}N{departure.duration_nights}Đ
                            </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-500"/>
                            <span className="truncate max-w-md" title={departure.meeting_point}>{departure.meeting_point || 'Chưa cập nhật điểm đón'}</span>
                         </div>
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col items-start lg:items-end gap-4 min-w-[280px]">
                     {!isReadOnly && (
                        <div className="flex items-center gap-3">

                            {/* Nút Sửa */}
    
                        </div>
                    )}
                    
                    {/* Sales Progress */}
                    <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">Khách đặt chỗ</span>
                            <span className={`font-bold ${progressPercent >= 100 ? 'text-red-600' : 'text-blue-600'}`}>
                                {currentGuests} <span className="text-slate-400 font-normal">/ {maxGuests}</span>
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* 2. STICKY NAVIGATION */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* CARD 1: KHÁCH HÀNG & YÊU CẦU */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={14}/></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin Khách hàng</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {CLIENT_TABS.map(tab => (
                            <TabItem 
                                key={tab.id} 
                                tab={tab} 
                                isActive={activeTab === tab.id} 
                                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            />
                        ))}
                    </div>
                </div>

                {/* CARD 2: VẬN HÀNH & DỊCH VỤ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={14}/></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vận hành Tour</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {OPERATION_TABS.map(tab => (
                            <TabItem 
                                key={tab.id} 
                                tab={tab} 
                                isActive={activeTab === tab.id} 
                                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Notes Alert */}
        {departure.notes && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-900 shadow-sm">
                <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5"/>
                <div>
                    <span className="font-bold block mb-0.5">Ghi chú điều hành:</span> 
                    <span className="leading-relaxed opacity-90">{departure.notes}</span>
                </div>
            </div>
        )}

        {/* Dynamic Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden">
            {activeTab === 'guests' && <GuestList departureId={departureId} maxGuests={departure.max_guests} />}
            
            {activeTab === 'requests' && <GuestRequestManager departureId={departureId} />}

            {activeTab === 'services' && (
                <div className="flex flex-col h-full">
                    <div className="border-t border-slate-200 my-6"></div>
                    <div className="px-6 pb-6">
                        <TourTransportManager departureId={departureId} />
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <StaffAssignmentManager 
                    departureId={departureId} 
                    assignments={departure.staff_assignments || []} 
                    onRefresh={fetchDepartureDetail} 
                    departureStatus={departure.status} 
                    departureDates={{start: departure.departure_date, end: departure.return_date}} 
                />
            )}
            
            {activeTab === 'checkin' && (
                <ActivityCheckinManager 
                    departureId={departureId} 
                    startDate={departure.departure_date} 
                />
            )}

            {activeTab === 'logs' && <TourLogList departureId={departureId} />}
            
            {activeTab === 'ratings' && (
                departure.status === 'completed' ? (
                    <TourSupplierList departureId={departureId} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="p-4 bg-slate-50 rounded-full mb-3">
                            <Lock size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Chưa thể đánh giá</h3>
                        <p className="text-slate-500 max-w-md mt-1 mb-4">
                            Tính năng đánh giá nhà cung cấp chỉ khả dụng khi chuyến đi đã kết thúc. <br/>
                            Vui lòng cập nhật trạng thái tour thành <span className="font-bold text-emerald-600">Hoàn thành</span> sau khi tour kết thúc.
                        </p>
                        <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                            Trạng thái hiện tại: <strong>{STATUS_CONFIG[departure.status]?.label || departure.status}</strong>
                        </div>
                    </div>
                )
            )}
        </div>
      </main>

      {/* --- MODALS --- */}
      <DepartureFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={departure}
        onSuccess={fetchDepartureDetail}
      />
    </div>
  );
};

export default DepartureDetailGuide;