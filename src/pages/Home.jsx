import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  UserCog,
  FileBarChart,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- MOCK DATA (Dữ liệu giả lập fix cứng) ---
const revenueData = [
  { name: 'T2', revenue: 4000, bookings: 24 },
  { name: 'T3', revenue: 3000, bookings: 18 },
  { name: 'T4', revenue: 2000, bookings: 12 },
  { name: 'T5', revenue: 2780, bookings: 20 },
  { name: 'T6', revenue: 1890, bookings: 15 },
  { name: 'T7', revenue: 6390, bookings: 45 },
  { name: 'CN', revenue: 5490, bookings: 40 },
];

const recentBookings = [
  { id: '#TR-9823', customer: 'Nguyễn Văn A', tour: 'Hà Giang Mùa Hoa Tam Giác Mạch', date: '09/11/2025', amount: '4.500.000đ', status: 'pending' },
  { id: '#TR-9822', customer: 'Trần Thị B', tour: 'Đà Nẵng - Hội An 4N3Đ', date: '09/11/2025', amount: '7.200.000đ', status: 'confirmed' },
  { id: '#TR-9821', customer: 'Lê Minh C', tour: 'Phú Quốc Nghỉ Dưỡng', date: '08/11/2025', amount: '12.000.000đ', status: 'confirmed' },
  { id: '#TR-9820', customer: 'Phạm Hoàng D', tour: 'Sapa Fansipan', date: '08/11/2025', amount: '3.800.000đ', status: 'cancelled' },
];

const upcomingTours = [
  { id: 1, name: 'Hạ Long Du Thuyền 5 Sao', start: '10/11/2025', guide: 'Nguyễn Tuấn (HDV)', seats: '18/20' },
  { id: 2, name: 'Khám Phá Côn Đảo', start: '11/11/2025', guide: 'Chưa phân công', seats: '5/15', alert: true },
  { id: 3, name: 'City Tour Sài Gòn', start: '12/11/2025', guide: 'Trần Mai (HDV)', seats: '10/12' },
];

// --- SUB-COMPONENTS ---

// 1. Sidebar Component (Màu chủ đạo xanh than)
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', active: true },
    { icon: Map, label: 'Quản lý Tour' },
    { icon: CalendarCheck, label: 'Quản lý Booking' },
    { icon: Users, label: 'Khách hàng' },
    { icon: UserCog, label: 'Hướng dẫn viên' },
    { icon: MapPin, label: 'Điểm tham quan' }, // Dựa trên UseCase "Quản lý điểm tham quan"
    { icon: FileBarChart, label: 'Báo cáo' },
    { icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0 shadow-xl`}>
      {/* Logo Area */}
      <div className="flex items-center justify-between h-16 px-6 bg-[#1E293B] border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Map className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">Tourify</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
          <LogOut size={20} className="rotate-180" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 py-6 space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
              item.active
                ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`mr-3 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            {item.label}
          </a>
        ))}
      </nav>

      {/* User Profile Snippet (Bottom Sidebar) */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-[#0F172A]">
        <div className="flex items-center">
          <img
            src="https://i.pravatar.cc/150?u=admin_tourify"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin Quản Trị</p>
            <p className="text-xs text-slate-400">Điều hành viên</p>
          </div>
          <button className="ml-auto text-slate-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// 2. Header Component
const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-4 md:hidden text-slate-600 hover:text-blue-600">
          <Menu size={24} />
        </button>
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm booking, tour, khách hàng..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

// 3. Stat Card Component
const StatCard = ({ title, value, subValue, icon: Icon, trend, trendValue, alert }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${alert ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      {trend === 'up' && <TrendingUp size={16} className="text-green-500 mr-1" />}
      {trend === 'down' && <TrendingDown size={16} className="text-red-500 mr-1" />}
      <span className={`font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
        {trendValue}
      </span>
      <span className="text-slate-400 ml-2">{subValue}</span>
    </div>
  </div>
);

// --- MAIN DASHBOARD LAYOUT ---
export default function DashboardPreview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-inter overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* 1. Page Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
                <p className="text-slate-500">Chào mừng trở lại, đây là tình hình hôm nay.</p>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                  Xuất báo cáo
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                  <Map size={18} className="mr-2" />
                  Tạo Tour mới
                </button>
              </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Doanh thu hôm nay"
                value="24.500.000đ"
                subValue="so với hôm qua"
                icon={FileBarChart}
                trend="up"
                trendValue="+12.5%"
              />
               <StatCard
                title="Booking mới"
                value="18"
                subValue="đang chờ xử lý"
                icon={CalendarCheck}
                trend="up"
                trendValue="+4"
              />
              <StatCard
                title="Khách đang đi tour"
                value="142"
                subValue="trên 8 tour active"
                icon={Users}
                trend="up"
                trendValue="Ổn định"
              />
               <StatCard
                title="Cảnh báo vận hành"
                value="3"
                subValue="cần chú ý ngay"
                icon={AlertCircle}
                alert={true}
                trend="down"
                trendValue="Quan trọng"
              />
            </div>

            {/* 3. Charts & Secondary Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart (Chiếm 2/3) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Biểu đồ doanh thu (7 ngày qua)</h2>
                  <select className="text-sm border-slate-200 rounded-md text-slate-600 bg-slate-50 p-1">
                    <option>7 ngày qua</option>
                    <option>Tháng này</option>
                  </select>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} tickFormatter={(value) => `${value / 1000}tr`} />
                      <Tooltip
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Doanh thu" maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming Tours / Operational Alerts (Chiếm 1/3) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                 <h2 className="text-lg font-bold text-slate-800 mb-6">Tour sắp khởi hành</h2>
                 <div className="flex-1 space-y-4">
                    {upcomingTours.map((tour) => (
                      <div key={tour.id} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="min-w-[50px] text-center mr-3">
                          <span className="block text-xs font-semibold text-blue-600 uppercase">{tour.start.split('/')[1]}</span>
                          <span className="block text-xl font-bold text-slate-800">{tour.start.split('/')[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{tour.name}</h4>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <UserCog size={14} className="mr-1" />
                            <span className={tour.alert ? 'text-red-500 font-medium' : ''}>{tour.guide}</span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Users size={14} className="mr-1" />
                            <span>{tour.seats} chỗ đã đặt</span>
                          </div>
                        </div>
                        {tour.alert && (
                           <div className="text-red-500" title="Cần chú ý">
                             <AlertCircle size={18} />
                           </div>
                        )}
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                   Xem tất cả lịch trình →
                 </button>
              </div>
            </div>

            {/* 4. Recent Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Booking gần đây</h2>
                <a href="/bookings" className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">Mã Booking</th>
                      <th className="px-6 py-3 font-semibold">Khách hàng</th>
                      <th className="px-6 py-3 font-semibold">Tour</th>
                      <th className="px-6 py-3 font-semibold">Ngày đặt</th>
                      <th className="px-6 py-3 font-semibold">Tổng tiền</th>
                      <th className="px-6 py-3 font-semibold">Trạng thái</th>
                      <th className="px-6 py-3 font-semibold text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors text-sm">
                        <td className="px-6 py-4 font-medium text-blue-600">{booking.id}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{booking.customer}</td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={booking.tour}>{booking.tour}</td>
                        <td className="px-6 py-4 text-slate-500">{booking.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{booking.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {booking.status === 'confirmed' ? 'Đã xác nhận' :
                             booking.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Settings size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}