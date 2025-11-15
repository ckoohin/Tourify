import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

// Props:
// - initialData: Dữ liệu ban đầu (cho trang Edit)
// - onSubmit: Hàm xử lý khi submit (Create hoặc Edit)
// - loading: Trạng thái loading (từ trang cha)
export default function StaffForm({ initialData, onSubmit, loading }) {
  
  // State cho form data
  const [formData, setFormData] = useState({
    staff_code: '',
    full_name: '',
    staff_type: 'tour_guide', // Mặc định
    status: 'active', // Mặc định
    phone: '',
    email: '',
    birthday: '',
    gender: 'male',
    address: '',
    // (Thêm các trường JSON: languages, certifications... nếu cần)
  });

  // Tải dữ liệu ban đầu (cho trang Edit)
  useEffect(() => {
    if (initialData) {
      // Định dạng lại ngày tháng nếu cần (ví dụ: 'YYYY-MM-DD' cho input type="date")
      const formattedData = {
        ...initialData,
        birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : '',
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý khi submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Gửi dữ liệu về cho cha xử lý
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Grid: Tên & Mã NV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Họ và Tên (Bắt buộc)</label>
          <input
            type="text" name="full_name"
            value={formData.full_name} onChange={handleChange}
            className="input-class-tailwind w-full mt-1" required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Mã nhân sự</label>
          <input
            type="text" name="staff_code"
            value={formData.staff_code} onChange={handleChange}
            className="input-class-tailwind w-full mt-1"
          />
        </div>
      </div>

      {/* Grid: Loại NV & Trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Loại nhân sự</label>
          <select name="staff_type" value={formData.staff_type} onChange={handleChange} className="input-class-tailwind w-full mt-1">
            <option value="tour_guide">Hướng dẫn viên</option>
            <option value="tour_leader">Trưởng đoàn</option>
            <option value="driver">Tài xế</option>
            <option value="coordinator">Điều phối</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Trạng thái</label>
          <select name="status" value={formData.status} onChange={handleChange} className="input-class-tailwind w-full mt-1">
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="on_leave">Đang nghỉ phép</option>
          </select>
        </div>
      </div>
      
      {/* Grid: SĐT & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số điện thoại (Bắt buộc)</label>
          <input
            type="tel" name="phone"
            value={formData.phone} onChange={handleChange}
            className="input-class-tailwind w-full mt-1" required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" name="email"
            value={formData.email} onChange={handleChange}
            className="input-class-tailwind w-full mt-1"
          />
        </div>
      </div>
      
      {/* (Thêm các trường khác: Ngày sinh, Giới tính, Địa chỉ...) */}
      
      {/* Nút Submit */}
      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white ... flex items-center">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}