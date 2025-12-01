import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  // Nội dung Banner thay đổi tùy theo trang hiện tại
  const bannerContent = isRegister ? {
    title: "Bắt đầu hành trình mới",
    desc: "Khám phá hàng ngàn địa điểm du lịch hấp dẫn và quản lý chuyến đi của bạn một cách dễ dàng cùng Tourify."
  } : {
    title: "Chào mừng trở lại!",
    desc: "Đăng nhập để tiếp tục quản lý các chuyến đi và kết nối với khách hàng của bạn trên Tourify."
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      
      {/* --- CỘT TRÁI: BANNER (Chỉ hiện trên PC) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative items-center justify-center overflow-hidden">
        {/* Hiệu ứng nền */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-90"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* Nội dung Banner Dynamic */}
        <div className="relative z-10 text-white text-center px-16 max-w-xl animate-in fade-in slide-in-from-left-10 duration-700">
          <h2 className="text-5xl font-bold mb-6 leading-tight">{bannerContent.title}</h2>
          <p className="text-blue-100 text-xl leading-relaxed">
            {bannerContent.desc}
          </p>
        </div>
      </div>

      {/* --- CỘT PHẢI: NỘI DUNG FORM (Outlet) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white overflow-y-auto p-4">
        <div className="w-full max-w-md px-4 sm:px-8 py-12 animate-in fade-in zoom-in-95 duration-500">
          {/* Form Login hoặc Register sẽ được render ở đây */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}