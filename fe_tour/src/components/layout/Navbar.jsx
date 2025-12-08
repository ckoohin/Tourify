import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import toast from 'react-hot-toast';
import {
  Menu, 
  Bell, 
  ChevronDown, 
  LogOut,
  Settings,
  User as UserIcon,
  Home, 
} from 'lucide-react';

const BREADCRUMB_NAMES = {
  'dashboard': 'Dashboard',
  'categories': 'Quản lý Danh mục',
  'tours': 'Quản lý Tour',
  'tour-versions': 'Quản lý Phiên bản Tour',
  'create': 'Tạo mới',
  'edit': 'Chỉnh sửa',
  'departures': 'Lịch khởi hành',
  'attractions': 'Điểm tham quan',
  'bookings': 'Quản lý Booking',
  'customers': 'Khách hàng',
  'guides': 'Nhân sự',
  'providers': 'Nhà cung cấp',
  'reports': 'Báo cáo',
  'settings': 'Cài đặt',
  'staff': 'Nhân viên',
  'quotes': 'Tạo báo giá',
  'booking-kanban': 'Trạng thái booking',
  'finance/transactions': 'Tài chính',
  'feedbacks': 'Phản hồi'
};

const Breadcrumbs = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const crumbs = pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const displayName = BREADCRUMB_NAMES[name.toLowerCase()] || name;
      return { displayName, routeTo };
    });
    setBreadcrumbs(crumbs);
  }, [location.pathname]);

  return (
    <nav className="hidden md:flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-slate-500">
        <li>
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.routeTo} className="flex items-center">
            <span className="mx-2">/</span>
            <Link
              to={crumb.routeTo}
              className={`font-medium transition-colors ${
                index === breadcrumbs.length - 1
                  ? 'text-slate-800' 
                  : 'hover:text-blue-600' 
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

export default function Navbar({ toggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
        await logout();
        toast.success("Đăng xuất thành công!");
        navigate('/login');
    } catch (error) {
        console.error("Logout error:", error);
        toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      
      {/* Bên trái: Menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Bên phải: Noti + Profile */}
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 pl-1 pr-2 py-1 rounded-full transition-all border border-transparent hover:border-slate-200 group"
          >
            {/* Avatar User */}
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0D8ABC&color=fff`}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:border-blue-300 transition-colors"
            />
            
            {/* HIỂN THỊ LỜI CHÀO */}
            <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none mb-0.5">
                  Xin chào,
                </span>
                <span className="text-sm font-bold text-slate-700 leading-none max-w-[150px] truncate">
                  {user?.name || "Khách"}
                </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu thả xuống */}
          {isProfileOpen && (
            <div className="absolute top-14 right-0 z-50 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Đang đăng nhập với tên:</p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.name || "Khách"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
              
              <div className="p-1">
                <Link
                  to="/profile"
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <UserIcon className="w-4 h-4 mr-3" />
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Cài đặt hệ thống
                </Link>
              </div>

              <div className="p-1 border-t border-slate-100 mt-1">
                <button
                  onClick={handleLogout} 
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
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