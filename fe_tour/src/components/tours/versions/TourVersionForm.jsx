import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, Map } from 'lucide-react';
import { validateTourVersion } from '../../../utils/validators/tourVersionRules';
import toast from 'react-hot-toast';

const TourVersionForm = ({ isOpen, onClose, onSubmit, initialData, tours = [], fixedTourId = null }) => {
  const [formData, setFormData] = useState({
    tour_id: '',
    name: '',
    type: 'standard',
    valid_from: '',
    valid_to: '',
    description: '',
    is_default: '0',
    is_active: '1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setFormData({
            ...initialData,
            tour_id: initialData.tour_id,
            is_default: String(initialData.is_default),
            is_active: String(initialData.is_active),
            valid_from: initialData.valid_from ? initialData.valid_from.split('T')[0] : '',
            valid_to: initialData.valid_to ? initialData.valid_to.split('T')[0] : '',
        });
      } else {
        setFormData({
            tour_id: fixedTourId || '', 
            name: '',
            type: 'standard',
            valid_from: '',
            valid_to: '',
            description: '',
            is_default: '0',
            is_active: '1'
        });
      }
    }
  }, [isOpen, initialData, fixedTourId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateTourVersion(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
        ...formData,
        is_default: Number(formData.is_default),
        is_active: Number(formData.is_active)
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">
                {initialData ? 'Cập nhật Phiên bản' : 'Thêm Phiên bản Mới'}
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {!fixedTourId && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thuộc Tour <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Map className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <select 
                            name="tour_id" 
                            value={formData.tour_id} 
                            onChange={handleChange} 
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white ${errors.tour_id ? 'border-red-500' : 'border-slate-300'}`}
                        >
                            <option value="">-- Chọn Tour --</option>
                            {tours.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                            ))}
                        </select>
                    </div>
                    {errors.tour_id && <p className="text-red-500 text-xs mt-1">{errors.tour_id}</p>}
                </div>
            )}

            {/* Tên & Loại */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên phiên bản <span className="text-red-500">*</span></label>
                    <input 
                        type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Mùa Hè 2025"
                        className={`w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại phiên bản</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white">
                            <option value="standard">Tiêu chuẩn (Standard)</option>
                            <option value="seasonal">Theo mùa (Seasonal)</option>
                            <option value="promotion">Khuyến mãi (Promotion)</option>
                            <option value="special">Đặc biệt (Special)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Thời gian hiệu lực */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hiệu lực từ</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input type="date" name="valid_from" value={formData.valid_from} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input type="date" name="valid_to" value={formData.valid_to} onChange={handleChange} className={`w-full pl-9 pr-3 py-2 border rounded-lg ${errors.valid_to ? 'border-red-500' : ''}`}/>
                    </div>
                    {errors.valid_to && <p className="text-red-500 text-xs mt-1">{errors.valid_to}</p>}
                </div>
            </div>

            {/* Mô tả */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả thêm</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>

            {/* Cấu hình */}
            <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active === '1'} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked ? '1' : '0'}))} className="w-4 h-4 text-blue-600 rounded"/>
                    <span className="text-sm text-slate-700">Đang hoạt động</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_default === '1'} onChange={(e) => setFormData(prev => ({...prev, is_default: e.target.checked ? '1' : '0'}))} className="w-4 h-4 text-blue-600 rounded"/>
                    <span className="text-sm text-slate-700">Đặt làm mặc định</span>
                </label>
            </div>

        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 text-slate-700">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Save size={18}/> Lưu lại
            </button>
        </div>

      </div>
    </div>
  );
};

export default TourVersionForm;