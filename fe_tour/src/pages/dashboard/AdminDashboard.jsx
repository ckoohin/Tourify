import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Map, 
  Ticket, 
  TrendingUp, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Download 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api/v1/dashboard';

const StatCard = ({ title, value, icon: Icon, color, link, prefix = '' }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">
          {prefix}
          {typeof value === 'number' && prefix.includes('₫') 
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
            : value?.toLocaleString() || value}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${color || 'bg-gray-500'}`}>
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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    profit: 0,
    totalBooking: 0,
    totalCustomer: 0,
    toursRevenue: [],
    bookingStatus: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profitRes, bookingRes, customerRes, revenueRes, statusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/profit`),
        fetch(`${API_BASE_URL}/totalBooking`),
        fetch(`${API_BASE_URL}/totalCustomer`),
        fetch(`${API_BASE_URL}/toursRevenue`),
        fetch(`${API_BASE_URL}/bookingStatus`)
      ]);

      const profitData = await profitRes.json();
      const bookingData = await bookingRes.json();
      const customerData = await customerRes.json();
      const revenueData = await revenueRes.json();
      const statusData = await statusRes.json();

      setDashboardData({
        profit: profitData.data.profit[0]?.profit || 0,
        totalBooking: bookingData.data.totalBooking[0]?.totalBooking || 0,
        totalCustomer: customerData.data.totalCustomer[0]?.totalCustomer || 0,
        toursRevenue: revenueData.data.data || [],
        bookingStatus: statusData.data.bookingStatusList || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const statusLabels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    deposited: 'Đã đặt cọc',
    paid: 'Đã thanh toán',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Xin chào, Quản trị viên! </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Chào mừng quay trở lại hệ thống Tourify. Dưới đây là tổng quan hoạt động kinh doanh.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Tổng Doanh Thu" value={dashboardData.profit} icon={DollarSign} color="bg-green-500" prefix="₫" />
          <StatCard title="Tổng Booking" value={dashboardData.totalBooking} icon={Ticket} color="bg-blue-500" link="/bookings" />
          <StatCard title="Tổng Khách Hàng" value={dashboardData.totalCustomer} icon={Users} color="bg-purple-500" link="/customers" />
          <StatCard 
            title="Trung Bình/Booking" 
            value={dashboardData.totalBooking > 0 ? Math.round(dashboardData.profit / dashboardData.totalBooking) : 0} 
            icon={TrendingUp} 
            color="bg-amber-500" 
            prefix="₫" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Tour Theo Doanh Thu</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dashboardData.toursRevenue.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="remaining_amount" fill="#3b82f6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trạng Thái Booking</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dashboardData.bookingStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="booking_count"
                  label={({ booking_status, percent }) => `${statusLabels[booking_status]}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.bookingStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend formatter={(value) => statusLabels[value] || value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Bảng Xếp Hạng Tour Theo Doanh Thu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Tour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.toursRevenue
                  .sort((a, b) => Number(b.remaining_amount) - Number(a.remaining_amount))
                  .slice(0, 10)
                  .map((tour, index) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium">{tour.name}</td>
                      <td className="px-6 py-4 text-sm">{formatCurrency(tour.remaining_amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;