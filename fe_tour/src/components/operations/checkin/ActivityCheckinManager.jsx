import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, AlertTriangle, RefreshCw, Database, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import checkinService from '../../../services/api/checkinService'; 
import GuestCheckinList from './GuestCheckinList'; 
import CheckinStats from './CheckinStats'; 

const ActivityCheckinManager = ({ departureId, startDate }) => { 
    const [selectedDate, setSelectedDate] = useState(() => {
        if (startDate) return startDate.split('T')[0];
        return new Date().toISOString().split('T')[0];
    });

    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false); 

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);

    // Load thống kê
    const fetchStats = () => {
        if(departureId) {
            setStatsLoading(true);
            checkinService.getStats(departureId)
                .then(res => setStats(res.data))
                .catch(console.error)
                .finally(() => setStatsLoading(false));
        }
    };

    useEffect(() => {
        fetchStats();
    }, [departureId]);

    const fetchActivities = () => {
        if (departureId && selectedDate) {
            setLoading(true);
            checkinService.getActivitiesByDate(departureId, selectedDate)
                .then(res => {
                    const acts = res.data?.activities || [];
                    setActivities(acts);
                    
                    if (acts.length > 0) {
                        if (!selectedActivity || !acts.find(a => a.activity_id === selectedActivity.activity_id)) {
                            setSelectedActivity(acts[0]);
                        } else {
                            const updated = acts.find(a => a.activity_id === selectedActivity.activity_id);
                            setSelectedActivity(updated);
                        }
                    } else {
                        setSelectedActivity(null);
                    }
                })
                .catch(err => console.error("Lỗi tải hoạt động"))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        if (startDate) {
            setSelectedDate(startDate.split('T')[0]);
        }
    }, [startDate]);

    useEffect(() => {
        if (stats && stats.total_checkins > 0) {
            fetchActivities();
        }
    }, [departureId, selectedDate, stats?.total_checkins]);

    const handleInitialize = async () => {
        setInitializing(true);
        try {
            await checkinService.initializeCheckins(departureId);
            toast.success("Đồng bộ lịch trình thành công!");
            await fetchStats(); 
        } catch (error) {
            toast.error("Lỗi khởi tạo dữ liệu");
        } finally {
            setInitializing(false);
        }
    };

    const handleUpdate = () => {
        fetchStats();     
        fetchActivities(); 
    };

    const isNotInitialized = !statsLoading && stats && stats.total_checkins === 0;

    if (isNotInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl min-h-[400px]">
                <div className="w-20 h-20 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-6 relative">
                    <Database size={32} className="text-slate-400" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">!</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu điểm danh</h3>
                <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
                    Chuyến đi này chưa được đồng bộ với lịch trình từ phiên bản tour. <br/>
                    Vui lòng khởi tạo để tạo danh sách điểm danh.
                </p>
                
                <button
                    onClick={handleInitialize}
                    disabled={initializing}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-70"
                >
                    {initializing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    {initializing ? "Đang đồng bộ..." : "Khởi tạo dữ liệu ngay"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6 p-1">
            {/* 1. Header Toolbar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm hover:border-blue-400 transition-colors">
                        <Calendar size={16} className="text-slate-400"/>
                        <input 
                            type="date" 
                            className="text-sm font-bold text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    onClick={() => {
                        if(window.confirm("Bạn có chắc muốn đồng bộ lại? Dữ liệu cũ có thể bị ảnh hưởng.")) handleInitialize();
                    }}
                    disabled={initializing}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    title="Đồng bộ lại nếu có thay đổi về danh sách khách hoặc lịch trình"
                >
                    <RefreshCw size={14} className={initializing ? "animate-spin" : ""} />
                    Đồng bộ lại
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <CheckinStats stats={stats} loading={statsLoading} />
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-[500px]">
                <div className="col-span-12 lg:col-span-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden max-h-[600px]">
                    <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase flex justify-between items-center">
                        <span>Hoạt động</span>
                        <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[10px]">{activities.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <Loader2 className="animate-spin" size={24}/>
                                <span className="text-xs">Đang tải...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <div className="mx-auto w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                                    <Clock className="text-slate-400" size={20}/>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Không có hoạt động</p>
                                <p className="text-xs text-slate-400 mt-1">Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')} chưa có lịch trình.</p>
                            </div>
                        ) : (
                            activities.map((act) => (
                                <div 
                                    key={act.activity_id}
                                    onClick={() => setSelectedActivity(act)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border relative overflow-hidden group ${
                                        selectedActivity?.activity_id === act.activity_id 
                                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500 z-10' 
                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                    }`}
                                >
                                    {selectedActivity?.activity_id === act.activity_id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-1 pl-2">
                                        <span className={`font-bold text-sm line-clamp-2 ${selectedActivity?.activity_id === act.activity_id ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {act.activity_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 pl-2 mt-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                            selectedActivity?.activity_id === act.activity_id ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 border-slate-200'
                                        }`}>
                                            {act.start_time?.slice(0,5)}
                                        </span>
                                        <span className="flex items-center gap-1 ml-auto">
                                            <Users size={12}/> {act.checkins?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-9 h-full min-h-[500px]">
                    {selectedActivity ? (
                        <GuestCheckinList 
                            activity={selectedActivity} 
                            departureId={departureId}
                            onUpdate={handleUpdate}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} className="text-slate-300"/>
                            </div>
                            <p className="font-medium text-slate-500">Chọn một hoạt động để bắt đầu điểm danh</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityCheckinManager;