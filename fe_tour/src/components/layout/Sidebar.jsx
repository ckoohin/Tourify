import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  CircleUserRound, // Đã sửa: UserRoundPin -> CircleUserRound
  LayoutDashboard,
  Map,
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  User,
  LineChart,
  Settings,
  X,
  LogOut,
} from 'lucide-react';

// Chúng ta sẽ dùng NavLink để tự động có class "active"
// Chúng ta cũng sẽ nhận props để xử lý việc đóng/mở trên di động
export default function Sidebar({ isOpen, toggleSidebar }) {
  const baseLinkClass =
    'flex items-center px-3 py-2.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group';
  const activeLinkClass =
    'bg-primary text-white shadow-sm shadow-primary/20 font-medium';

  // Hàm helper để gán class
  const getNavLinkClass = ({ isActive }) =>
    `${baseLinkClass} ${isActive ? activeLinkClass : ''}`;

  return (
    <>
      {/* Lớp phủ cho di động, click để đóng */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* === SIDEBAR === */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-midnight text-slate-300 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-900/50 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <CircleUserRound className="text-white w-5 h-5" /> {/* Đã sửa */}
            </div>
            <span className="text-white text-xl font-bold tracking-wide">
              Tourify
            </span>
          </Link>
          {/* Nút đóng cho di động */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu (Sử dụng NavLink) */}
        {/* Đã thêm class ẩn thanh cuộn vào đây */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Menu Group: Tổng quan */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tổng quan
            </p>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <LayoutDashboard className="mr-3 w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Menu Group: Nghiệp vụ chính */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quản lý Tour
            </p>
            <NavLink to="/tours" className={getNavLinkClass}>
              <Map className="mr-3 w-5 h-5" />
              <span>Danh sách Tour</span>
            </NavLink>
            <NavLink to="/tour-categories" className={getNavLinkClass}>
              <Settings className="mr-3 w-5 h-5" />
              <span>Danh mục Tour</span>
            </NavLink>
            <NavLink to="/schedules" className={getNavLinkClass}>
              <CalendarDays className="mr-3 w-5 h-5" />
              <span>Lịch khởi hành</span>
            </NavLink>
            <NavLink to="/attractions" className={getNavLinkClass}>
              <MapPin className="mr-3 w-5 h-5" />
              <span>Điểm tham quan</span>
            </NavLink>
          </div>

          {/* Menu Group: Bán hàng */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Kinh doanh
            </p>
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `${getNavLinkClass({ isActive })} justify-between`
              }
            >
              <div className="flex items-center">
                <Ticket className="mr-3 w-5 h-5" />
                <span>Booking</span>
              </div>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                8
              </span>
            </NavLink>
            <NavLink to="/customers" className={getNavLinkClass}>
              <Users className="mr-3 w-5 h-5" />
              <span>Khách hàng</span>
            </NavLink>
          </div>

          {/* Menu Group: Nhân sự & Hệ thống */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Hệ thống
            </p>
            <NavLink to="/staff" className={getNavLinkClass}>
              <User className="mr-3 w-5 h-5" />
              <span>Quản lí nhân sự</span>
            </NavLink>
            <NavLink to="/supplier" className={getNavLinkClass}>
              <User className="mr-3 w-5 h-5" />
              <span>Quản lí nhà cung cấp</span>
            </NavLink>
            <NavLink to="/reports" className={getNavLinkClass}>
              <LineChart className="mr-3 w-5 h-5" />
              <span>Báo cáo doanh thu</span>
            </NavLink>
            <NavLink to="/settings" className={getNavLinkClass}>
              <Settings className="mr-3 w-5 h-5" />
              <span>Cài đặt</span>
            </NavLink>
          </div>
        </nav>

        {/* User Profile Summary
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center">
          <img
            src="https://i.pravatar.cc/150?img=3"
            alt="Admin"
            className="w-10 h-10 rounded-full border-2 border-primary"
          />
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              Admin Quản Trị
            </p>
            <p className="text-xs text-slate-500 truncate">
              admin@tourify.com
            </p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div> */}
      </aside>
    </>
  );
}