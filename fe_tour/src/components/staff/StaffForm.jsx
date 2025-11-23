import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import staffService from '../../services/api/staffService';
// Import hàm validate vừa tạo
import { validateStaff } from '../../utils/validators/staffRules';

const StaffForm = ({ staffId, initialData, onClose, onSuccess }) => {
  const isEdit = !!staffId;
  const [loading, setLoading] = useState(false);
  // State lưu lỗi
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        languages: Array.isArray(initialData.languages) ? initialData.languages.join(', ') : '',
        certifications: Array.isArray(initialData.certifications) ? initialData.certifications.join(', ') : '',
        specializations: Array.isArray(initialData.specializations) ? initialData.specializations.join(', ') : '',
        vehicle_types: Array.isArray(initialData.vehicle_types) ? initialData.vehicle_types.join(', ') : '',
        birthday: initialData.birthday ? initialData.birthday.split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Cập nhật data mới
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    const allErrors = validateStaff(newData);
    setErrors(prev => ({
        ...prev,
        [name]: allErrors[name] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateStaff(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Vui lòng kiểm tra lại thông tin nhập liệu!");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
      specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
      vehicle_types: formData.vehicle_types.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      let result;
      if (isEdit) {
        result = await staffService.update(staffId, payload);
        alert("Cập nhật thành công!");
      } else {
        result = await staffService.create(payload);
        alert("Tạo nhân viên thành công!");
      }

      if (onSuccess) onSuccess(result);

      if (onClose) onClose();

    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        const { message, data } = error.response.data;

        if (data?.errors) {
          const fieldErrors = {};
          data.errors.forEach(e => {
            fieldErrors[e.path] = e.msg;
          });
          setErrors(fieldErrors);
          alert(message || "Dữ liệu không hợp lệ!");
        } else {
          alert(message || "Đã xảy ra lỗi!");
        }
      } else {
        alert("Lỗi: " + error.message);
      }

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
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200 max-w-4xl mx-auto">
       <h2 className="text-xl font-bold mb-6 text-slate-800">{isEdit ? 'Cập nhật Hồ sơ' : 'Thêm Nhân sự Mới'}</h2>
       
       <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nhóm thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    className={`w-full border rounded px-3 py-2 ${errors.full_name ? 'border-red-500 bg-red-50' : ''}`} 
                />
                <ErrorText name="full_name" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại nhân viên <span className="text-red-500">*</span></label>
                <select name="staff_type" value={formData.staff_type} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white">
                    <option value="tour_guide">Hướng dẫn viên (Guide)</option>
                    <option value="tour_leader">Trưởng đoàn (Leader)</option>
                    <option value="driver">Tài xế (Driver)</option>
                    <option value="coordinator">Điều hành</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={`w-full border rounded px-3 py-2 ${errors.phone ? 'border-red-500 bg-red-50' : ''}`} 
                />
                <ErrorText name="phone" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500 bg-red-50' : ''}`} 
                />
                <ErrorText name="email" />
             </div>
          </div>

          {/* Nhóm thông tin chuyên môn (Thay đổi theo loại nhân viên) */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300">
             <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Thông tin chuyên môn</h3>
             
             {formData.staff_type === 'driver' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Hạng bằng lái <span className="text-red-500">*</span></label>
                        <input 
                            name="driver_license_class" 
                            value={formData.driver_license_class} 
                            onChange={handleChange} 
                            placeholder="B2, C, D..." 
                            className={`w-full border rounded px-3 py-2 ${errors.driver_license_class ? 'border-red-500' : ''}`} 
                        />
                        <ErrorText name="driver_license_class" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Số GPLX <span className="text-red-500">*</span></label>
                        <input 
                            name="driver_license_number" 
                            value={formData.driver_license_number} 
                            onChange={handleChange} 
                            className={`w-full border rounded px-3 py-2 ${errors.driver_license_number ? 'border-red-500' : ''}`} 
                        />
                        <ErrorText name="driver_license_number" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Loại xe chạy được</label>
                        <input name="vehicle_types" value={formData.vehicle_types} onChange={handleChange} placeholder="16 chỗ, 29 chỗ..." className="w-full border rounded px-3 py-2" />
                    </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Ngoại ngữ (cách nhau dấu phẩy)</label>
                        <input 
                            name="languages" 
                            value={formData.languages} 
                            onChange={handleChange} 
                            placeholder="Anh, Trung, Nhật..." 
                            className={`w-full border rounded px-3 py-2 ${errors.languages ? 'border-orange-300 bg-orange-50' : ''}`} 
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
                            className={`w-full border rounded px-3 py-2 ${errors.certifications ? 'border-orange-300 bg-orange-50' : ''}`} 
                        />
                        <ErrorText name="certifications" />
                    </div>
                </div>
             )}
             
             <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Chuyên môn / Thế mạnh</label>
                <input name="specializations" value={formData.specializations} onChange={handleChange} placeholder="Tour biển đảo, Tour mạo hiểm..." className="w-full border rounded px-3 py-2" />
             </div>
          </div>

          {/* Nhóm thông tin bổ sung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full border rounded px-3 py-2" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white">
                    <option value="active">Đang làm việc</option>
                    <option value="on_leave">Nghỉ phép</option>
                    <option value="inactive">Đã nghỉ việc</option>
                </select>
             </div>
          </div>

          <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
             {onClose && (
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">Hủy</button>
             )}
             <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-70"
             >
                {loading ? 'Đang xử lý...' : <><Save size={18} /> Lưu Nhân Viên</>}
             </button>
          </div>
       </form>
    </div>
  );
};

export default StaffForm;