import React from 'react';
import { Link } from 'react-router-dom';

// Nhận props toggleSidebar từ MainLayout
export default function Header({ toggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Nút này sẽ gọi hàm toggleSidebar từ MainLayout */}
        <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-midnight">
          <i className="ri-menu-2-line text-2xl"></i>
        </button>
        <div className="hidden md:flex items-center w-full max-w-md bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <i className="ri-search-2-line text-slate-400"></i>
          <input type="text" placeholder="Tìm kiếm tour, booking, khách hàng..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700 placeholder:text-slate-400" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <Link to="/settings" className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <i className="ri-settings-line text-xl"></i>
        </Link>
      </div>
    </header>
  );
}