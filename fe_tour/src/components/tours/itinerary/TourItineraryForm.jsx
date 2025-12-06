import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, X, Edit2, // [FIX] Đã thêm Edit2
  Utensils, BedDouble, StickyNote, MapPin, List 
} from 'lucide-react';

const TourItineraryForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  title 
}) => {
  const defaultFormState = {
    day_number: '',
    title: '',
    description: '',
    accommodation: '',
    notes: '',
    meals: { breakfast: false, lunch: false, dinner: false },
    activities: ['']
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Khởi tạo dữ liệu khi mở form
  useEffect(() => {
    if (initialData) {
      const defaultMeals = { breakfast: false, lunch: false, dinner: false };
      const mergedMeals = { ...defaultMeals, ...(initialData.meals || {}) };
      
      const activities = (initialData.activities && initialData.activities.length > 0) 
        ? initialData.activities 
        : [''];

      setFormData({
        ...defaultFormState,
        ...initialData,
        meals: mergedMeals,
        activities: activities
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealChange = (mealType) => {
    setFormData(prev => ({
      ...prev,
      meals: { ...prev.meals, [mealType]: !prev.meals[mealType] }
    }));
  };

  const handleActivityChange = (index, value) => {
    const newActivities = [...formData.activities];
    newActivities[index] = value;
    setFormData(prev => ({ ...prev, activities: newActivities }));
  };

  const addActivityLine = () => {
    setFormData(prev => ({ ...prev, activities: [...prev.activities, ''] }));
  };

  const removeActivityLine = (index) => {
    const newActivities = formData.activities.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, activities: newActivities }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        activities: formData.activities.filter(a => a.trim() !== '')
    });
  };

  return (
    <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Form Header - Sticky */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${initialData?.id ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {initialData?.id ? <Edit2 size={18} /> : <Plus size={18} />}
          </div>
          {title}
        </h4>
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
          type="button"
        >
          <X size={24}/>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <form id="itinerary-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Day & Title */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-3 lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Ngày số <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="number" 
                  name="day_number" 
                  min="1" 
                  required 
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-center font-bold text-lg text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  value={formData.day_number} 
                  onChange={handleInputChange} 
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">#</span>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-9 lg:col-span-10">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Tiêu đề hành trình <span className="text-red-500">*</span></label>
              <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                  type="text" 
                  name="title" 
                  required 
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Ví dụ: Hà Nội - Đón sân bay - City Tour" 
                  />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mô tả chi tiết</label>
            <textarea 
              name="description" 
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 h-32 text-slate-700 leading-relaxed resize-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Mô tả chi tiết lịch trình tham quan, thời gian di chuyển, các điểm dừng chân..." 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Activities */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-full">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <List size={16} className="text-blue-500"/> 
                Các hoạt động chính
              </label>
              <div className="space-y-2.5">
                {formData.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-2.5 text-blue-300 text-xs font-bold font-mono">{idx + 1}.</span>
                      <input 
                        type="text" 
                        className="w-full border border-slate-200 bg-white rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300" 
                        value={act} 
                        onChange={(e) => handleActivityChange(idx, e.target.value)} 
                        placeholder="Nhập hoạt động..." 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeActivityLine(idx)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 hover:shadow-sm"
                      title="Xóa dòng"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addActivityLine} 
                  className="w-full py-2.5 border-2 border-dashed border-blue-200 rounded-lg text-blue-500 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={16}/> Thêm hoạt động
                </button>
              </div>
            </div>

            {/* Right Column: Meals & Hotel & Notes */}
            <div className="space-y-4">
              {/* Meals */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <Utensils size={16} className="text-orange-500"/> Các bữa ăn bao gồm
                </label>
                <div className="flex gap-3">
                  {['breakfast', 'lunch', 'dinner'].map(meal => (
                    <label 
                      key={meal} 
                      className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer select-none py-3 rounded-xl border-2 transition-all ${
                        formData.meals[meal] 
                        ? 'bg-orange-50 border-orange-200 text-orange-700' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input type="checkbox" checked={formData.meals[meal]} onChange={() => handleMealChange(meal)} className="hidden" />
                      <span className="font-bold text-xs uppercase">{meal === 'breakfast' ? 'Sáng' : meal === 'lunch' ? 'Trưa' : 'Tối'}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${formData.meals[meal] ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                          {formData.meals[meal] && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Accommodation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <BedDouble size={16} className="text-purple-500"/> Khách sạn / Lưu trú
                </label>
                <input 
                  type="text" 
                  name="accommodation" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" 
                  value={formData.accommodation} 
                  onChange={handleInputChange} 
                  placeholder="VD: Khách sạn Mường Thanh 4*" 
                />
              </div>

              {/* Notes */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <StickyNote size={16} className="text-yellow-500"/> Ghi chú (Notes)
                </label>
                <textarea 
                  name="notes" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none h-20 transition-all" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Ghi chú thêm cho ngày này..." 
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions - Sticky */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 z-10">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          Hủy bỏ
        </button>
        <button 
          type="submit" 
          form="itinerary-form"
          disabled={isSubmitting} 
          className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : <Save size={18}/>} 
          Lưu lịch trình
        </button>
      </div>
    </div>
  );
};

export default TourItineraryForm;