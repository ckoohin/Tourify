import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Calendar, MapPin, 
  ArrowRight, CheckCircle, Clock, AlertCircle, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';

import departureService from '../../../services/api/departureService';

const TourRatingDashboard = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departureService.getAll({ 
          page: 1, 
          limit: 100 
      });

      if (res.data && res.data.data) {
        const rawData = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || [];
        
        const enrichedData = rawData.map(item => {
            const total = Math.floor(Math.random() * 6) + 3; 
            const rated = Math.floor(Math.random() * (total + 1));
            
            return {
                ...item,
                rating_stats: {
                    total_suppliers: total,
                    rated_suppliers: rated,
                    is_completed: total === rated && total > 0
                }
            };
        });
        
        setDepartures(enrichedData);
        calculateStats(enrichedData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error("Không thể tải danh sách chuyến đi");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
      const completed = data.filter(d => d.rating_stats.is_completed).length;
      setStats({
          total: data.length,
          completed: completed,
          pending: data.length - completed
      });
  };

  const filteredDepartures = departures.filter(dep => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
        (dep.departure_code && dep.departure_code.toLowerCase().includes(searchLower)) || 
        (dep.tour?.name && dep.tour.name.toLowerCase().includes(searchLower)) ||
        (dep.name && dep.name.toLowerCase().includes(searchLower)); 

    let matchStatus = true;
    if (statusFilter === 'completed') matchStatus = dep.rating_stats.is_completed;
    if (statusFilter === 'incomplete') matchStatus = !dep.rating_stats.is_completed;

    return matchSearch && matchStatus;
  });

  const renderStatusBadge = (stats) => {
      if (stats.is_completed) {
          return (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200 shadow-sm">
                  <CheckCircle size={12}/> HOÀN TẤT
              </span>
          );
      }
      if (stats.rated_suppliers === 0) {
          return (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-200 shadow-sm">
                  <AlertCircle size={12}/> CHƯA ĐÁNH GIÁ
              </span>
          );
      }
      return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200 shadow-sm">
              <Clock size={12}/> ĐANG THỰC HIỆN
          </span>
      );
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="animate-pulse space-y-6">
                <div className="h-10 bg-slate-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      
      {/* 1. Header Section & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Đánh giá Dịch vụ</h1>
            <p className="text-slate-500 mt-1 text-sm">Quản lý chất lượng nhà cung cấp qua từng chuyến đi</p>
        </div>
        
        {/* Mini Stats Cards */}
        <div className="flex gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center flex-1 md:flex-none">
                <div className="text-xs text-slate-500 uppercase font-bold">Cần đánh giá</div>
                <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center flex-1 md:flex-none">
                <div className="text-xs text-slate-500 uppercase font-bold">Hoàn tất</div>
                <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            </div>
        </div>
      </div>

      {/* 2. Filter & Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20">
        
        {/* Search Box */}
        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Tìm mã tour, tên tour..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 w-full md:w-auto bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {[
                { key: 'all', label: 'Tất cả' },
                { key: 'incomplete', label: 'Cần làm' },
                { key: 'completed', label: 'Xong' }
            ].map(filter => (
                <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        statusFilter === filter.key 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
      </div>

      {/* 3. Main Grid List */}
      {filteredDepartures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Filter size={32}/>
              </div>
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy chuyến đi phù hợp</h3>
              <p className="text-slate-500 mt-1 text-sm">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDepartures.map((dep) => {
                const { rated_suppliers, total_suppliers } = dep.rating_stats;
                const percentage = total_suppliers > 0 
                    ? Math.round((rated_suppliers / total_suppliers) * 100) 
                    : 0;

                return (
                    <div 
                        key={dep.id} 
                        onClick={() => navigate(`/operations/departures/${dep.id}/supplier-ratings`)}
                        className="group bg-white border border-slate-200 rounded-xl p-0 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Card Header */}
                        <div className="p-5 pb-3">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                    {dep.departure_code}
                                </span>
                                {renderStatusBadge(dep.rating_stats)}
                            </div>

                            <h3 
                                className="font-bold text-slate-800 text-base mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-700 transition-colors" 
                                title={dep.tour?.name || dep.name}
                            >
                                {dep.tour?.name || dep.name || 'Chuyến đi chưa đặt tên'}
                            </h3>
                        </div>

                        {/* Card Body Info */}
                        <div className="px-5 space-y-2 mb-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400"/>
                                <span>
                                    {new Date(dep.departure_date).toLocaleDateString('vi-VN')} 
                                    <span className="mx-1 text-slate-300">→</span> 
                                    {new Date(dep.return_date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-400"/>
                                <span>{dep.confirmed_guests || 0}/{dep.max_guests} khách</span>
                            </div>
                            {dep.meeting_point && (
                                <div className="flex items-center gap-2 line-clamp-1">
                                    <MapPin size={14} className="text-slate-400 shrink-0"/>
                                    <span className="truncate">{dep.meeting_point}</span>
                                </div>
                            )}
                        </div>

                        {/* Card Footer: Progress Bar */}
                        <div className="mt-auto px-5 pb-5 pt-3 border-t border-slate-50 bg-slate-50/50 group-hover:bg-blue-50/10 transition-colors">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ đánh giá</span>
                                <span className="text-sm font-bold text-slate-800">
                                    <span className={percentage === 100 ? "text-green-600" : "text-blue-600"}>{rated_suppliers}</span>
                                    <span className="text-slate-400 mx-0.5">/</span>
                                    {total_suppliers}
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out relative ${percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${percentage}%` }}
                                >
                                    {/* Shimmer effect for active progress */}
                                    {percentage < 100 && percentage > 0 && (
                                        <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-shimmer"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
      )}
    </div>
  );
};

export default TourRatingDashboard;