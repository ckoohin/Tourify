import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Users, Calendar, Tag } from 'lucide-react';
import { validateTourPrice } from '../../../utils/validators/tourPriceRules';
import toast from 'react-hot-toast';

const TourPriceForm = ({ isOpen, onClose, onSubmit, initialData, tourVersionId }) => {
  const [formData, setFormData] = useState({
    tour_version_id: tourVersionId || '',
    price_type: 'adult',
    price: '',
    currency: 'VND',
    min_pax: '',
    max_pax: '',
    valid_from: '',
    valid_to: '',
    description: '',
    is_active: '1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setFormData({
            ...initialData,
            tour_version_id: tourVersionId || initialData.tour_version_id, // Ưu tiên props
            is_active: String(initialData.is_active),
            valid_from: initialData.valid_from ? initialData.valid_from.split('T')[0] : '',
            valid_to: initialData.valid_to ? initialData.valid_to.split('T')[0] : '',
        });
      } else {
        // Reset form
        setFormData({
            tour_version_id: tourVersionId || '',
            price_type: 'adult',
            price: '',
            currency: 'VND',
            min_pax: '',
            max_pax: '',
            valid_from: '',
            valid_to: '',
            description: '',
            is_active: '1'
        });
      }
    }
  }, [isOpen, initialData, tourVersionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateTourPrice(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Chuẩn hóa dữ liệu
    const payload = {
        ...formData,
        price: Number(formData.price),
        min_pax: formData.min_pax ? Number(formData.min_pax) : null,
        max_pax: formData.max_pax ? Number(formData.max_pax) : null,
        is_active: Number(formData.is_active)
    };
    
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">
                {initialData ? 'Cập nhật Giá' : 'Thiết lập Giá Mới'}
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Loại giá & Số tiền */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đối tượng <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <select name="price_type" value={formData.price_type} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white">
                            <option value="adult">Người lớn (Adult)</option>
                            <option value="child">Trẻ em (Child)</option>
                            <option value="infant">Em bé (Infant)</option>
                            <option value="senior">Người cao tuổi (Senior)</option>
                            <option value="group">Nhóm (Group)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giá tiền ({formData.currency}) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input 
                            type="number" name="price" value={formData.price} onChange={handleChange} 
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-slate-300'}`}
                            placeholder="0"
                        />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
            </div>

            {/* Số lượng khách áp dụng */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Pax</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input type="number" name="min_pax" value={formData.min_pax} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg" placeholder="VD: 1"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Pax</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input type="number" name="max_pax" value={formData.max_pax} onChange={handleChange} className={`w-full pl-9 pr-3 py-2 border rounded-lg ${errors.max_pax ? 'border-red-500' : ''}`} placeholder="VD: 10"/>
                    </div>
                    {errors.max_pax && <p className="text-red-500 text-xs mt-1">{errors.max_pax}</p>}
                </div>
            </div>

            {/* Thời gian hiệu lực */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
                    <input type="date" name="valid_from" value={formData.valid_from} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                    <input type="date" name="valid_to" value={formData.valid_to} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.valid_to ? 'border-red-500' : ''}`}/>
                    {errors.valid_to && <p className="text-red-500 text-xs mt-1">{errors.valid_to}</p>}
                </div>
            </div>

            {/* Mô tả */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả thêm</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="VD: Áp dụng cho đoàn > 10 khách"></textarea>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActivePrice" checked={formData.is_active === '1'} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked ? '1' : '0'}))} className="w-4 h-4 text-blue-600 rounded"/>
                <label htmlFor="isActivePrice" className="text-sm text-slate-700 cursor-pointer">Đang áp dụng</label>
            </div>

        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 text-slate-700">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Save size={18}/> Lưu Giá
            </button>
        </div>

      </div>
    </div>
  );
};

export default TourPriceForm;