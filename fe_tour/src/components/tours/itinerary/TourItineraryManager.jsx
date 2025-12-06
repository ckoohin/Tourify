import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Clock, Loader2, StickyNote, Check, Utensils, BedDouble, CalendarDays, Map
} from 'lucide-react';
import tourService from '../../../services/api/tourService';
import toast from 'react-hot-toast';
import TourItineraryForm from './TourItineraryForm'; 

const TourItineraryManager = ({ tourVersionId }) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý hiển thị Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  
  // --- HELPER: Parse JSON an toàn ---
  const safeParseJSON = (data, fallback) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    }
    return data || fallback;
  };

  // --- FETCH DATA ---
  const fetchItineraries = async () => {
    if (!tourVersionId) return;

    setLoading(true);
    try {
      const res = await tourService.getItineraries(tourVersionId);
      
      if (res.success) {
        const rawList = res.data.itineraries || [];
        
        // Fetch chi tiết
        const detailedDataPromises = rawList.map(async (item) => {
            try {
                const detailRes = await tourService.getItineraryById(item.id);
                if (detailRes.success && detailRes.data.itinerary) {
                    return detailRes.data.itinerary; 
                }
                return item; 
            } catch (err) {
                return item;
            }
        });

        const fullDataList = await Promise.all(detailedDataPromises);

        const normalizedList = fullDataList.map(item => ({
          ...item,
          activities: safeParseJSON(item.activities, []),
          meals: safeParseJSON(item.meals, { breakfast: false, lunch: false, dinner: false }),
          notes: item.notes || '' 
        }));

        const sorted = normalizedList.sort((a, b) => a.day_number - b.day_number);
        setItineraries(sorted);
      }
    } catch (error) {
      console.error("Lỗi tải lịch trình:", error);
      toast.error('Không thể tải lịch trình. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItineraries(); }, [tourVersionId]);

  // --- ACTION HANDLERS ---

  const handleOpenCreate = () => {
    const nextDay = itineraries.length > 0 ? Math.max(...itineraries.map(i => i.day_number)) + 1 : 1;
    setEditingItem({
        day_number: nextDay,
        title: '',
        description: '',
        accommodation: '',
        notes: '',
        meals: { breakfast: false, lunch: false, dinner: false },
        activities: ['']
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
    const cleanData = {
        ...formData,
        day_number: parseInt(formData.day_number),
        tour_version_id: parseInt(tourVersionId),
    };

    try {
        if (editingItem && editingItem.id) {
            await tourService.updateItinerary(editingItem.id, cleanData);
            toast.success('Cập nhật lịch trình thành công');
        } else {
            await tourService.createItinerary(cleanData);
            toast.success('Thêm ngày mới thành công');
        }
        handleCloseForm();
        fetchItineraries();
    } catch (error) {
        console.error("Lỗi submit:", error);
        const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại.';
        toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch trình ngày này?')) return;
    try {
      await tourService.deleteItinerary(id);
      toast.success('Đã xóa thành công');
      fetchItineraries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa lịch trình');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ lịch trình của phiên bản này. Bạn có chắc không?')) return;
    try {
      await tourService.deleteAllItineraries(tourVersionId);
      toast.success('Đã xóa toàn bộ lịch trình');
      setItineraries([]);
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
      {/* Header Stat Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                <Clock size={32} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Lịch trình tour</h3>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
                    <CalendarDays size={16} />
                    <span>Tổng cộng: <span className="text-blue-600 font-bold text-lg">{itineraries.length}</span> ngày tham quan</span>
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

      {/* MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click outside to close can be handled here if needed, but for forms, it's safer to require button click */}
            <TourItineraryForm 
                initialData={editingItem}
                title={editingItem?.id ? `Chỉnh sửa Ngày ${editingItem.day_number}` : 'Thêm ngày lịch trình mới'}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isSubmitting={loading}
            />
        </div>
      )}

      {/* Timeline List Display */}
      <div className="relative pl-4 md:pl-8 space-y-8">
        {/* Timeline Line */}
        <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-transparent"></div>

        {loading && !isModalOpen ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <span className="text-slate-400 text-sm font-medium">Đang tải lịch trình...</span>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center mx-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Map className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-medium">Chưa có lịch trình nào.</p>
            <p className="text-slate-400 text-sm mt-1">Hãy bắt đầu bằng cách thêm "Ngày 1".</p>
            <button onClick={handleOpenCreate} className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm">
                Tạo lịch trình ngay
            </button>
          </div>
        ) : (
          itineraries.map((item) => (
            <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Day Number Badge */}
              <div className="absolute left-0 md:left-2 top-0 w-14 h-14 bg-white border-[3px] border-blue-50 rounded-2xl shadow-md flex flex-col items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">Ngày</span>
                <span className="text-2xl font-black text-blue-600 leading-none">{item.day_number}</span>
              </div>
              
              {/* Content Card */}
              <div className="ml-20 md:ml-24 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-slate-800 pr-20">{item.title}</h4>
                        
                        {/* Action Buttons (Visible on Hover) */}
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0 absolute top-0 right-0">
                            <button 
                                onClick={() => handleOpenEdit(item)} 
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm" 
                                title="Chỉnh sửa"
                            >
                                <Edit2 size={16}/>
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)} 
                                className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm" 
                                title="Xóa"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {item.description || <span className="italic text-slate-400">Chưa có mô tả chi tiết.</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Activities List */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                <Check size={14} className="text-blue-500"/> Hoạt động nổi bật
                            </h5>
                            {item.activities && Array.isArray(item.activities) && item.activities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {item.activities.map((act, idx) => (
                                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 transition-colors cursor-default">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                            {act}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-400 text-sm italic pl-1">Chưa cập nhật hoạt động.</span>
                            )}
                        </div>

                        {/* Info Badges */}
                        <div className="space-y-4">
                            {/* Meals */}
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                    <Utensils size={14} className="text-orange-500"/> Ăn uống
                                </h5>
                                <div className="flex items-center gap-2">
                                    {['breakfast', 'lunch', 'dinner'].some(k => item.meals?.[k]) ? (
                                        <div className="flex gap-2">
                                            {item.meals?.breakfast && <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded border border-orange-100">Sáng</span>}
                                            {item.meals?.lunch && <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded border border-orange-100">Trưa</span>}
                                            {item.meals?.dinner && <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded border border-orange-100">Tối</span>}
                                        </div>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Tự túc</span>
                                    )}
                                </div>
                            </div>

                            {/* Hotel */}
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