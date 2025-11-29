import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Briefcase, FileText, CreditCard, Calendar } from 'lucide-react';
import { customerRules } from '../../utils/validators/customerRules';

const CustomerForm = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState({
    customer_code: '',
    customer_type: 'individual',
    full_name: '',
    email: '',
    phone: '',
    id_number: '',
    birthday: '',
    gender: 'male',
    nationality: 'Vietnam',
    address: '',
    city: '',
    country: 'Vietnam',
    company_name: '',
    tax_code: '',
    customer_source: '',
    is_vip: '0',
    is_blacklist: '0',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const formattedData = { ...initialData };
        if (formattedData.birthday) {
            formattedData.birthday = new Date(formattedData.birthday).toISOString().split('T')[0];
        }
        formattedData.is_vip = String(formattedData.is_vip);
        formattedData.is_blacklist = String(formattedData.is_blacklist);
        
        setFormData(formattedData);
      } else {
        setFormData({
            customer_code: '',
            customer_type: 'individual',
            full_name: '',
            email: '',
            phone: '',
            id_number: '',
            birthday: '',
            gender: 'male',
            nationality: 'Vietnam',
            address: '',
            city: '',
            country: 'Vietnam',
            company_name: '',
            tax_code: '',
            customer_source: '',
            is_vip: '0',
            is_blacklist: '0',
            notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = customerRules(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
          <h3 className="font-bold text-xl text-slate-800">{title || 'Thông tin khách hàng'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <form id="customer-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b pb-2">
                <User size={18} /> Thông tin chung
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại khách hàng <span className="text-red-500">*</span></label>
                    <select name="customer_type" value={formData.customer_type} onChange={handleChange} className="input-field w-full p-2 border rounded">
                        <option value="individual">Cá nhân</option>
                        <option value="company">Doanh nghiệp</option>
                        <option value="agent">Đại lý</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className={`input-field w-full p-2 border rounded ${errors.full_name ? 'border-red-500' : ''}`} />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã khách hàng</label>
                    <input type="text" name="customer_code" value={formData.customer_code} onChange={handleChange} placeholder="(Tự động nếu để trống)" className="input-field w-full p-2 border rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="input-field w-full p-2 border rounded">
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b pb-2">
                <Phone size={18} /> Liên hệ
              </div>
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Điện thoại <span className="text-red-500">*</span></label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={`input-field w-full p-2 border rounded ${errors.phone ? 'border-red-500' : ''}`} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Thành phố</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quốc gia</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b pb-2">
                <Briefcase size={18} /> Thông tin doanh nghiệp
              </div>
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên công ty/đại lý</label>
                    <input 
                        type="text" name="company_name" value={formData.company_name} onChange={handleChange} 
                        disabled={formData.customer_type === 'individual'}
                        className="input-field w-full p-2 border rounded disabled:bg-slate-100 disabled:text-slate-400" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế</label>
                    <input 
                        type="text" name="tax_code" value={formData.tax_code} onChange={handleChange} 
                        disabled={formData.customer_type === 'individual'}
                        className="input-field w-full p-2 border rounded disabled:bg-slate-100 disabled:text-slate-400" 
                    />
                    {errors.tax_code && <p className="text-red-500 text-xs mt-1">{errors.tax_code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CMND/CCCD</label>
                    <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} className="input-field w-full p-2 border rounded" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b pb-2">
                <FileText size={18} /> Phân loại & Ghi chú
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nguồn khách</label>
                        <input type="text" name="customer_source" value={formData.customer_source} onChange={handleChange} placeholder="VD: Facebook, Website..." className="input-field w-full p-2 border rounded" />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="is_vip" checked={formData.is_vip === '1'} onChange={(e) => handleChange({ target: { name: 'is_vip', value: e.target.checked ? '1' : '0' } })} className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-700">Khách VIP</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="is_blacklist" checked={formData.is_blacklist === '1'} onChange={(e) => handleChange({ target: { name: 'is_blacklist', value: e.target.checked ? '1' : '0' } })} className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Blacklist</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú đặc biệt</label>
                    <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                        rows={4}
                        placeholder="VD: Ăn chay, dị ứng, yêu cầu xe riêng..."
                        className="input-field w-full p-2 border rounded"
                    />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Hủy bỏ</button>
          <button type="submit" form="customer-form" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            <Save size={18} /> Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;