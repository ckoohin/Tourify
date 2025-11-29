import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Wallet, User, AlertCircle, Phone, Mail, Globe, Map } from 'lucide-react';
import supplierService from '../../services/api/supplierService';
import { validateSupplier, validateSupplierField } from '../../utils/validators/supplierRules'; 
import toast from 'react-hot-toast';

const SupplierForm = ({ supplierId, initialData, onClose, onSuccess, isInModal = false }) => {
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
    notes: '',
    total_bookings: 0 // Thêm trường này để giữ giá trị khi update
  });

  // Reset form khi có dữ liệu ban đầu
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Đảm bảo các trường không bị null/undefined
        tax_code: initialData.tax_code || '',
        website: initialData.website || '',
        contact_person: initialData.contact_person || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        country: initialData.country || 'Vietnam',
        payment_terms: initialData.payment_terms || '',
        notes: initialData.notes || '',
        credit_limit: Number(initialData.credit_limit) || 0,
        rating: Number(initialData.rating) || 5.0,
        total_bookings: Number(initialData.total_bookings) || 0 // Giữ lại số lượng booking
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'code') finalValue = value.toUpperCase();

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Validate realtime
    const error = validateSupplierField(name, finalValue);
    setErrors(prev => {
        const newErrors = { ...prev };
        if (error) newErrors[name] = error;
        else delete newErrors[name];
        return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. VALIDATE DỮ LIỆU
    const validationErrors = validateSupplier(formData);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Vui lòng kiểm tra lại các trường dữ liệu báo đỏ!");
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Đang lưu dữ liệu...');

    try {
      // 2. CHUẨN HÓA PAYLOAD (QUAN TRỌNG)
      const payload = { ...formData };

      // --- XỬ LÝ DỮ LIỆU THỪA ---
      // Xóa các trường hệ thống không được phép gửi trong body (ID đã có trên URL)
      delete payload.id;              
      delete payload.created_at;      
      delete payload.updated_at;
      
      // --- XỬ LÝ KIỂU DỮ LIỆU ---
      // Backend yêu cầu số, nếu gửi chuỗi rỗng hoặc string số sẽ gây lỗi
      payload.credit_limit = Number(payload.credit_limit) || 0;
      payload.rating = Number(payload.rating) || 0;
      payload.total_bookings = Number(payload.total_bookings) || 0; // Quan trọng: Giữ nguyên số đơn hàng

      let res;
      if (isEdit) {
        // Update: Backend của bạn dùng: UPDATE suppliers SET ... total_bookings=? ...
        // Nên bắt buộc phải gửi total_bookings lên, nếu không nó sẽ về null
        res = await supplierService.update(supplierId, payload);
        toast.success("Cập nhật thành công!", { id: toastId });
      } else {
        // Create
        res = await supplierService.create(payload);
        toast.success("Thêm mới thành công!", { id: toastId });
      }

      if (onSuccess) onSuccess(res.data || res);
      if (onClose) onClose();

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      
      const resData = error.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
          const details = resData.errors.map(e => e.msg || e.message).join('\n');
          toast.error(`Lỗi dữ liệu:\n${details}`);
      } else {
          toast.error('Lỗi: ' + (resData?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorText = ({ name }) => errors[name] && (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-pulse font-medium">
        <AlertCircle size={10} /> {errors[name]}
    </p>
  );

  const getInputClass = (fieldName) => `
    w-full border rounded-lg px-4 py-2.5 outline-none transition-all 
    ${errors[fieldName] 
        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
  `;

  return (
    <form onSubmit={handleSubmit} className={`${isInModal ? '' : 'bg-white p-6 rounded-lg shadow border border-slate-200 max-w-5xl mx-auto pb-20'}`}>
       
       {!isInModal && (
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? `Cập nhật: ${formData.company_name}` : 'Thêm Nhà cung cấp Mới'}
              </h2>
           </div>
       )}

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
                        className={getInputClass('company_name')}
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
                        disabled={isEdit}
                        className={`${getInputClass('code')} font-mono uppercase ${isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        placeholder="SUP-001" 
                    />
                    <ErrorText name="code" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình <span className="text-red-500">*</span></label>
                    <select name="type" value={formData.type} onChange={handleChange} className={getInputClass('type')}>
                        <option value="hotel">🏨 Khách sạn (Hotel)</option>
                        <option value="restaurant">🍽️ Nhà hàng (Restaurant)</option>
                        <option value="transport">🚌 Vận chuyển (Transport)</option>
                        <option value="attraction">🎡 Điểm tham quan</option>
                        <option value="visa">🛂 Visa / Giấy tờ</option>
                        <option value="insurance">🛡️ Bảo hiểm</option>
                        <option value="other">📦 Khác</option>
                    </select>
                    <ErrorText name="type" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế <span className="text-red-500">*</span></label>
                    <input name="tax_code" value={formData.tax_code} onChange={handleChange} className={getInputClass('tax_code')} placeholder="Nhập MST..." />
                    <ErrorText name="tax_code" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Globe size={18} className="absolute left-3 top-3 text-slate-400"/>
                        <input name="website" value={formData.website} onChange={handleChange} className={`${getInputClass('website')} pl-10 text-blue-600`} placeholder="https://example.com" />
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ <span className="text-red-500">*</span></label>
                <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="contact_person" value={formData.contact_person} onChange={handleChange} className={`${getInputClass('contact_person')} pl-10`} placeholder="Tên Sale / Quản lý" />
                </div>
                <ErrorText name="contact_person" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="phone" value={formData.phone} onChange={handleChange} className={`${getInputClass('phone')} pl-10`} placeholder="090xxxxxxx" />
                </div>
                <ErrorText name="phone" />
            </div>
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email liên hệ <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={`${getInputClass('email')} pl-10`} placeholder="booking@domain.com" />
                </div>
                <ErrorText name="email" />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                <input name="address" value={formData.address} onChange={handleChange} className={getInputClass('address')} placeholder="Số nhà, tên đường, phường/xã..." />
                <ErrorText name="address" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thành phố / Tỉnh <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Map size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input name="city" value={formData.city} onChange={handleChange} className={`${getInputClass('city')} pl-10`} placeholder="Hà Nội..." />
                </div>
                <ErrorText name="city" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quốc gia <span className="text-red-500">*</span></label>
                <input name="country" value={formData.country} onChange={handleChange} className={getInputClass('country')} />
                <ErrorText name="country" />
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Điều khoản thanh toán <span className="text-red-500">*</span></label>
                <input name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={getInputClass('payment_terms')} placeholder="VD: Thanh toán sau 30 ngày..." />
                <ErrorText name="payment_terms" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn mức nợ (VND) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="credit_limit" 
                    value={formData.credit_limit} 
                    onChange={handleChange} 
                    className={`${getInputClass('credit_limit')} text-right font-mono`} 
                    min="0"
                />
                <ErrorText name="credit_limit" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái hợp tác <span className="text-red-500">*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} className={getInputClass('status')}>
                    <option value="active">✅ Đang hoạt động</option>
                    <option value="inactive">⏸️ Tạm ngưng</option>
                    <option value="blacklist">⛔ Blacklist (Chặn)</option>
                </select>
                <ErrorText name="status" />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đánh giá (Sao) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    step="0.1" min="0" max="5" 
                    name="rating" 
                    value={formData.rating} 
                    onChange={handleChange} 
                    className={getInputClass('rating')}
                />
                <ErrorText name="rating" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nội bộ</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-slate-400" placeholder="Ghi chú về chất lượng dịch vụ..."></textarea>
            </div>
          </div>
      </div>

      {/* === FOOTER === */}
      {isInModal && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-8 bg-slate-50 p-4 -mx-6 -mb-6 rounded-b-xl">
             <button 
               type="button" 
               onClick={onClose}
               className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors shadow-sm"
             >
               Hủy bỏ
             </button>
             <button 
               type="submit" 
               disabled={loading}
               className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-70"
             >
                {loading ? 'Đang lưu...' : <><Save size={18} /> Lưu NCC</>}
             </button>
          </div>
      )}
    </form>
  );
};

export default SupplierForm;