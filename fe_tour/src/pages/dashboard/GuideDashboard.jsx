import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Clock, 
  ArrowRight, CheckCircle2, AlertCircle, 
  TrendingUp, Briefcase, ChevronRight, Phone, 
  UserCog
} from 'lucide-react';
import staffAssignmentService from '../../services/api/staffAssignmentService';
import toast from 'react-hot-toast';

const GuideDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({
    totalMonth: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await staffAssignmentService.getMyTours({ limit: 10 });
        
        let list = [];
        if (res.data && Array.isArray(res.data.data)) {
            list = res.data.data;
        } else if (Array.isArray(res.data)) {
            list = res.data;
        }

        setTours(list);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthTours = list.filter(t => {
            const d = new Date(t.departure_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const upcoming = list.filter(t => new Date(t.departure_date) > now && t.departure_status !== 'cancelled');
        
        setStats({
            totalMonth: monthTours.length,
            upcoming: upcoming.length,
            completed: list.filter(t => t.departure_status === 'completed').length
        });

      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroTour = useMemo(() => {
    const now = new Date();
    const ongoing = tours.find(t => {
        const start = new Date(t.departure_date);
        const end = new Date(t.return_date);
        return start <= now && end >= now && t.departure_status !== 'cancelled';
    });
    
    if (ongoing) return { ...ongoing, highlightType: 'ongoing' };

    const upcoming = tours
        .filter(t => new Date(t.departure_date) > now && t.departure_status !== 'cancelled')
        .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date))[0];

    if (upcoming) return { ...upcoming, highlightType: 'upcoming' };

    return null;
  }, [tours]);

  const nextTours = useMemo(() => {
    if (!heroTour) return [];
    return tours
        .filter(t => t.assignment_id !== heroTour.assignment_id && t.departure_status !== 'completed' && t.departure_status !== 'cancelled')
        .slice(0, 3);
  }, [tours, heroTour]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  };

  const getDayName = (dateString) => {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[new Date(dateString).getDay()];
  };

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Đang cập nhật lịch trình...</p>
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex justify-between items-end px-1">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
            <h1 className="text-2xl font-bold text-slate-800">
                Xin chào, {user?.name || 'HDV'}! 👋
            </h1>
        </div>
        <Link to="/profile" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50">
            <UserCog size={20} className="text-slate-600"/>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-2 opacity-80 mb-1">
                <Briefcase size={16}/> <span className="text-xs font-medium">Tháng này</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalMonth}</div>
            <div className="text-[10px] opacity-80 mt-1">Nhiệm vụ</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar size={16}/> <span className="text-xs font-medium">Sắp tới</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.upcoming}</div>
            <div className="text-[10px] text-slate-400 mt-1">Chuyến đi</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <CheckCircle2 size={16}/> <span className="text-xs font-medium">Đã xong</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
            <div className="text-[10px] text-slate-400 mt-1">Hoàn thành</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {heroTour?.highlightType === 'ongoing' ? (
                    <><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span> Đang diễn ra</>
                ) : (
                    <><Calendar size={18} className="text-blue-600"/> Chuyến đi tiếp theo</>
                )}
            </h2>
            {heroTour && (
                <Link to={`/my-assignments/${heroTour.departure_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Chi tiết
                </Link>
            )}
        </div>

        {heroTour ? (
            <div className="group relative bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/10">
                {/* Status Bar */}
                <div className={`h-2 w-full ${heroTour.highlightType === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                
                <div className="p-6">
                    {/* Date Badge */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 px-4 flex flex-col items-center min-w-[70px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">{getDayName(heroTour.departure_date)}</span>
                            <span className="text-2xl font-black text-slate-800">{new Date(heroTour.departure_date).getDate()}</span>
                            <span className="text-xs font-bold text-slate-500">Thg {new Date(heroTour.departure_date).getMonth() + 1}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                 heroTour.highlightType === 'ongoing' 
                                 ? 'bg-green-100 text-green-700 border border-green-200' 
                                 : 'bg-blue-100 text-blue-700 border border-blue-200'
                             }`}>
                                 {heroTour.highlightType === 'ongoing' ? 'Đang vận hành' : 'Sắp khởi hành'}
                             </span>
                             <span className="text-xs font-mono text-slate-400">#{heroTour.departure_code}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                        {heroTour.tour_name}
                    </h3>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Clock size={18}/></div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase">Thời gian</span>
                                <span className="text-sm font-semibold text-slate-700">{heroTour.duration_days}N{heroTour.duration_nights}Đ</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Users size={18}/></div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase">Khách đoàn</span>
                                <span className="text-sm font-semibold text-slate-700">{heroTour.confirmed_guests}/{heroTour.max_guests} Khách</span>
                            </div>
                        </div>
                        <div className="col-span-2 flex items-start gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><MapPin size={18}/></div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-xs text-slate-400 font-bold uppercase">Điểm tập trung</span>
                                <span className="text-sm font-semibold text-slate-700 truncate block">{heroTour.meeting_point || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        {heroTour.highlightType === 'ongoing' ? (
                            <>
                                <Link to={`/my-assignments/${heroTour.departure_id}`} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                                    <CheckCircle2 size={18}/> Điểm danh
                                </Link>
                                <Link to={`/my-assignments/${heroTour.departure_id}`} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all">
                                    <Clock size={18}/> Nhật ký
                                </Link>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate(`/my-assignments/${heroTour.departure_id}`)} // Mở tab Guests
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                                >
                                    <Users size={18}/> Xem DS Khách
                                </button>
                                <button 
                                    onClick={() => navigate(`/my-assignments/${heroTour.departure_id}`)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    Vào Tour <ArrowRight size={18}/>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                    <Briefcase size={32}/>
                </div>
                <h3 className="text-lg font-bold text-slate-600">Chưa có lịch trình</h3>
                <p className="text-slate-400 text-sm mt-1">Bạn hiện không có tour nào sắp tới.</p>
            </div>
        )}
      </div>

      {/* 4. Upcoming List */}
      {nextTours.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-800">Lịch trình khác</h2>
                <Link to="/departures_guide" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
                    Xem tất cả <ChevronRight size={14}/>
                </Link>
            </div>
            
            <div className="space-y-3">
                {nextTours.map(tour => (
                    <div key={tour.assignment_id} onClick={() => navigate(`/my-assignments/${tour.departure_id}`)} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-xl shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <span className="text-xs font-bold uppercase">{getDayName(tour.departure_date)}</span>
                            <span className="text-lg font-bold">{new Date(tour.departure_date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{tour.tour_name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Clock size={12}/> {tour.duration_days}N{tour.duration_nights}Đ</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="font-mono">#{tour.departure_code}</span>
                            </div>
                        </div>
                        <div className="shrink-0 text-slate-300">
                            <ChevronRight size={20}/>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default GuideDashboard;