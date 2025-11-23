import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
// Sửa lỗi: Chỉ định rõ ràng đuôi file .jsx
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

// Đây là component "khung"
export default function MainLayout() {
  // Quản lý trạng thái đóng/mở sidebar trên di động
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Truyền hàm toggle xuống Header */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* MAIN SCROLLABLE CONTENT */}
        {/* <Outlet> sẽ render trang con (ví dụ: Home.jsx) */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}