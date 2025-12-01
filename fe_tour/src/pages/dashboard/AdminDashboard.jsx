import React from 'react';
import { Users, Map, Ticket, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    {link && (
      <div className="mt-4 pt-4 border-t border-slate-50">
        <Link to={link} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
          Xem chi tiết <ArrowRight size={14} />
        </Link>
      </div>
    )}
  </div>
);

const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Xin chào, Quản trị viên {user?.name}! 👋</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Chào mừng quay trở lại hệ thống điều hành Tourify. Dưới đây là tổng quan tình hình hoạt động hôm nay.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Booking" 
          value="1,234" 
          icon={Ticket} 
          color="bg-blue-500" 
          link="/bookings"
        />
        <StatCard 
          title="Tour Đang Chạy" 
          value="12" 
          icon={Map} 
          color="bg-emerald-500" 
          link="/tours"
        />
        <StatCard 
          title="Khách hàng Mới" 
          value="56" 
          icon={Users} 
          color="bg-purple-500" 
          link="/customers"
        />
        <StatCard 
          title="Doanh thu Tháng" 
          value="4.5 Tỷ" 
          icon={TrendingUp} 
          color="bg-amber-500" 
          link="/reports"
        />
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Hành động nhanh</h3>
          <div className="flex gap-3 flex-wrap">
            <Link to="/tours/create" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
              + Tạo Tour mới
            </Link>
            <Link to="/bookings/create" className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium text-sm transition-colors">
              + Tạo Booking
            </Link>
            <Link to="/admin/roles" className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium text-sm transition-colors">
              ⚙️ Cấu hình quyền
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;