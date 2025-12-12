import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MapPin, Calendar, Users, Clock, ArrowRight, 
    CheckCircle2, AlertCircle, Briefcase, FileText,
    Check
} from 'lucide-react';
import staffAssignmentService from '../../../services/api/staffAssignmentService'; 
import toast from 'react-hot-toast';

const GuideTourManager = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [confirmingId, setConfirmingId] = useState(null);

    const fetchMyTours = async () => {
        setLoading(true);
        try {
            const res = await staffAssignmentService.getMyTours({ limit: 50 }); 

            let list = [];
            if (res.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (res.data && Array.isArray(res.data)) {
                list = res.data;
            } else if (Array.isArray(res.data)) {
                list = res.data;
            } else if (res.data?.tours && Array.isArray(res.data.tours)) {
                list = res.data.tours;
            }

            console.log("Guide Tours Loaded:", list); 
            setTours(list);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách tour");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTours();
    }, []);

    const handleConfirmAssignment = async (assignmentId) => {
        if (!window.confirm("Bạn xác nhận sẽ nhận nhiệm vụ này?")) return;
        
        setConfirmingId(assignmentId);
        try {
            await staffAssignmentService.confirmAssignment(assignmentId);
            toast.success("Đã xác nhận nhiệm vụ");
            
            setTours(prev => prev.map(t => 
                t.assignment_id === assignmentId ? { ...t, confirmed: 1 } : t
            ));
        } catch (error) {
            toast.error("Lỗi xác nhận nhiệm vụ");
        } finally {
            setConfirmingId(null);
        }
    };

    const getFilteredTours = () => {
        const now = new Date();
        now.setHours(0,0,0,0);

        return tours.filter(tour => {
            if (!tour.departure_date) return false;
            
            const depDate = new Date(tour.departure_date);
            const retDate = tour.return_date ? new Date(tour.return_date) : depDate;

            if (filter === 'upcoming') return depDate > now && tour.departure_status !== 'cancelled';
            if (filter === 'ongoing') return depDate <= now && retDate >= now && tour.departure_status !== 'cancelled';
            if (filter === 'completed') return retDate < now || tour.departure_status === 'completed';
            return true;
        });
    };

    const filteredTours = getFilteredTours();

    const getStatusInfo = (status, date, retDate) => {
        const now = new Date();
        const start = new Date(date);
        const end = retDate ? new Date(retDate) : start;

        if (status === 'cancelled') return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Đã hủy' };
        if (status === 'completed') return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Hoàn thành' };
        
        if (start <= now && end >= now) return { color: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse', label: 'Đang diễn ra' };
        if (start > now) {
            const diffTime = Math.abs(start - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays <= 3) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Sắp khởi hành' };
            return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Sắp tới' };
        }
        return { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Kết thúc' };
    };

    const getRoleName = (role) => {
        if (!role) return 'Nhân viên';
        const map = {
            'tour_guide': 'Hướng dẫn viên',
            'tour_leader': 'Trưởng đoàn',
            'driver': 'Lái xe',
            'assistant': 'Phụ xe / Trợ lý',
            'coordinator': 'Điều hành'
        };
        return map[role] || role;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="text-blue-600"/> Lịch Công Tác Của Tôi
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Xin chào, bạn có <b>{tours.filter(t => !t.confirmed && t.departure_status !== 'cancelled').length}</b> nhiệm vụ mới cần xác nhận.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                        {[
                            { id: 'all', label: 'Tất cả' },
                            { id: 'upcoming', label: 'Sắp tới' },
                            { id: 'ongoing', label: 'Đang đi' },
                            { id: 'completed', label: 'Lịch sử' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                                    filter === f.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                        <span className="text-slate-400 font-medium">Đang tải lịch trình...</span>
                    </div>
                ) : filteredTours.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Briefcase size={36}/>
                        </div>
                        <h3 className="text-slate-700 font-bold text-lg">Chưa có lịch phân công nào</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                            Danh sách trống. Vui lòng kiểm tra lại bộ lọc hoặc liên hệ bộ phận điều hành.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {filteredTours.map((tour) => {
                            const statusInfo = getStatusInfo(tour.departure_status, tour.departure_date, tour.return_date);
                            const isConfirmed = tour.confirmed === 1;

                            return (
                                <div 
                                    key={tour.assignment_id} 
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden relative group ${
                                        !isConfirmed ? 'border-amber-300 shadow-md shadow-amber-100 ring-1 ring-amber-200' : 'border-slate-200 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {!isConfirmed && (
                                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                                            NHIỆM VỤ MỚI
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row">
                                        {/* Left: Date Box */}
                                        <div className="bg-slate-50 p-5 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100 min-w-[130px] shrink-0">
                                            <div className="text-4xl font-black text-slate-800 tracking-tighter">
                                                {new Date(tour.departure_date).getDate()}
                                            </div>
                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                                                Tháng {new Date(tour.departure_date).getMonth() + 1}
                                            </div>
                                            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-600 shadow-sm">
                                                {tour.duration_days}N{tour.duration_nights}Đ
                                            </div>
                                        </div>

                                        {/* Middle: Info */}
                                        <div className="p-5 flex-1 min-w-0">
                                            {/* Top Line: Tags & Code */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                    #{tour.departure_code}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">

                                                    <Briefcase size={12}/> {getRoleName(tour.role)?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-4 line-clamp-1" title={tour.tour_name}>
                                                {tour.tour_name}
                                            </h3>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-600">
                                                <div className="flex items-start gap-2.5">
                                                    <Clock size={16} className="text-blue-500 shrink-0 mt-0.5"/>
                                                    <div>
                                                        <span className="block text-xs text-slate-400 font-bold uppercase">Giờ tập trung</span>
                                                        <span className="font-medium text-slate-800">{tour.meeting_time?.slice(0,5) || '--:--'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin size={16} className="text-red-500 shrink-0 mt-0.5"/>
                                                    <div className="min-w-0">
                                                        <span className="block text-xs text-slate-400 font-bold uppercase">Điểm đón khách</span>
                                                        <span className="font-medium text-slate-800 truncate block" title={tour.meeting_point}>
                                                            {tour.meeting_point || 'Chưa cập nhật'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2.5">
                                                    <Users size={16} className="text-emerald-500 shrink-0 mt-0.5"/>
                                                    <div>
                                                        <span className="block text-xs text-slate-400 font-bold uppercase">Số lượng khách</span>
                                                        <span className="font-medium text-slate-800">
                                                            {tour.confirmed_guests || 0} / {tour.max_guests} khách
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Ghi chú phân công */}
                                                {tour.assignment_notes && (
                                                    <div className="flex items-start gap-2.5 sm:col-span-2 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                                        <FileText size={16} className="text-yellow-600 shrink-0 mt-0.5"/>
                                                        <div>
                                                            <span className="block text-[10px] text-yellow-700 font-bold uppercase">Ghi chú công việc</span>
                                                            <span className="text-xs text-slate-700">{tour.assignment_notes}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="p-5 flex flex-col justify-center items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 md:w-[180px] shrink-0">
                                            {isConfirmed ? (
                                                <>
                                                    <div className="flex flex-col items-center text-green-600 mb-1">
                                                        <CheckCircle2 size={28} className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Đã xác nhận</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/my-assignments/${tour.departure_id}`)}
                                                        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        Vận hành <ArrowRight size={16}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-center mb-1">
                                                        <AlertCircle size={28} className="text-amber-500 mx-auto mb-1 animate-bounce" />
                                                        <span className="text-[10px] font-bold text-amber-600 uppercase">Yêu cầu xác nhận</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleConfirmAssignment(tour.assignment_id)}
                                                        disabled={confirmingId === tour.assignment_id}
                                                        className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                                                    >
                                                        {confirmingId === tour.assignment_id ? (
                                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <><Check size={16}/> Nhận việc</>
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/my-assignments/${tour.departure_id}`)}
                                                        className="text-xs text-slate-500 font-medium hover:text-blue-600 underline"
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideTourManager;