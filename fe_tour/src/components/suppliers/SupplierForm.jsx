import React, { useState, useEffect } from 'react';
import { Save, X, Building2, MapPin, Wallet, User, AlertCircle, Phone, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supplierService from '../../services/api/supplierService';
import { validateSupplierField } from '../../utils/validators/supplierRules'; 

const SupplierForm = ({ supplierId, initialData }) => {
  const navigate = useNavigate();
  const isEdit = !!supplierId;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: '',
    company_name: '',
    type: 'hotel',
    tax_code: '',
    website: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Vietnam',
    payment_terms: '',
    credit_limit: 0,
    rating: 5.0,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tax_code: initialData.tax_code || '',
        website: initialData.website || '',
        contact_person: initialData.contact_person || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        payment_terms: initialData.payment_terms || '',
        notes: initialData.notes || '',
        credit_limit: initialData.credit_limit || 0,
        rating: initialData.rating || 5.0
      }));
    }
  }, [initialData]);
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'code') finalValue = value.toUpperCase(); // Auto uppercase mã

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Validate ngay khi gõ
    const error = validateSupplierField(name, finalValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Validate các trường quan trọng
    ['company_name', 'code', 'phone', 'email', 'rating'].forEach(key => {
        const error = validateSupplierField(key, formData[key]);
        if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        alert("Vui lòng kiểm tra lại các trường dữ liệu báo đỏ!");
        return;
    }

    setLoading(true);
    try {
      // Chuẩn hóa dữ liệu số trước khi gửi
      const payload = {
          ...formData,
          credit_limit: Number(formData.credit_limit) || 0,
          rating: Number(formData.rating) || 0
      };

      let res;
      if (isEdit) {
        res = await supplierService.update(supplierId, payload);
      } else {
        res = await supplierService.create(payload);
      }

      if (res.success || res.data?.success) {
        alert(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        navigate('/providers');
      } else {
        alert('Có lỗi xảy ra: ' + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.message || error.message;
      alert('Lỗi: ' + serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const ErrorText = ({ name }) => errors[name] && (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-pulse">
        <AlertCircle size={10} /> {errors[name]}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-slate-200 max-w-5xl mx-auto pb-20">
       {/* Header */}
       <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? `Cập nhật: ${formData.company_name}` : 'Thêm Nhà cung cấp Mới'}
          </h2>
          <button 
             type="button" 
             onClick={() => navigate('/providers')}
             className="text-slate-400 hover:text-slate-600 transition-colors"
           >
             <X size={24} />
           </button>
       </div>

      {/* === KHỐI 1: THÔNG TIN DOANH NGHIỆP === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-4">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-1">
                  <Building2 size={18} className="text-blue-600"/> Thông tin Doanh nghiệp
                </h3>
                <p className="text-xs text-slate-500">Thông tin định danh và pháp lý của đối tác.</p>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Công ty / Đối tác <span className="text-red-500">*</span></label>
                    <input 
                        name="company_name" 
                        value={formData.company_name} 
                        onChange={handleChange} 
                        className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.company_name ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                        placeholder="VD: Khách sạn Mường Thanh Luxury" 
                    />
                    <ErrorText name="company_name" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã NCC <span className="text-red-500">*</span></label>
                    <input 
                        name="code" 
                        value={formData.code} 
                        onChange={handleChange} 
                        // Nếu đang Edit thì disable mã để tránh sửa key
                        disabled={isEdit}
                        className={`w-full border rounded-lg px-4 py-2.5 font-mono uppercase ${errors.code ? 'border-red-500 bg-red-50' : 'border-slate-300'} ${isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        placeholder="SUP-001" 
                    />
                    <ErrorText name="code" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình <span className="text-red-500">*</span></label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white cursor-pointer">
                        <option value="hotel">🏨 Khách sạn (Hotel)</option>
                        <option value="restaurant">🍽️ Nhà hàng (Restaurant)</option>
                        <option value="transport">🚌 Vận chuyển (Transport)</option>
                        <option value="attraction">🎡 Điểm tham quan</option>
                        <option value="visa">🛂 Visa / Giấy tờ</option>
                        <option value="insurance">🛡️ Bảo hiểm</option>
                        <option value="other">📦 Khác</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế</label>
                    <input name="tax_code" value={formData.tax_code} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" placeholder="Nhập MST..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <div className="relative">
                        <Globe size={18} className="absolute left-3 top-3 text-slate-400"/>
                        <input name="website" value={formData.website} onChange={handleChange} className={`w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-blue-600 placeholder-slate-400 ${errors.website ? 'border-red-500' : ''}`} placeholder="https://example.com" />
                    </div>
                    <ErrorText name="website" />
                </div>
            </div>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* === KHỐI 2: LIÊN HỆ & ĐỊA CHỈ === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-1">
              <MapPin size={18} className="text-orange-600"/> Liên hệ & Địa chỉ
            </h3>
            <p className="text-xs text-slate-500">Thông tin để liên lạc đặt dịch vụ và xuất hóa đơn.</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ</label>
                <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="contact_person" value={formData.contact_person} onChange={handleChange} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5" placeholder="Tên Sale / Quản lý" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'}`} 
                        placeholder="090xxxxxxx"
                    />
                </div>
                <ErrorText name="phone" />
            </div>
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email liên hệ</label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${errors.email ? 'border-red-500' : 'border-slate-300'}`} placeholder="booking@domain.com" />
                </div>
                <ErrorText name="email" />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
                <input name="address" value={formData.address} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" placeholder="Số nhà, tên đường, phường/xã..." />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thành phố / Tỉnh</label>
                <input name="city" value={formData.city} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" placeholder="Hà Nội, TP.HCM..." />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quốc gia</label>
                <input name="country" value={formData.country} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" />
            </div>
          </div>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* === KHỐI 3: TÀI CHÍNH & QUẢN TRỊ === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-1">
               <Wallet size={18} className="text-green-600"/> Tài chính & Quản trị
            </h3>
            <p className="text-xs text-slate-500">Thiết lập công nợ, đánh giá và ghi chú nội bộ.</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Điều khoản thanh toán</label>
                <input name="payment_terms" value={formData.payment_terms} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" placeholder="VD: Thanh toán sau 30 ngày, Cọc 50% trước khi check-in..." />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn mức nợ (VND)</label>
                <input 
                    type="number" 
                    name="credit_limit" 
                    value={formData.credit_limit} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-right font-mono text-slate-800 focus:ring-2 focus:ring-green-500 outline-none" 
                    min="0"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái hợp tác</label>
                <select name="status" value={formData.status} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2.5 bg-white font-medium outline-none focus:ring-2 ${formData.status === 'active' ? 'text-green-600 border-green-200 bg-green-50 focus:ring-green-500' : formData.status === 'blacklist' ? 'text-red-600 border-red-200 bg-red-50 focus:ring-red-500' : 'text-slate-600 border-slate-200 focus:ring-slate-500'}`}>
                    <option value="active">✅ Đang hoạt động</option>
                    <option value="inactive">⏸️ Tạm ngưng</option>
                    <option value="blacklist">⛔ Blacklist (Chặn)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đánh giá chất lượng (Sao)</label>
                <input 
                    type="number" 
                    step="0.1" min="0" max="5" 
                    name="rating" 
                    value={formData.rating} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-4 py-2.5 ${errors.rating ? 'border-red-500' : 'border-slate-300'}`}
                />
                <ErrorText name="rating" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nội bộ</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-slate-400" placeholder="Ghi chú về chất lượng dịch vụ, lưu ý khi đặt..."></textarea>
            </div>
          </div>
      </div>

      {/* === FOOTER BUTTONS === */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-xl -mx-2 -mb-2">
         <button 
           type="button" 
           onClick={() => navigate('/providers')}
           className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors shadow-sm"
         >
           Hủy bỏ
         </button>
         <button 
           type="submit" 
           disabled={loading}
           className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
         >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 
                    Đang lưu...
                </span>
            ) : (
                <>
                    <Save size={18} /> {isEdit ? 'Lưu Thay Đổi' : 'Tạo Nhà Cung Cấp'}
                </>
            )}
         </button>
      </div>
    </form>
  );
};

export default SupplierForm;