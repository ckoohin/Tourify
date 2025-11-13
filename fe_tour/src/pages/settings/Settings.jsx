import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập cho bảng Phân quyền
const rolesData = [
  { 
    name: 'Super Admin', 
    description: 'Toàn quyền quản trị hệ thống.', 
    users: 1, 
    editable: false 
  },
  { 
    name: 'Điều hành tour (Admin)', 
    description: 'Quản lý tour, booking, HDV, báo cáo.', 
    users: 3, 
    editable: true 
  },
  { 
    name: 'Hướng dẫn viên (HDV)', 
    description: 'Xem lịch tour, báo cáo công việc, quản lý profile.', 
    users: 25, 
    editable: true 
  },
];

export default function Settings() {
  
  // Xử lý sự kiện submit form (giả lập)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Đã lưu thay đổi!');
    // TODO: Gọi API service để lưu dữ liệu
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bố cục 2 cột cho Cài đặt. 
        Sử dụng anchor links (href="#...") để nhảy đến các section 
      */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Cột trái: Menu Cài đặt */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-24">
            <nav className="flex flex-col space-y-1">
              {/* Sử dụng <a> thay vì <Link> cho anchor links nội bộ trang.
                (Hoặc có thể dùng useState để quản lý tab active) 
              */}
              <a href="#general" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-medium rounded-lg">
                <i className="ri-settings-3-line text-lg"></i>
                <span>Cài đặt chung</span>
              </a>
              <a href="#account" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-user-line text-lg"></i>
                <span>Tài khoản của tôi</span>
              </a>
              <a href="#roles" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-shield-user-line text-lg"></i>
                <span>Phân quyền (Use Case)</span>
              </a>
              <a href="#payment" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-bank-card-line text-lg"></i>
                <span>Cổng thanh toán</span>
              </a>
              <a href="#email" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-mail-line text-lg"></i>
                <span>Cấu hình Email</span>
              </a>
              <a href="#integrations" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-plug-line text-lg"></i>
                <span>Tích hợp (API)</span>
              </a>
              <a href="#system" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                <i className="ri-database-2-line text-lg"></i>
                <span>Hệ thống (Use Case)</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Cột phải: Nội dung Cài đặt */}
        <div className="lg:col-span-3 space-y-6">

          {/* Section 1: Cài đặt chung */}
          <form id="general" onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Cài đặt chung</h2>
              <p className="text-sm text-slate-500">Thông tin cơ bản của website.</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-slate-700 mb-1">Tên website</label>
                <input type="text" id="siteName" name="siteName" defaultValue="Tourify" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-1">Logo chính (Light)</label>
                  <input type="file" id="logo" name="logo" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 cursor-pointer" />
                </div>
                <div>
                  <label htmlFor="favicon" className="block text-sm font-medium text-slate-700 mb-1">Favicon</label>
                  <input type="file" id="favicon" name="favicon" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ công ty</label>
                <textarea id="address" name="address" rows="3" defaultValue="123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">Email liên hệ</label>
                  <input type="email" id="contactEmail" name="contactEmail" defaultValue="contact@tourify.com" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 mb-1">Hotline</label>
                  <input type="text" id="contactPhone" name="contactPhone" defaultValue="1900 1234" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">Tiền tệ mặc định</label>
                  <select id="currency" name="currency" defaultValue="VND" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary">
                    <option value="VND">Việt Nam Đồng (VND)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="maintenance" className="block text-sm font-medium text-slate-700 mb-1">Chế độ bảo trì</label>
                  <select id="maintenance" name="maintenance" defaultValue="off" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary">
                    <option value="off">Đang hoạt động</option>
                    <option value="on" className="text-red-600">Bật chế độ bảo trì</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
              <button type="submit" className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Lưu thay đổi</button>
            </div>
          </form>

          {/* Section 2: Tài khoản của tôi */}
          <form id="account" onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Tài khoản của tôi</h2>
              <p className="text-sm text-slate-500">Quản lý thông tin cá nhân và mật khẩu của bạn.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=3" alt="Admin Avatar" className="w-16 h-16 rounded-full border-4 border-slate-100" />
                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện</label>
                  <input type="file" id="avatar" name="avatar" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 mb-1">Tên</label>
                  <input type="text" id="adminName" name="adminName" defaultValue="Admin Quản Trị" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" id="adminEmail" name="adminEmail" defaultValue="admin@tourify.com" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-slate-100" readOnly />
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
              <button type="submit" className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Cập nhật tài khoản</button>
            </div>
          </form>

          {/* Section 3: Phân quyền (Use Case) */}
          <div id="roles" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quản lý Vai trò & Phân quyền</h2>
                <p className="text-sm text-slate-500">Tạo và quản lý các nhóm quyền cho người dùng hệ thống.</p>
              </div>
              <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm flex items-center transition-colors">
                <i className="ri-add-line mr-2"></i> Thêm vai trò
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tên vai trò</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4">Số người dùng</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {rolesData.map((role) => (
                    <tr key={role.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{role.name}</td>
                      <td className="px-6 py-4 text-slate-600">{role.description}</td>
                      <td className="px-6 py-4 text-slate-600 text-center">{role.users}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {role.editable ? (
                          <>
                            <button className="text-primary hover:underline text-xs font-medium">Sửa quyền</button>
                            <button className="text-red-500 hover:underline text-xs font-medium">Xóa</button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-xs">(Không thể sửa)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Section 4: Cổng thanh toán */}
          <form id="payment" onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Cổng thanh toán</h2>
              <p className="text-sm text-slate-500">Cấu hình các cổng thanh toán trực tuyến (VNPAY, Momo...).</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Cấu hình VNPAY */}
              <div className="border border-slate-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <img src="https://vnpay.vn/s1/statics/Images/logo-vnpay-new.svg" alt="VNPAY" className="h-8" />
                  <select defaultValue="on" className="text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary">
                    <option value="on" className="text-green-600">Đang bật</option>
                    <option value="off">Đã tắt</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="vnp_tmncode" className="block text-sm font-medium text-slate-700 mb-1">TmnCode</label>
                    <input type="text" id="vnp_tmncode" name="vnp_tmncode" defaultValue="ABC123XYZ" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label htmlFor="vnp_hashsecret" className="block text-sm font-medium text-slate-700 mb-1">HashSecret</label>
                    <input type="password" id="vnp_hashsecret" name="vnp_hashsecret" defaultValue="**************" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary" />
                  </div>
                </div>
              </div>
              {/* Cấu hình MoMo */}
              <div className="border border-slate-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="h-8" />
                  <select defaultValue="on" className="text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary">
                    <option value="on" className="text-green-600">Đang bật</option>
                    <option value="off">Đã tắt</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
              <button type="submit" className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Lưu cấu hình TT</button>
            </div>
          </form>
          
          {/* Section 5 & 6: Email & Tích hợp (Tạm thời placeholder) */}
          <div id="email" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
             <div className="p-5 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Cấu hình Email</h2>
                <p className="text-sm text-slate-500">Cài đặt máy chủ SMTP để gửi email (xác nhận, thông báo...).</p>
             </div>
             <div className="p-6">
                <p className="text-slate-500">Nội dung cài đặt SMTP...</p>
             </div>
          </div>
           <div id="integrations" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
             <div className="p-5 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Tích hợp (API)</h2>
                <p className="text-sm text-slate-500">Quản lý API keys cho các dịch vụ bên thứ ba (Google Maps, etc.).</p>
             </div>
             <div className="p-6">
                <p className="text-slate-500">Nội dung cài đặt API Keys...</p>
             </div>
          </div>

          {/* Section 7: Hệ thống (Use Case) */}
          <div id="system" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-24">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Quản lý Hệ thống</h2>
              <p className="text-sm text-slate-500">Các cài đặt nâng cao và bảo trì hệ thống.</p>
            </div>
            <div className="p-6 divide-y divide-slate-200">
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-slate-800">Xóa Cache (Bộ đệm)</h3>
                  <p className="text-sm text-slate-500">Xóa cache ứng dụng nếu có thay đổi lớn hoặc gặp lỗi hiển thị.</p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 shadow-sm transition-colors mt-2 md:mt-0">
                  Xóa Cache ngay
                </button>
              </div>
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-slate-800">Nhật ký Lỗi (Error Logs)</h3>
                  <p className="text-sm text-slate-500">Xem các lỗi phát sinh trong quá trình vận hành.</p>
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors mt-2 md:mt-0">
                  Xem Nhật ký
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}