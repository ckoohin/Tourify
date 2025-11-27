import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../components/config/sidebarConfig';
import AdminDashboard from './AdminDashboard';
import GuideDashboard from './GuideDashboard';
import SupplierDashboard from './SupplierDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Hàm map role_id sang slug (nếu backend trả về id)
  const getRoleSlug = () => {
    if (!user) return 'guest';
    if (user.role && user.role.slug) return user.role.slug;
    
    // Fallback map từ ID (khớp với logic Sidebar)
    const roleMap = {
      1: ROLES.ADMIN,
      4: ROLES.GUIDE,
      6: ROLES.SUPPLIER
    };
    return roleMap[user.role_id] || 'guest';
  };

  const roleSlug = getRoleSlug();

  // --- RENDER GIAO DIỆN THEO VAI TRÒ ---
  
  if (roleSlug === ROLES.ADMIN) {
    return <AdminDashboard user={user} />;
  }

  if (roleSlug === ROLES.GUIDE) {
    return <GuideDashboard user={user} />;
  }

  if (roleSlug === ROLES.SUPPLIER) {
    return <SupplierDashboard user={user} />;
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-slate-800">Xin chào, {user?.name}</h2>
      <p className="text-slate-500 mt-2">Chào mừng bạn đến với hệ thống Tourify.</p>
    </div>
  );
};

export default Dashboard;