import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1/dashboard';

const Reports = () => {
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

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>
          {prefix}{typeof value === 'number' && prefix ? formatCurrency(value) : value.toLocaleString()}
        </p>
      </div>
      <div className={`${color} bg-opacity-10 p-4 rounded-full`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Thống Kê Tour</h1>
          <p className="text-gray-600">Tổng quan về hoạt động kinh doanh</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng Doanh Thu"
            value={dashboardData.profit}
            icon={DollarSign}
            color="text-green-600"
            prefix="₫"
          />
          <StatCard
            title="Tổng Booking"
            value={dashboardData.totalBooking}
            icon={Calendar}
            color="text-blue-600"
          />
          <StatCard
            title="Tổng Khách Hàng"
            value={dashboardData.totalCustomer}
            icon={Users}
            color="text-purple-600"
          />
          <StatCard
            title="Trung Bình/Booking"
            value={dashboardData.totalBooking > 0 ? Math.round(dashboardData.profit / dashboardData.totalBooking) : 0}
            icon={TrendingUp}
            color="text-orange-600"
            prefix="₫"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Doanh Thu Theo Tour</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.toursRevenue.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar dataKey="remaining_amount" fill="#3b82f6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trạng Thái Booking</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.bookingStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ booking_status, percent }) => 
                    `${statusLabels[booking_status]} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="booking_count"
                >
                  {dashboardData.bookingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Tours Theo Doanh Thu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh Thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.toursRevenue
                  .sort((a, b) => Number(b.remaining_amount) - Number(a.remaining_amount))
                  .slice(0, 10)
                  .map((tour, index) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tour.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(tour.remaining_amount)}
                      </td>
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

export default Reports;