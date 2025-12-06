import React, { useState, useEffect } from 'react';
import { Save, X, Edit2, Plus, GripVertical } from 'lucide-react';

const TourPolicyForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  title 
}) => {
  const defaultFormData = {
    tour_id: initialData?.tour_id || '',
    policy_type: 'cancellation',
    title: '',
    content: '',
    display_order: 0,
    is_active: true
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tour_id: initialData.tour_id,
        policy_type: initialData.policy_type || 'cancellation',
        title: initialData.title || '',
        content: initialData.content || '',
        display_order: initialData.display_order || 0,
        is_active: initialData.is_active !== undefined ? Boolean(initialData.is_active) : true
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // BACKDROP: Phủ toàn màn hình, màu tối mờ, blur nhẹ
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${initialData?.id ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                {initialData?.id ? <Edit2 size={18}/> : <Plus size={18}/>}
            </div>
            {title}
          </h4>
          <button 
            onClick={onCancel}
            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"
            title="Đóng"
          >
            <X size={20}/>
          </button>
        </div>
        
        {/* Body (Scrollable) */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="policy-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Loại chính sách <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    name="policy_type" 
                    value={formData.policy_type} 
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="cancellation">⛔ Hủy tour (Cancellation)</option>
                    <option value="refund">💸 Hoàn tiền (Refund)</option>
                    <option value="deposit">💰 Đặt cọc (Deposit)</option>
                    <option value="change">📝 Thay đổi (Change)</option>
                    <option value="other">ℹ️ Khác (Other)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-7">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  placeholder="VD: Quy định hủy vé ngày lễ"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleInputChange}
                rows={6}
                placeholder="- Hủy trước 15 ngày: hoàn 100%..."
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400 leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 cursor-move">
                  <GripVertical size={16} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-0.5">Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    name="display_order" 
                    value={formData.display_order} 
                    onChange={handleInputChange}
                    min="0"
                    className="w-20 bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none group bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-sm">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    checked={formData.is_active} 
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Hiển thị công khai</span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            form="policy-form"
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Save size={18}/>
            Lưu lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourPolicyForm;