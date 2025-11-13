import React from 'react';
import { NavLink, Link } from 'react-router-dom';

// Chúng ta sẽ dùng NavLink để tự động có class "active"
// Chúng ta cũng sẽ nhận props để xử lý việc đóng/mở trên di động
export default function Sidebar({ isOpen, toggleSidebar }) {
  const baseLinkClass = "flex items-center px-3 py-2.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group";
  const activeLinkClass = "bg-primary text-white shadow-sm shadow-primary/20 font-medium";

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
              <i className="ri-map-pin-user-fill text-white text-xl leading-none"></i>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">Tourify</span>
          </Link>
          {/* Nút đóng cho di động */}
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
             <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Navigation Menu (Sử dụng NavLink) */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Menu Group: Tổng quan */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tổng quan</p>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <i className="ri-dashboard-3-line mr-3 text-lg"></i>
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Menu Group: Nghiệp vụ chính */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quản lý Tour</p>
            <NavLink to="/tours" className={getNavLinkClass}>
              <i className="ri-map-2-line mr-3 text-lg"></i>
              <span>Danh sách Tour</span>
            </NavLink>
            <NavLink to="/schedule" className={getNavLinkClass}>
              <i className="ri-calendar-event-line mr-3 text-lg"></i>
              <span>Lịch khởi hành</span>
            </NavLink>
            <NavLink to="/attractions" className={getNavLinkClass}>
              <i className="ri-map-pin-add-line mr-3 text-lg"></i>
              <span>Điểm tham quan</span>
            </NavLink>
          </div>

          {/* Menu Group: Bán hàng */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kinh doanh</p>
            <NavLink to="/bookings" className={`${baseLinkClass} justify-between`}>
              <div className="flex items-center">
                <i className="ri-ticket-line mr-3 text-lg"></i>
                <span>Booking</span>
              </div>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">8</span>
            </NavLink>
            <NavLink to="/customers" className={getNavLinkClass}>
              <i className="ri-user-smile-line mr-3 text-lg"></i>
              <span>Khách hàng</span>
            </NavLink>
          </div>

          {/* Menu Group: Nhân sự & Hệ thống */}
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hệ thống</p>
            <NavLink to="/guides" className={getNavLinkClass}>
              <i className="ri-team-line mr-3 text-lg"></i>
              <span>Hướng dẫn viên</span>
            </NavLink>
            <NavLink to="/reports" className={getNavLinkClass}>
              <i className="ri-file-chart-line mr-3 text-lg"></i>
              <span>Báo cáo doanh thu</span>
            </NavLink>
            <NavLink to="/settings" className={getNavLinkClass}>
              <i className="ri-settings-3-line mr-3 text-lg"></i>
              <span>Cài đặt</span>
            </NavLink>
          </div>
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center">
          <img src="https://i.pravatar.cc/150?img=3" alt="Admin" className="w-10 h-10 rounded-full border-2 border-primary" />
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Admin Quản Trị</p>
            <p className="text-xs text-slate-500 truncate">admin@tourify.com</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <i className="ri-logout-box-r-line text-lg"></i>
          </button>
        </div>
      </aside>
    </>
  );
}