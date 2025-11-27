import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import staffService from '../../services/api/staffService';
import { validateStaff } from '../../utils/validators/staffRules';
import toast from 'react-hot-toast';

const StaffForm = ({ staffId, initialData, onClose, onSuccess, isInModal = false }) => {
  const isEdit = !!staffId;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    staff_code: '', 
    staff_type: 'tour_guide',
    phone: '',
    email: '',
    gender: 'male',
    birthday: '',
    id_number: '',
    address: '',
    status: 'active',
    languages: '', 
    certifications: '',
    specializations: '',
    driver_license_number: '',
    driver_license_class: '',
    vehicle_types: ''
  });

  // --- FILL DỮ LIỆU KHI EDIT ---
  useEffect(() => {
    if (initialData) {
      const arrayToString = (arr) => {
        if (!arr) return '';
        if (Array.isArray(arr)) return arr.join(', ');
        try {
            const parsed = JSON.parse(arr);
            return Array.isArray(parsed) ? parsed.join(', ') : arr;
        } catch (e) {
            return arr || ''; 
        }
      };

      setFormData(prev => ({
        ...prev,
        ...initialData,
        birthday: initialData.birthday ? initialData.birthday.split('T')[0] : '',
        languages: arrayToString(initialData.languages),
        certifications: arrayToString(initialData.certifications),
        specializations: arrayToString(initialData.specializations),
        vehicle_types: arrayToString(initialData.vehicle_types),
        driver_license_number: initialData.driver_license_number || '',
        driver_license_class: initialData.driver_license_class || '',
        email: initialData.email || '',
        id_number: initialData.id_number || '',
        address: initialData.address || '',
        staff_code: initialData.staff_code || '',
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Xóa lỗi realtime khi người dùng nhập
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. LỌC DỮ LIỆU ĐỂ VALIDATE CHÍNH XÁC
    // Tạo bản sao để validate, loại bỏ các trường không cần thiết dựa trên loại nhân viên
    let dataToValidate = { ...formData };
    
    if (formData.staff_type !== 'driver') {
        delete dataToValidate.driver_license_number;
        delete dataToValidate.driver_license_class;
        delete dataToValidate.vehicle_types;
    } else {
        // Nếu là tài xế thì có thể không bắt buộc ngoại ngữ (tùy logic validator của bạn)
        // Nhưng nếu validator bắt buộc thì cứ để nguyên
    }

    // 2. GỌI HÀM VALIDATE
    const validationErrors = validateStaff(dataToValidate);
    
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Gom lỗi lại thành thông báo
        const errorMsg = Object.values(validationErrors).join('\n- ');
        toast.error(`Vui lòng kiểm tra lại thông tin:\n- ${errorMsg}`, { duration: 5000 });
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Đang xử lý...');
    
    // 3. CHUẨN HÓA PAYLOAD GỬI VỀ SERVER
    const payload = {
        ...formData,
        // Chuyển chuỗi thành mảng cho các trường tag
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
        specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
        vehicle_types: formData.vehicle_types ? formData.vehicle_types.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    // Xóa sạch dữ liệu rác nếu chuyển đổi loại nhân viên
    if (payload.staff_type !== 'driver') {
        payload.driver_license_number = null;
        payload.driver_license_class = null;
        payload.vehicle_types = [];
    }

    try {
      let result;
      if (isEdit) {
        result = await staffService.update(staffId, payload);
        toast.success("Cập nhật hồ sơ thành công!", { id: toastId });
      } else {
        result = await staffService.create(payload);
        toast.success("Thêm mới nhân viên thành công!", { id: toastId });
      }
      
      // Callback
      if (onSuccess) onSuccess(result.data || result);
      if (onClose) onClose();

    } catch (error) {
      console.error(error);
      // Tắt loading và hiện lỗi
      toast.dismiss(toastId);
      
      const resData = error.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
          const msg = resData.errors.map(e => e.msg || e.message).join('\n');
          toast.error(`Lỗi dữ liệu:\n${msg}`);
      } else {
          toast.error(resData?.message || error.message || "Có lỗi hệ thống xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER UI ---
  const ErrorText = ({ name }) => errors[name] && (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium animate-pulse">
        <AlertCircle size={12} /> {errors[name]}
    </p>
  );

  const getInputClass = (fieldName) => {
    const base = "w-full border rounded-lg px-3 py-2.5 outline-none transition-all text-sm";
    if (errors[fieldName]) {
        return `${base} border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-200`;
    }
    return `${base} border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;
  };

  return (
    <div className={`bg-white ${isInModal ? '' : 'p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto'}`}>
       {!isInModal && <h2 className="text-xl font-bold mb-6 text-slate-800">{isEdit ? 'Cập nhật Hồ sơ' : 'Thêm Nhân sự Mới'}</h2>}
       
       <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- NHÓM 1: ĐỊNH DANH & VAI TRÒ --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mã nhân viên <span className="text-red-500">*</span></label>
                <input 
                    name="staff_code" 
                    value={formData.staff_code} 
                    onChange={handleChange} 
                    placeholder="VD: NV001"
                    className={getInputClass('staff_code')} 
                />
                <ErrorText name="staff_code" />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Vai trò <span className="text-red-500">*</span></label>
                <select name="staff_type" value={formData.staff_type} onChange={handleChange} className="w-full border rounded-lg px-3 py-2.5 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm">
                    <option value="tour_guide">Hướng dẫn viên (Guide)</option>
                    <option value="tour_leader">Trưởng đoàn (Leader)</option>
                    <option value="driver">Tài xế (Driver)</option>
                    <option value="coordinator">Điều hành</option>
                </select>
             </div>

             <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    className={getInputClass('full_name')} 
                    placeholder="Nguyễn Văn A"
                />
                <ErrorText name="full_name" />
             </div>
          </div>

          {/* --- NHÓM 2: LIÊN HỆ & CÁ NHÂN --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Điện thoại <span className="text-red-500">*</span></label>
                <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={getInputClass('phone')} 
                />
                <ErrorText name="phone" />
             </div>

             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email <span className="text-red-500">*</span></label>
                <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={getInputClass('email')} 
                />
                <ErrorText name="email" />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ngày sinh <span className="text-red-500">*</span></label>
                <input 
                    type="date" 
                    name="birthday" 
                    value={formData.birthday} 
                    onChange={handleChange} 
                    className={getInputClass('birthday')} 
                />
                <ErrorText name="birthday" />
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg px-3 py-2.5 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">CCCD / CMND <span className="text-red-500">*</span></label>
                <input 
                    name="id_number" 
                    value={formData.id_number} 
                    onChange={handleChange} 
                    className={getInputClass('id_number')} 
                />
                <ErrorText name="id_number" />
             </div>
          </div>

          <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Địa chỉ <span className="text-red-500">*</span></label>
                <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className={getInputClass('address')} 
                />
                <ErrorText name="address" />
          </div>

          {/* --- NHÓM 3: THÔNG TIN CHUYÊN MÔN (Điều kiện hiển thị) --- */}
          <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 text-sm uppercase">Thông tin chuyên môn</h3>
             
             {formData.staff_type === 'driver' ? (
                // Form cho Tài xế
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Hạng bằng lái <span className="text-red-500">*</span></label>
                        <input 
                            name="driver_license_class" 
                            value={formData.driver_license_class} 
                            onChange={handleChange} 
                            placeholder="B2, C, D..." 
                            className={getInputClass('driver_license_class')} 
                        />
                        <ErrorText name="driver_license_class" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Số GPLX <span className="text-red-500">*</span></label>
                        <input 
                            name="driver_license_number" 
                            value={formData.driver_license_number} 
                            onChange={handleChange} 
                            className={getInputClass('driver_license_number')} 
                        />
                        <ErrorText name="driver_license_number" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Loại xe chạy được</label>
                        <input 
                            name="vehicle_types" 
                            value={formData.vehicle_types} 
                            onChange={handleChange} 
                            placeholder="16 chỗ, 29 chỗ..." 
                            className={getInputClass('vehicle_types')} 
                        />
                        <ErrorText name="vehicle_types" />
                    </div>
                </div>
             ) : (
                // Form cho HDV / Khác
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                            Ngoại ngữ (cách nhau dấu phẩy) 
                            {['tour_guide', 'tour_leader'].includes(formData.staff_type) && <span className="text-red-500">*</span>}
                        </label>
                        <input 
                            name="languages" 
                            value={formData.languages} 
                            onChange={handleChange} 
                            placeholder="Anh, Trung, Nhật..." 
                            className={getInputClass('languages')} 
                        />
                        <ErrorText name="languages" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Chứng chỉ / Thẻ hành nghề</label>
                        <input 
                            name="certifications" 
                            value={formData.certifications} 
                            onChange={handleChange} 
                            placeholder="Thẻ HDV Quốc tế..." 
                            className={getInputClass('certifications')} 
                        />
                        <ErrorText name="certifications" />
                    </div>
                </div>
             )}
             
             <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Chuyên môn / Thế mạnh</label>
                <input 
                    name="specializations" 
                    value={formData.specializations} 
                    onChange={handleChange} 
                    placeholder="Tour biển đảo, Tour mạo hiểm..." 
                    className={getInputClass('specializations')} 
                />
                <ErrorText name="specializations" />
             </div>
          </div>

          {/* --- TRẠNG THÁI --- */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Trạng thái làm việc</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-lg px-3 py-2.5 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm">
                <option value="active">🟢 Đang làm việc</option>
                <option value="on_leave">🟡 Nghỉ phép</option>
                <option value="inactive">🔴 Đã nghỉ việc</option>
            </select>
          </div>

          <div className="flex justify-end pt-6 gap-3 border-t border-slate-100">
             {onClose && (
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm">Hủy bỏ</button>
             )}
             <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 font-bold"
             >
                {loading ? 'Đang xử lý...' : <><Save size={18} /> Lưu Nhân Viên</>}
             </button>
          </div>
       </form>
    </div>
  );
};

export default StaffForm;