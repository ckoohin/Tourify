import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Clock, Loader2, StickyNote, Check, Utensils, BedDouble, CalendarDays, Map, RefreshCw,
  Bus, Camera, Coffee, Info, AlertCircle, CheckCircle2, MapPin, ArrowRight
} from 'lucide-react';
import tourService from '../../../services/api/tourService';
import toast from 'react-hot-toast';
import TourItineraryForm from './TourItineraryForm'; 

const ACTIVITY_TYPES = [
    { value: 'sightseeing', label: 'Tham quan', icon: Camera, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { value: 'transportation', label: 'Di chuyển', icon: Bus, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { value: 'meal', label: 'Ăn uống', icon: Utensils, color: 'text-green-600 bg-green-50 border-green-100' },
    { value: 'accommodation', label: 'Lưu trú', icon: BedDouble, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { value: 'free_time', label: 'Tự do', icon: Coffee, color: 'text-gray-600 bg-gray-50 border-gray-100' },
    { value: 'other', label: 'Khác', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-100' }
];

const TourItineraryManager = ({ tourVersionId , durationDay}) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  
  const safeParseJSON = (data, fallback) => {
    if (typeof data === 'object' && data !== null) {
        return data;
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') return JSON.parse(parsed);
        return parsed;
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  const fetchItineraries = async () => {
    if (!tourVersionId) return;

    setLoading(true);
    try {
      const res = await tourService.getItineraries(tourVersionId);
      if (res.data?.itineraries) {
        const rawList = res.data.itineraries;
        
        const fullDataPromises = rawList.map(async (dayItem) => {
            try {
                const [detailRes, actRes] = await Promise.all([
                    tourService.getItineraryById(dayItem.id),
                    tourService.getActivitiesByItinerary(dayItem.id)
                ]);

                const detailData = detailRes.data?.itinerary || dayItem;
                const realActivities = actRes.data?.activities || [];

                return {
                    ...detailData, 
                    activities: realActivities, 
                    meals: safeParseJSON(detailData.meals, { breakfast: false, lunch: false, dinner: false }),
                    notes: detailData.notes || '' 
                };
            } catch (err) {
                console.error(`Lỗi tải dữ liệu ngày ${dayItem.day_number}:`, err);
                return dayItem;
            }
        });

        const fullDataList = await Promise.all(fullDataPromises);
        const sorted = fullDataList.sort((a, b) => a.day_number - b.day_number);
        setItineraries(sorted);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error('Không thể tải lịch trình. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItineraries(); }, [tourVersionId]);

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    const nextDay = itineraries.length > 0 ? Math.max(...itineraries.map(i => i.day_number)) + 1 : 1;
    if(nextDay > durationDay) {
      alert(`Không thể thêm ngày ${nextDay}. Tour này chỉ có tổng cộng ${durationDay} ngày ${durationDay - 1} đêm.`);
      return;
    }
    setEditingItem({
        day_number: nextDay,
        title: '',
        description: '',
        accommodation: '',
        notes: '',
        meals: { breakfast: false, lunch: false, dinner: false },
        activities: [] 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
        let itineraryId = editingItem?.id;
        const isUpdateMode = !!itineraryId;

        const itineraryPayload = {
            tour_version_id: parseInt(tourVersionId),
            day_number: parseInt(formData.day_number),
            title: formData.title || '',
            description: formData.description || '',
            accommodation: formData.accommodation || '',
            notes: formData.notes || '',
            meals: formData.meals,
            activities: formData.activities.map(a => a.activity_name || '') 
        };

        if (isUpdateMode) {
            await tourService.updateItinerary(itineraryId, itineraryPayload);
        } else {
            const res = await tourService.createItinerary(itineraryPayload);
            itineraryId = res.data?.itinerary?.id || res.data?.insertId || res.data?.id;
            if (!itineraryId) throw new Error("Không lấy được ID lịch trình mới");
        }

        const newActivities = formData.activities || [];
        
        if (isUpdateMode && editingItem.activities) {
            const oldIds = editingItem.activities.map(a => a.id);
            const newIds = newActivities.filter(a => a.id).map(a => a.id);
            const idsToDelete = oldIds.filter(id => !newIds.includes(id));
            await Promise.all(idsToDelete.map(id => tourService.deleteActivity(id)));
        }

        const activityPromises = newActivities.map((act, index) => {
            const actPayload = {
                itinerary_id: itineraryId,
                activity_order: index + 1,
                activity_name: act.activity_name || '',
                activity_type: act.activity_type || 'sightseeing',
                activity_status: act.activity_status || 'not_started',
                start_time: act.start_time || '00:00',
                end_time: act.end_time || null, 
                duration_minutes: act.duration_minutes || null,
                location: act.location || null,
                description: act.description || null,
                check_in_required: act.check_in_required ? 1 : 0,
                check_in_window_before: act.check_in_window_before || 30,
                check_in_window_after: act.check_in_window_after || 15,
                auto_check_in: act.auto_check_in ? 1 : 0,
                notes: act.notes || null
            };

            if (act.id) {
                return tourService.updateActivity(act.id, actPayload);
            } else {
                return tourService.createActivity(actPayload);
            }
        });

        await Promise.all(activityPromises);

        toast.success(isUpdateMode ? 'Cập nhật thành công' : 'Thêm mới thành công');
        handleCloseForm();
        fetchItineraries();

    } catch (error) {
        console.error("Lỗi submit:", error);
        const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || error.message || 'Có lỗi xảy ra.';
        toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch trình ngày này?')) return;
    try {
      await tourService.deleteItinerary(id);
      toast.success('Đã xóa thành công');
      fetchItineraries();
    } catch (error) {
      toast.error('Lỗi khi xóa lịch trình');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('CẢNH BÁO: Xóa TOÀN BỘ lịch trình?')) return;
    try {
      await tourService.deleteAllItineraries(tourVersionId);
      toast.success('Đã xóa toàn bộ');
      fetchItineraries();
    } catch (error) {
      toast.error('Lỗi khi xóa tất cả');
    }
  };

  if (!tourVersionId) return (
    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <Map className="text-slate-400" size={32} />
      </div>
      <p className="text-slate-500 font-medium">Vui lòng chọn một phiên bản tour để quản lý lịch trình.</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Clock size={28} strokeWidth={2} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Lịch trình tour</h3>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
                    <CalendarDays size={16} />
                    <span>Tổng cộng: <span className="text-blue-600 font-bold text-lg">{itineraries.length}</span> ngày</span>
                </div>
            </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {itineraries.length > 0 && (
            <button 
                onClick={handleDeleteAll} 
                className="px-5 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-red-200 whitespace-nowrap"
            >
              Xóa tất cả
            </button>
          )}
          <button 
            onClick={handleOpenCreate} 
            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18}/> Thêm ngày mới
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <TourItineraryForm 
                initialData={editingItem}
                title={editingItem?.id ? `Chỉnh sửa Ngày ${editingItem.day_number}` : 'Thêm ngày lịch trình mới'}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isSubmitting={loading}
            />
        </div>
      )}

      {/* Content */}
      <div className="relative pl-4 md:pl-8 space-y-8 pb-10">
        {/* Timeline Line */}
        <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-transparent"></div>

        {loading && !isModalOpen ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <span className="text-slate-400 text-sm font-medium">Đang tải lịch trình chi tiết...</span>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center mx-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Map className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-medium">Chưa có lịch trình nào.</p>
            <button onClick={handleOpenCreate} className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm">
                Tạo lịch trình ngay
            </button>
          </div>
        ) : (
          itineraries.map((item) => (
            <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Day Badge */}
              <div className="absolute left-0 md:left-2 top-0 w-14 h-14 bg-white border-[3px] border-blue-50 rounded-2xl shadow-md flex flex-col items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">Ngày</span>
                <span className="text-2xl font-black text-blue-600 leading-none">{item.day_number}</span>
              </div>
              
              {/* Main Card */}
              <div className="ml-20 md:ml-24 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10">
                    {/* Header: Title & Actions */}
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-slate-800 pr-20 leading-tight">{item.title}</h4>
                        
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0 absolute top-0 right-0">
                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    
                    {/* Description */}
                    {item.description && (
                        <div className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {item.description}
                        </div>
                    )}
                    
                    {/* ACTIVITIES LIST */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Check size={14} className="text-blue-500"/> Hoạt động chi tiết
                        </h5>
                        
                        {item.activities && item.activities.length > 0 ? (
                            <div className="grid gap-3">
                                {item.activities.map((act, idx) => {
                                    const typeConfig = ACTIVITY_TYPES.find(t => t.value === act.activity_type) || ACTIVITY_TYPES[5];
                                    const Icon = typeConfig.icon;
                                    
                                    return (
                                        <div key={idx} className="flex gap-4 items-start p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                                            {/* Time Column */}
                                            <div className="flex flex-col items-center min-w-[60px] pt-1">
                                                <span className="font-mono text-sm font-bold text-slate-700">{act.start_time?.slice(0,5)}</span>
                                                {act.end_time && (
                                                    <>
                                                        <div className="h-2 w-[1px] bg-slate-200 my-0.5"></div>
                                                        <span className="font-mono text-xs text-slate-400">{act.end_time?.slice(0,5)}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeConfig.color}`}>
                                                <Icon size={14} strokeWidth={2.5}/>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h6 className="font-bold text-slate-800 text-sm truncate">{act.activity_name}</h6>
                                                    {act.check_in_required === 1 && (
                                                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                                                            <CheckCircle2 size={10} /> Check-in
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {act.location && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5 font-medium">
                                                        <MapPin size={10} /> {act.location}
                                                    </div>
                                                )}
                                                
                                                {act.description && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <span className="text-slate-400 text-xs italic">Chưa có hoạt động chi tiết.</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Info: Meals & Hotel & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                    <Utensils size={14} className="text-orange-500"/> Ăn uống
                                </h5>
                                <div className="flex gap-2">
                                    {item.meals && (item.meals.breakfast || item.meals.lunch || item.meals.dinner) ? (
                                        <>
                                            {item.meals.breakfast && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">Sáng</span>}
                                            {item.meals.lunch && <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">Trưa</span>}
                                            {item.meals.dinner && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">Tối</span>}
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-500 italic bg-slate-50 px-2 py-1 rounded-lg">Tự túc</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {item.accommodation && (
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                        <BedDouble size={14} className="text-purple-500"/> Nghỉ đêm
                                    </h5>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-purple-50/50 px-3 py-2 rounded-lg border border-purple-100 w-fit">
                                        <BedDouble size={16} className="text-purple-600"/>
                                        {item.accommodation}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                        <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
                            <div className="flex items-start gap-3 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                                <StickyNote size={16} className="mt-0.5 shrink-0 text-yellow-600"/>
                                <span className="text-sm text-slate-600 italic">{item.notes}</span>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TourItineraryManager;