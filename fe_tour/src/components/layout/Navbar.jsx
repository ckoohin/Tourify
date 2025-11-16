import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, // Icon Hamburger
  Bell, // Icon Thông báo
  ChevronDown, // Icon mũi tên dropdown
  LogOut,
  Settings,
  User,
  Home, // Icon cho Trang chủ (Dashboard)
} from 'lucide-react';

// --- (NỘI DUNG MỚI) ---
// 1. Ánh xạ (Mapping) từ slug sang Tiếng Việt
const BREADCRUMB_NAMES = {
  'dashboard': 'Dashboard',
  'tours': 'Quản lý Tour',
  'create': 'Tạo mới',
  'edit': 'Chỉnh sửa',
  'schedules': 'Lịch khởi hành',
  'attractions': 'Điểm tham quan',
  'bookings': 'Quản lý Booking',
  'customers': 'Khách hàng',
  'guides': 'Nhân sự',
  'providers': 'Nhà cung cấp',
  'reports': 'Báo cáo',
  'settings': 'Cài đặt',
};

// 2. Component Breadcrumbs (Nội bộ)
const Breadcrumbs = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const crumbs = pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      // Cố gắng dịch tên, nếu không được, dùng tên gốc (ví dụ: ID của tour)
      const displayName = BREADCRUMB_NAMES[name.toLowerCase()] || name;
      return { displayName, routeTo };
    });
    setBreadcrumbs(crumbs);
  }, [location.pathname]);

  return (
    <nav className="hidden md:flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-slate-500">
        <li>
          <Link to="/dashboard" className="hover:text-primary">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.routeTo} className="flex items-center">
            <span className="mx-2">/</span>
            <Link
              to={crumb.routeTo}
              className={`font-medium ${
                index === breadcrumbs.length - 1
                  ? 'text-slate-800' // Crumb cuối cùng
                  : 'hover:text-primary' // Các crumb trước
              }`}
            >
              {crumb.displayName}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// --- COMPONENT NAVBAR CHÍNH ---

/**
 * Đây là Header (Thanh điều hướng trên cùng)
 * @param {object} props
 * @param {function} props.toggleSidebar - Hàm để bật/tắt Sidebar trên di động
 */
export default function Navbar({ toggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* === (NỘI DUNG ĐÃ SỬA) === */}
      {/* 1. Bên trái: Nút Hamburger (Mobile) + Breadcrumbs (Desktop) */}
      <div className="flex items-center gap-4">
        {/* Nút Hamburger (chỉ hiển thị trên mobile) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-slate-500 hover:text-midnight"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Breadcrumbs (chỉ hiển thị trên desktop) */}
        <Breadcrumbs />
      </div>

      {/* 2. Bên phải: Thông báo & Profile User */}
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {/* Chấm thông báo mới */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* (NỘI DUNG MỚI) Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <img
              src="https://i.pravatar.cc/150?img=3" // (Nên lấy ảnh avatar của user)
              alt="Admin"
              className="w-8 h-8 rounded-full border-2 border-primary/50"
            />
            <span className="hidden md:block text-sm font-medium text-slate-700">
              Admin
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu thả xuống */}
          {isProfileOpen && (
            <div className="absolute top-12 right-0 z-20 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800 truncate">
                  Admin Quản Trị
                </p>
                <p className="text-xs text-slate-500 truncate">
                  admin@tourify.com
                </p>
              </div>
              <div className="p-1">
                <Link
                  to="/profile"
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary rounded-md"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Thông tin tài khoản
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary rounded-md"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Cài đặt
                </Link>
              </div>
              <div className="p-1 border-t border-slate-100">
                <button
                  // TODO: Thêm logic đăng xuất
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}