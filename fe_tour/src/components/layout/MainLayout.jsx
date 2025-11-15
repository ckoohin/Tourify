import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
// Sửa lỗi: Chỉ định rõ ràng đuôi file .jsx
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx'; // 👈 Bạn đã import đúng tên

// Đây là component "khung"
export default function MainLayout() {
 // Quản lý trạng thái đóng/mở sidebar trên di động
 const [sidebarOpen, setSidebarOpen] = useState(false);

 const toggleSidebar = () => {
  setSidebarOpen(!sidebarOpen);
 };

 return (
  <div className="flex h-screen overflow-hidden bg-slate-50">
   
   {/* Truyền state và hàm toggle xuống Sidebar */}
   <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

   {/* Vùng nội dung chính */}
   <div className="flex-1 flex flex-col overflow-hidden">
    
    {/* 🛑 SỬA LỖI TẠI ĐÂY: Thay 'Header' bằng 'Navbar' */}
    <Navbar toggleSidebar={toggleSidebar} />

    {/* MAIN SCROLLABLE CONTENT */}
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
     <Outlet /> {/* Đây là nơi nội dung của các trang con sẽ hiển thị */}
    </main>
   </div>
  </div>
 );
}