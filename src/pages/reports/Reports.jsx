import React from 'react';
import { Link } from 'react-router-dom';

// TODO: Import thư viện biểu đồ, ví dụ:
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Hàm helper để định dạng tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Dữ liệu giả lập (bạn sẽ thay thế bằng API)
const topTours = [
    { name: 'Đà Nẵng - Hội An - Bà Nà Hills', bookings: 45, revenue: 325800000, cost: 210000000, profit: 115800000 },
    { name: 'Hạ Long Du Thuyền 5 Sao', bookings: 38, revenue: 280000000, cost: 190500000, profit: 89500000 },
    { name: 'Phú Quốc - Thiên Đường Đảo Ngọc', bookings: 30, revenue: 158700000, cost: 110000000, profit: 48700000 },
    { name: 'Sapa - Fansipan - Bản Cát Cát', bookings: 25, revenue: 71250000, cost: 50000000, profit: 21250000 },
    { name: 'Ninh Bình: Tràng An - Bái Đính', bookings: 50, revenue: 99500000, cost: 80000000, profit: 19500000 },
];

const topGuides = [
    { name: 'Nguyễn Tuấn Anh', avatar: 'https://i.pravatar.cc/150?img=7', tours: 8, rating: 4.92, reviews: 68, rate: '98%' },
    { name: 'Trần Thị Mai', avatar: 'https://i.pravatar.cc/150?img=8', tours: 10, rating: 4.85, reviews: 82, rate: '95%' },
    { name: 'Lê Minh C', avatar: 'https://i.pravatar.cc/150?img=9', tours: 7, rating: 4.80, reviews: 55, rate: '92%' },
];

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích chi tiết hiệu quả kinh doanh và vận hành.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
          {/* Quick Select */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hôm nay</button>
            <button className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">7 ngày</button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm">30 ngày</button>
            <button className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Quý này</button>
          </div>
          
          {/* Date Pickers */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full">
              <i className="ri-calendar-2-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input type="date" defaultValue="2025-10-26" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 w-full focus:ring-primary focus:border-primary" />
            </div>
            <span className="text-slate-400">đến</span>
            <div className="relative w-full">
              <i className="ri-calendar-2-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input type="date" defaultValue="2025-11-25" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 w-full focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>
        
        {/* Export Button */}
        <button className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm shadow-green-500/30 flex items-center transition-colors w-full md:w-auto justify-center">
          <i className="ri-download-2-line mr-2"></i>
          Xuất báo cáo (CSV)
        </button>
      </div>

      {/* KPIs CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-primary rounded-xl"><i className="ri-money-dollar-circle-line text-xl"></i></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng Doanh thu</p>
              <h3 className="text-2xl font-bold text-slate-800">1.250.800.000đ</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl"><i className="ri-arrow-left-right-line text-xl"></i></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng Chi phí</p>
              <h3 className="text-2xl font-bold text-slate-800">820.150.000đ</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-500 rounded-xl"><i className="ri-wallet-3-line text-xl"></i></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Lợi nhuận gộp</p>
              <h3 className="text-2xl font-bold text-green-600">430.650.000đ</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><i className="ri-ticket-line text-xl"></i></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng số Booking</p>
              <h3 className="text-2xl font-bold text-slate-800">215</h3>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Doanh thu & Lợi nhuận */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Biểu đồ Doanh thu & Lợi nhuận (30 ngày)</h2>
          {/* TODO: Tích hợp Recharts tại đây 
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={...}>
                ...
              </LineChart>
            </ResponsiveContainer>
          */}
          <div className="w-full h-80 bg-slate-50 flex items-center justify-center rounded-lg">
            <p className="text-slate-400">Biểu đồ Doanh thu & Lợi nhuận</p>
          </div>
        </div>
        
        {/* Side Chart: Nguồn Booking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Nguồn Booking</h2>
          {/* TODO: Tích hợp Recharts (PieChart) tại đây 
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                ...
              </PieChart>
            </ResponsiveContainer>
          */}
          <div className="w-full h-48 bg-slate-50 flex items-center justify-center rounded-lg my-4">
             <p className="text-slate-400">Biểu đồ tròn</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-primary mr-2"></span>Website</span>
              <span className="font-medium text-slate-800">50% (107)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Đối tác</span>
              <span className="font-medium text-slate-800">30% (65)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>Offline</span>
              <span className="font-medium text-slate-800">20% (43)</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE: Hiệu suất Tour */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Báo cáo Hiệu suất Tour</h2>
          <p className="text-sm text-slate-500">Top 5 tour có doanh thu cao nhất (30 ngày qua)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tour</th>
                <th className="px-6 py-4">Số Booking</th>
                <th className="px-6 py-4">Doanh thu</th>
                <th className="px-6 py-4">Chi phí</th>
                <th className="px-6 py-4">Lợi nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topTours.map((tour) => (
                <tr key={tour.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{tour.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-center">{tour.bookings}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{formatCurrency(tour.revenue)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(tour.cost)}</td>
                  <td className="px-6 py-4 text-green-600 font-bold">{formatCurrency(tour.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* TABLE: Hiệu suất HDV */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Báo cáo Hiệu suất Hướng dẫn viên</h2>
          <p className="text-sm text-slate-500">Top 5 HDV có đánh giá cao nhất (30 ngày qua)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Hướng dẫn viên</th>
                <th className="px-6 py-4">Số tour đã dẫn</th>
                <th className="px-6 py-4">Đánh giá trung bình</th>
                <th className="px-6 py-4">Số review</th>
                <th className="px-6 py-4">Tỷ lệ phản hồi tốt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topGuides.map((guide) => (
                <tr key={guide.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={guide.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                      <div className="font-medium text-slate-700">{guide.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-center">{guide.tours}</td>
                  <td className="px-6 py-4 text-amber-500 font-bold flex items-center gap-1"><i className="ri-star-fill"></i> {guide.rating}</td>
                  <td className="px-6 py-4 text-slate-600 text-center">{guide.reviews}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{guide.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}