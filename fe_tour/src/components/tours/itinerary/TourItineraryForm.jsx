import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, X, Edit2, 
  Utensils, BedDouble, StickyNote, MapPin, List, Clock, Map, CheckCircle2, 
  Bus, Camera, Coffee, Info, AlertCircle, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

// Danh sách loại hoạt động khớp với ENUM trong Database
const ACTIVITY_TYPES = [
    { value: 'sightseeing', label: 'Tham quan', icon: Camera, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { value: 'transportation', label: 'Di chuyển', icon: Bus, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { value: 'meal', label: 'Ăn uống', icon: Utensils, color: 'text-green-600 bg-green-50 border-green-100' },
    { value: 'accommodation', label: 'Lưu trú', icon: BedDouble, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { value: 'free_time', label: 'Tự do', icon: Coffee, color: 'text-gray-600 bg-gray-50 border-gray-100' },
    { value: 'other', label: 'Khác', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-100' }
];

const TourItineraryForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  title 
}) => {
  const [activeTab, setActiveTab] = useState('general'); // general | activities

  // Cấu trúc mặc định ĐẦY ĐỦ cho một hoạt động (Tránh lỗi undefined khi submit)
  const defaultActivity = {
      activity_name: '',
      activity_type: 'sightseeing',
      start_time: '',
      end_time: '',
      location: '',
      description: '',
      check_in_required: false,
      check_in_window_before: 30, // Mặc định 30 phút
      check_in_window_after: 15,  // Mặc định 15 phút
      auto_check_in: false,
      activity_status: 'not_started'
  };

  const defaultFormState = {
    day_number: '',
    title: '',
    description: '',
    accommodation: '',
    notes: '',
    meals: { breakfast: false, lunch: false, dinner: false },
    activities: [ { ...defaultActivity } ] 
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [errors, setErrors] = useState({});

  // Khởi tạo dữ liệu khi mở form (Edit mode)
  useEffect(() => {
    if (initialData) {
      let mergedMeals = { breakfast: false, lunch: false, dinner: false };
      if (initialData.meals) {
          mergedMeals = typeof initialData.meals === 'string' 
            ? JSON.parse(initialData.meals) 
            : initialData.meals;
      }

      let parsedActivities = [];
      const rawActs = initialData.activities;
      
      if (Array.isArray(rawActs)) {
          parsedActivities = rawActs.map(act => {
              if (typeof act === 'string') {
                  return { ...defaultActivity, activity_name: act };
              }
              // Merge với default để đảm bảo có đủ trường (tránh undefined)
              return { ...defaultActivity, ...act };
          });
      }
      
      if (parsedActivities.length === 0) parsedActivities = [{ ...defaultActivity }];

      setFormData({
        ...defaultFormState,
        ...initialData,
        meals: mergedMeals,
        activities: parsedActivities
      });
    } else {
        setFormData(defaultFormState);
    }
  }, [initialData]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleMealChange = (mealType) => {
    setFormData(prev => ({
      ...prev,
      meals: { ...prev.meals, [mealType]: !prev.meals[mealType] }
    }));
  };

  const handleActivityChange = (index, field, value) => {
    const newActivities = [...formData.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setFormData(prev => ({ ...prev, activities: newActivities }));
    
    if (errors[`activities[${index}].${field}`]) {
        const newErrs = { ...errors };
        delete newErrs[`activities[${index}].${field}`];
        setErrors(newErrs);
    }
  };

  const addActivityLine = () => {
    setFormData(prev => ({ 
        ...prev, 
        activities: [...prev.activities, { ...defaultActivity }] 
    }));
  };

  const removeActivityLine = (index) => {
    const newActivities = formData.activities.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, activities: newActivities }));
  };

  // --- VALIDATION & SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.day_number || formData.day_number < 1) newErrors.day_number = "Ngày số không hợp lệ";
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";

    formData.activities.forEach((act, idx) => {
        const hasData = act.activity_name.trim() || act.start_time;
        if (hasData) {
            if (!act.start_time) newErrors[`activities[${idx}].start_time`] = "Thiếu giờ";
            if (!act.activity_name.trim()) newErrors[`activities[${idx}].activity_name`] = "Thiếu tên";
        }
    });

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Vui lòng kiểm tra lại thông tin");
        if (newErrors.day_number || newErrors.title) setActiveTab('general');
        else setActiveTab('activities');
        return;
    }

    const cleanActivities = formData.activities.filter(a => a.activity_name.trim() && a.start_time);

    onSubmit({
        ...formData,
        activities: cleanActivities
    });
  };

  return (
    <div className="bg-white w-full max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${initialData?.id ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                {initialData?.id ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-lg leading-tight">{title}</h4>
                <p className="text-xs text-slate-500 font-medium">Điền thông tin chi tiết cho ngày lịch trình</p>
            </div>
        </div>
        <button onClick={onCancel} type="button" className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all">
          <X size={24}/>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Map size={16}/> Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'activities' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <List size={16}/> Hoạt động chi tiết 
            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px]">{formData.activities.length}</span>
          </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-6">
        <form id="itinerary-form" onSubmit={handleSubmit} className="h-full">
          
          {/* TAB 1: THÔNG TIN CHUNG */}
          <div className={activeTab === 'general' ? 'block space-y-6' : 'hidden'}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-3 lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ngày số <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                            type="number" name="day_number" min="1" 
                            className={`w-full border rounded-xl px-3 py-3 text-center font-bold text-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.day_number ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 text-blue-600'}`}
                            value={formData.day_number || ''} onChange={handleInputChange} 
                        />
                        <span className="absolute top-1/2 -translate-y-1/2 left-3 text-xs font-bold text-slate-300">#</span>
                      </div>
                      {errors.day_number && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.day_number}</p>}
                    </div>
                    <div className="col-span-9 lg:col-span-10">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tiêu đề hành trình <span className="text-red-500">*</span></label>
                      <input 
                        type="text" name="title" 
                        className={`w-full border rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                        value={formData.title || ''} onChange={handleInputChange} 
                        placeholder="VD: Hà Nội - Đón sân bay - City Tour" 
                      />
                      {errors.title && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.title}</p>}
                    </div>
                    <div className="col-span-12">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mô tả tổng quan</label>
                        <textarea 
                          name="description" rows={4}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all" 
                          value={formData.description || ''} onChange={handleInputChange} 
                          placeholder="Mô tả ngắn gọn về hành trình, điểm nhấn trong ngày..." 
                        />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bữa ăn */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Utensils size={16}/></div> 
                        Các bữa ăn bao gồm
                      </label>
                      <div className="flex gap-3">
                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                          <label 
                            key={meal} 
                            className={`flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer select-none py-4 rounded-xl border-2 transition-all ${
                              formData.meals[meal] 
                              ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                              : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <input type="checkbox" checked={!!formData.meals[meal]} onChange={() => handleMealChange(meal)} className="hidden" />
                            <span className="font-bold text-xs uppercase tracking-wide">{meal === 'breakfast' ? 'Sáng' : meal === 'lunch' ? 'Trưa' : 'Tối'}</span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${formData.meals[meal] ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                                {formData.meals[meal] && <CheckCircle2 size={12} strokeWidth={4} />}
                            </div>
                          </label>
                        ))}
                      </div>
                  </div>

                  {/* Thông tin khác */}
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <BedDouble size={14} className="text-purple-500"/> Khách sạn / Lưu trú
                          </label>
                          <input 
                            type="text" name="accommodation" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all font-medium text-slate-700" 
                            value={formData.accommodation || ''} onChange={handleInputChange} 
                            placeholder="VD: Khách sạn Mường Thanh 4*" 
                          />
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <StickyNote size={14} className="text-yellow-500"/> Ghi chú nội bộ
                          </label>
                          <input 
                            type="text" name="notes" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-yellow-200 outline-none transition-all text-slate-700" 
                            value={formData.notes || ''} onChange={handleInputChange} 
                            placeholder="Lưu ý cho điều hành..." 
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* TAB 2: HOẠT ĐỘNG CHI TIẾT */}
          <div className={activeTab === 'activities' ? 'block pb-20' : 'hidden'}>
              <div className="relative pl-6 space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                  {formData.activities.map((act, idx) => {
                      const typeConfig = ACTIVITY_TYPES.find(t => t.value === act.activity_type) || ACTIVITY_TYPES[5];
                      const TypeIcon = typeConfig.icon;

                      return (
                        <div key={idx} className="relative group animate-in slide-in-from-bottom-2 duration-300">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[19px] top-4 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${typeConfig.color}`}>
                                <TypeIcon size={18} />
                            </div>

                            {/* Activity Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm ml-6 hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden">
                                {/* Header Strip */}
                                <div className={`h-1 w-full ${typeConfig.color.split(' ')[1].replace('bg-', 'bg-')}`}></div>
                                
                                <div className="p-5">
                                    {/* Remove Button */}
                                    <button 
                                        type="button" 
                                        onClick={() => removeActivityLine(idx)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Xóa hoạt động này"
                                    >
                                        <Trash2 size={18}/>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        
                                        {/* Column 1: Time & Check-in */}
                                        <div className="col-span-1 md:col-span-4 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Thời gian <span className="text-red-500">*</span></label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="time" 
                                                        className={`flex-1 text-sm font-bold font-mono bg-slate-50 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none ${errors[`activities[${idx}].start_time`] ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                                        value={act.start_time || ''} 
                                                        onChange={(e) => handleActivityChange(idx, 'start_time', e.target.value)}
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <input 
                                                        type="time" 
                                                        className="flex-1 text-sm font-bold font-mono bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                                        value={act.end_time || ''} 
                                                        onChange={(e) => handleActivityChange(idx, 'end_time', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Check-in Toggle & Options */}
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                        checked={!!act.check_in_required}
                                                        onChange={(e) => handleActivityChange(idx, 'check_in_required', e.target.checked)}
                                                    />
                                                    <span className="text-sm font-bold text-slate-700">Yêu cầu điểm danh</span>
                                                </label>
                                                
                                                {act.check_in_required && (
                                                    <div className="grid grid-cols-2 gap-2 mt-2 animate-in slide-in-from-top-1 duration-200">
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 block mb-1">Mở trước (phút)</label>
                                                            <input 
                                                                type="number" min="0"
                                                                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-blue-300 outline-none text-center font-medium"
                                                                value={act.check_in_window_before ?? 30}
                                                                onChange={(e) => handleActivityChange(idx, 'check_in_window_before', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-400 block mb-1">Đóng sau (phút)</label>
                                                            <input 
                                                                type="number" min="0"
                                                                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-blue-300 outline-none text-center font-medium"
                                                                value={act.check_in_window_after ?? 15}
                                                                onChange={(e) => handleActivityChange(idx, 'check_in_window_after', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2: Main Info */}
                                        <div className="col-span-1 md:col-span-8 space-y-4">
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-8">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Tên hoạt động <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className={`w-full text-base font-bold border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors[`activities[${idx}].activity_name`] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                                        value={act.activity_name || ''} 
                                                        onChange={(e) => handleActivityChange(idx, 'activity_name', e.target.value)}
                                                        placeholder="VD: Tham quan Bảo tàng..."
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Loại hình</label>
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer appearance-none"
                                                            value={act.activity_type || 'sightseeing'}
                                                            onChange={(e) => handleActivityChange(idx, 'activity_type', e.target.value)}
                                                        >
                                                            {ACTIVITY_TYPES.map(t => (
                                                                <option key={t.value} value={t.value}>{t.label}</option>
                                                            ))}
                                                        </select>
                                                        {/* Custom Arrow */}
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Địa điểm</label>
                                                <div className="relative">
                                                    <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                                    <input 
                                                        type="text" 
                                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                        value={act.location || ''} 
                                                        onChange={(e) => handleActivityChange(idx, 'location', e.target.value)}
                                                        placeholder="Nhập địa điểm cụ thể..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Mô tả chi tiết</label>
                                                <textarea 
                                                    rows={1}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none overflow-hidden min-h-[42px]"
                                                    value={act.description || ''} 
                                                    onChange={(e) => {
                                                        handleActivityChange(idx, 'description', e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    placeholder="Ghi chú thêm về hoạt động này..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      );
                  })}

                  <button 
                      type="button" 
                      onClick={addActivityLine} 
                      className="ml-6 w-[calc(100%-24px)] py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group mt-4"
                  >
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <Plus size={18} className="text-slate-400 group-hover:text-blue-700"/>
                      </div>
                      Thêm hoạt động tiếp theo
                  </button>
              </div>
          </div>

        </form>
      </div>

      {/* Footer */}
      <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={onCancel} type="button" className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-sm font-bold transition-all">
          Hủy bỏ
        </button>
        <button type="submit" form="itinerary-form" disabled={isSubmitting} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : <Save size={18}/>} 
          Lưu lịch trình
        </button>
      </div>
    </div>
  );
};

export default TourItineraryForm;