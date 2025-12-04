import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Bus, Receipt, FileText, UserCog, 
  Clock, MapPin, AlertCircle, Edit, ArrowLeft,
  CheckCircle, XCircle, PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import departureService from '../../services/api/departureService';

// Components
import DepartureStatusBadge from '../../components/operations/DepartureStatusBadge';
import DepartureFormModal from '../../components/operations/DepartureFormModal'; 
import GuestList from '../../components/operations/GuestList';
import ServiceList from '../../components/operations/service/ServiceList';
import StaffAssignmentManager from '../../components/operations/staff/StaffAssignmentManager';
import TourLogList from '../../components/operations/logs/TourLogList';
import TourExpenseManager from '../../components/operations/expenses/TourExpenseManager';

const DepartureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [departure, setDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guests');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Hàm load dữ liệu (Dùng useCallback để truyền xuống component con)
  const fetchDepartureDetail = useCallback(async () => {
    try {
        // Không set loading=true ở đây để tránh nháy màn hình khi refresh ngầm
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

  // Load lần đầu
  useEffect(() => {
    setLoading(true);
    fetchDepartureDetail();
  }, [fetchDepartureDetail]);

  // 2. Xử lý cập nhật trạng thái nhanh
  const handleStatusChange = async (newStatus) => {
      if(!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang "${newStatus}"?`)) return;
      try {
          await departureService.updateStatus(id, newStatus);
          toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
          fetchDepartureDetail();
      } catch (e) {
          toast.error("Lỗi cập nhật trạng thái");
      }
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-slate-500 font-medium">Đang tải dữ liệu chuyến đi...</p>
            </div>
        </div>
      );
  }

  if (!departure) {
      return (
        <div className="p-10 text-center">
            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy chuyến đi</h3>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Quay lại</button>
        </div>
      );
  }

  // Xác định quyền hạn (Ví dụ: tour đã hủy/xong thì readonly)
  const isReadOnly = departure.status === 'cancelled' || departure.status === 'completed';

  // Config cho Tabs
  const TABS = [
      { id: 'guests', label: 'Danh sách Khách', icon: Users, count: departure.confirmed_guests },
      { id: 'services', label: 'Dịch vụ & Vận chuyển', icon: Bus, count: (departure.service_bookings?.length || 0) + (departure.transports?.length || 0) },
      { id: 'staff', label: 'Nhân sự', icon: UserCog, count: departure.staff_assignments?.length },
      { id: 'logs', label: 'Nhật ký Tour', icon: FileText },
      { id: 'expenses', label: 'Chi phí & Quyết toán', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Breadcrumb & Back */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <button onClick={() => navigate('/operation/departures')} className="hover:text-blue-600 flex items-center gap-1">
                    <ArrowLeft size={16}/> Danh sách lịch
                </button>
                <span>/</span>
                <span className="font-medium text-slate-800">{departure.departure_code}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Title & Basic Info */}
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{departure.tour_name}</h1>
                        <DepartureStatusBadge status={departure.status} />
                    </div>
                    <div className="text-slate-500 text-sm flex flex-wrap gap-x-6 gap-y-2">
                        <span className="flex items-center gap-1.5">
                            <Clock size={16} className="text-slate-400"/>
                            {new Date(departure.departure_date).toLocaleDateString('vi-VN')} - {new Date(departure.return_date).toLocaleDateString('vi-VN')}
                            <span className="text-xs bg-slate-100 px-1.5 rounded ml-1">
                                {departure.duration_days}N{departure.duration_nights}Đ
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-slate-400"/>
                            {departure.meeting_point || 'Chưa cập nhật điểm đón'}
                        </span>
                    </div>
                </div>

                {/* Actions Buttons */}
                <div className="flex items-center gap-3">
                    {!isReadOnly && (
                        <>
                            {departure.status === 'scheduled' && (
                                <button onClick={() => handleStatusChange('confirmed')} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-1.5 transition-colors">
                                    <CheckCircle size={16}/> Chốt Tour
                                </button>
                            )}
                            {departure.status === 'confirmed' && (
                                <button onClick={() => handleStatusChange('in_progress')} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 flex items-center gap-1.5 transition-colors">
                                    <PlayCircle size={16}/> Khởi hành
                                </button>
                            )}
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                            >
                                <Edit size={16}/> Sửa thông tin
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Progress Bar Số chỗ */}
            <div className="mt-4 max-w-md">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Tiến độ bán: <b className="text-slate-900">{departure.confirmed_guests}</b> / {departure.max_guests} khách</span>
                    <span className="text-slate-500">{Math.round((departure.confirmed_guests/departure.max_guests)*100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((departure.confirmed_guests/departure.max_guests)*100, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}/>
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notes Alert if exists */}
        {departure.notes && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
                <AlertCircle size={20} className="shrink-0 text-amber-600"/>
                <div>
                    <span className="font-bold">Ghi chú điều hành:</span> {departure.notes}
                </div>
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
            {/* 1. GUESTS TAB */}
            {activeTab === 'guests' && (
                <GuestList 
                    departureId={id} 
                    maxGuests={departure.max_guests} // Có thể truyền xuống để hiển thị số chỗ còn trống
                />
            )}

            {/* 2. SERVICES TAB */}
            {activeTab === 'services' && <ServiceList departureId={id} />}

            {/* 3. STAFF TAB */}
            {activeTab === 'staff' && (
                <StaffAssignmentManager 
                    departureId={id} 
                    assignments={departure.staff_assignments || []} 
                    onRefresh={fetchDepartureDetail} 
                    departureStatus={departure.status}
                    departureDates={{
                        start: departure.departure_date,
                        end: departure.return_date
                    }}
                />
            )}

            {/* 4. LOGS TAB */}
            {activeTab === 'logs' && (
                <TourLogList departureId={id} />
            )}

            {/* 5. EXPENSES TAB */}
            {activeTab === 'expenses' && (
                <TourExpenseManager 
                    departureId={id} 
                    isReadOnly={isReadOnly}
                />
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