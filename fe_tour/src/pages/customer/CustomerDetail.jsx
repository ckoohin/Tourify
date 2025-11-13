import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Dữ liệu giả lập cho 1 khách hàng
const mockCustomer = {
  id: '0001',
  name: 'Nguyễn Văn A',
  joinDate: '12/01/2023',
  email: 'nguyenvana@gmail.com',
  phone: '0905.123.456',
  avatar: 'https://i.pravatar.cc/150?img=1',
  totalBookings: 12,
  totalSpent: 120500000,
  rank: 'VIP',
  status: 'Đang hoạt động',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh'
};

// Dữ liệu giả lập lịch sử booking
const mockHistory = [
  { id: '#BK-9088', tour: 'Hà Giang Mùa Hoa Tam Giác Mạch', date: '25/11/2025', amount: 4500000, status: 'Đã hoàn thành' },
  { id: '#BK-8012', tour: 'Phú Quốc Nghỉ Dưỡng 4N3Đ', date: '10/06/2025', amount: 12000000, status: 'Đã hoàn thành' },
  { id: '#BK-7500', tour: 'Đà Nẵng - Hội An', date: '15/03/2025', amount: 7200000, status: 'Đã hoàn thành' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function CustomerDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const customer = mockCustomer; // TODO: Fetch customer data by id

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <Link to="/customers" className="text-slate-400 hover:text-primary">
          <i className="ri-arrow-left-s-line text-2xl"></i>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Chi tiết Khách hàng</h1>
      </div>

      {/* Bố cục 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Thông tin cá nhân */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card thông tin chính */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <img 
              src={customer.avatar} 
              alt={customer.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-100"
            />
            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
            <p className="text-sm text-slate-500">Tham gia: {customer.joinDate}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <i className="ri-vip-crown-fill mr-1"></i> {customer.rank}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                {customer.status}
              </span>
            </div>
          </div>
          
          {/* Card thông tin liên hệ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex">
                <i className="ri-mail-line text-slate-400 w-6"></i>
                <span className="text-sm text-slate-700">{customer.email}</span>
              </div>
              <div className="flex">
                <i className="ri-phone-line text-slate-400 w-6"></i>
                <span className="text-sm text-slate-700">{customer.phone}</span>
              </div>
              <div className="flex">
                <i className="ri-map-pin-line text-slate-400 w-6"></i>
                <span className="text-sm text-slate-700">{customer.address}</span>
              </div>
            </div>
          </div>

          {/* Card hành động */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Hành động</h3>
             <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <i className="ri-edit-line mr-2"></i> Chỉnh sửa thông tin
                </button>
                 <button className="w-full px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 flex items-center justify-center transition-colors">
                  <i className="ri-lock-line mr-2"></i> Khóa tài khoản
                </button>
             </div>
          </div>
        </div>
        
        {/* Cột phải: Thống kê & Lịch sử */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <i className="ri-ticket-line text-2xl text-primary mb-2"></i>
              <p className="text-sm text-slate-500">Tổng số tour đã đặt</p>
              <p className="text-2xl font-bold text-slate-800">{customer.totalBookings} <span className="text-lg font-normal">tours</span></p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <i className="ri-money-dollar-circle-line text-2xl text-green-500 mb-2"></i>
              <p className="text-sm text-slate-500">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(customer.totalSpent)}</p>
            </div>
          </div>

          {/* Bảng lịch sử booking */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Lịch sử Booking</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Mã Booking</th>
                    <th className="px-6 py-4">Tên Tour</th>
                    <th className="px-6 py-4">Ngày đặt</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {mockHistory.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/bookings/${booking.id.replace('#', '')}`} className="font-medium text-primary hover:underline">
                          {booking.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{booking.tour}</td>
                      <td className="px-6 py-4 text-slate-600">{booking.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{formatCurrency(booking.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}