import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Bus, Receipt, FileText, UserCog, 
  Clock, MapPin, AlertCircle, Edit, ArrowLeft,
  CheckCircle, PlayCircle, Star, ChevronDown, RefreshCcw, Lock,
  ClipboardCheck, MessageSquare, Briefcase, Grid 
} from 'lucide-react';
import toast from 'react-hot-toast';

import departureService from '../../services/api/departureService';

import DepartureStatusBadge, { STATUS_CONFIG } from '../../components/operations/DepartureStatusBadge';
import DepartureFormModal from '../../components/operations/DepartureFormModal'; 
import GuestList from '../../components/operations/GuestList';
import ServiceList from '../../components/operations/service/ServiceList';
import StaffAssignmentManager from '../../components/operations/staff/StaffAssignmentManager';
import TourLogList from '../../components/operations/log/TourLogList';
import TourExpenseManager from '../../components/operations/expenses/TourExpenseManager';
import TourSupplierList from '../../components/suppliers/ratings/TourSupplierList';
import ActivityCheckinManager from '../../components/operations/checkin/ActivityCheckinManager'; 

import GuestRequestManager from '../../components/operations/guest-requests/GuestRequestManager';
import TourTransportManager from '../../components/operations/transport/TourTransportManager';

const DepartureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [departure, setDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guests');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDepartureDetail = useCallback(async () => {
    try {
        const res = await departureService.getById(id);
        if (res.success) {
            setDeparture(res.data);
        } else {
            toast.error("Không tải được thông tin chuyến đi");
        }
    } catch (e) {
        console.error(e);
        toast.error("Lỗi kết nối máy chủ");
    } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchDepartureDetail();
  }, [fetchDepartureDetail]);

  const handleStatusChange = async (newStatus) => {
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      if(!window.confirm(`Bạn có muốn thay đổi trạng thái thành "${statusLabel}"?`)) return;
      
      try {
          await departureService.updateStatus(id, newStatus);
          toast.success(`Đã cập nhật trạng thái: ${statusLabel}`);
          fetchDepartureDetail();
          setIsStatusMenuOpen(false);
      } catch (e) {
          toast.error("Lỗi cập nhật trạng thái");
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
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Quay lại danh sách</button>
        </div>
      );
  }

  const isReadOnly = false; 

  const currentGuests = departure.confirmed_guests || 0;
  const maxGuests = departure.max_guests || 1; 
  const progressPercent = Math.round((currentGuests / maxGuests) * 100);

  const getProgressColor = () => {
      if (progressPercent >= 100) return 'bg-red-500'; 
      if (progressPercent >= 80) return 'bg-orange-500';
      return 'bg-blue-600'; 
  };

  const CLIENT_TABS = [
      { id: 'guests', label: 'Danh sách Khách', icon: Users, count: departure.confirmed_guests },
      { id: 'requests', label: 'Yêu cầu', icon: MessageSquare, count: 0 },
      { id: 'checkin', label: 'Điểm danh', icon: ClipboardCheck },
      { id: 'logs', label: 'Nhật ký', icon: FileText }
  ];

  const OPERATION_TABS = [
      { id: 'services', label: 'Dịch vụ', icon: Bus, count: (departure.service_bookings?.length || 0) + (departure.transports?.length || 0) },
      { id: 'staff', label: 'Nhân sự', icon: UserCog, count: departure.staff_assignments?.length },
      { id: 'expenses', label: 'Chi phí', icon: Receipt },
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
      
      <header className="bg-white border-b border-slate-200 pt-5 pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <button onClick={() => navigate('/departures')} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16}/> Danh sách lịch
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
                            <div className="relative" ref={statusMenuRef}>
                                <button 
                                    onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                >
                                    <RefreshCcw size={16} className={isStatusMenuOpen ? "text-blue-600" : "text-slate-500"}/>
                                    <span>Trạng thái</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isStatusMenuOpen ? 'rotate-180' : ''}`}/>
                                </button>
                                {isStatusMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-black/5">
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleStatusChange(key)}
                                                disabled={departure.status === key}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${departure.status === key ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'}`}
                                            >
                                                <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${config.color.split(' ')[0].replace('bg-', 'bg-').replace('border-', 'bg-')}`}></span>
                                                {config.label}
                                                {departure.status === key && <CheckCircle size={14} className="ml-auto text-blue-600"/>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Edit size={16}/> <span>Sửa</span>
                            </button>
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

      {/* 2. STICKY CARDS NAVIGATION (Card Layout) */}
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
            {activeTab === 'guests' && <GuestList departureId={id} maxGuests={departure.max_guests} />}
            
            {activeTab === 'requests' && <GuestRequestManager departureId={id} />}

            {activeTab === 'services' && (
                <div className="flex flex-col h-full">
                    <ServiceList departureId={id} />
                    <div className="border-t border-slate-200 my-6"></div>
                    <div className="px-6 pb-6">
                        <TourTransportManager departureId={id} />
                    </div>
                </div>
            )}

            {activeTab === 'staff' && <StaffAssignmentManager departureId={id} assignments={departure.staff_assignments || []} onRefresh={fetchDepartureDetail} departureStatus={departure.status} departureDates={{start: departure.departure_date, end: departure.return_date}} />}
            
            {activeTab === 'checkin' && (
                <ActivityCheckinManager 
                    departureId={id} 
                    startDate={departure.departure_date} 
                />
            )}

            {activeTab === 'logs' && <TourLogList departureId={id} />}
            {activeTab === 'expenses' && <TourExpenseManager departureId={id} isReadOnly={isReadOnly} />}
            
            {activeTab === 'ratings' && (
                departure.status === 'completed' ? (
                    <TourSupplierList departureId={id} />
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

export default DepartureDetail;