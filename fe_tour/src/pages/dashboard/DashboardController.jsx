import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../components/config/sidebarConfig';
import AdminDashboard from './AdminDashboard';
import GuideDashboard from './GuideDashboard';
import SupplierDashboard from './SupplierDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  // Lấy thêm biến loading từ AuthContext
  const { user, getUserRole, loading } = useAuth();
  
  const roleSlug = getUserRole(); 

  useEffect(() => {
    // Log chỉ chạy khi loading = false để đảm bảo user đã load xong
    if (!loading) {
      console.log("=== DASHBOARD DEBUG ===");
      console.log("User object:", user);
      console.log("Role Slug Detected:", roleSlug);
      console.log("Expected Admin Slug:", ROLES.ADMIN);
    }
  }, [user, roleSlug, loading]);

  // 1. Hiển thị Loading nếu AuthContext đang tải user
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 2. Render Dashboard theo Role
  switch (roleSlug) {
    case ROLES.ADMIN: 
      return <AdminDashboard user={user} />;
    
    case ROLES.GUIDE: 
      return <GuideDashboard user={user} />;
    
    case ROLES.SUPPLIER: 
      return <SupplierDashboard user={user} />;
      
    default:
      // Fallback
      return (
        <div className="p-10 text-center animate-in fade-in">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 inline-block max-w-lg">
            <h2 className="text-2xl font-bold text-slate-700">Xin chào, {user?.name}</h2>
            <p className="mt-3 text-slate-500">
              Tài khoản của bạn (Role: {user?.role?.name || 'N/A'}) chưa được phân quyền hoặc không xác định được giao diện.
            </p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Debug Slug: {roleSlug}</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;