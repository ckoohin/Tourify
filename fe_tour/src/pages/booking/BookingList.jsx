import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập cho danh sách booking
const mockBookings = [
  {
    id: '#BK-9088',
    customer: 'Nguyễn Văn A',
    phone: '0905.123.456',
    tour: 'Hà Giang Mùa Hoa Tam Giác Mạch 3N2Đ',
    departureDate: '30/11/2025',
    bookDate: '25/11/2025',
    amount: '4.500.000đ',
    status: 'Chờ xác nhận',
  },
  {
    id: '#BK-9087',
    customer: 'Trần Thị B',
    phone: 'tranthib@gmail.com',
    tour: 'Đà Nẵng - Hội An - Bà Nà Hills',
    departureDate: '28/11/2025',
    bookDate: '24/11/2025',
    amount: '7.200.000đ',
    status: 'Đã thanh toán',
  },
  {
    id: '#BK-9086',
    customer: 'Lê Minh C',
    phone: '0912.xxx.xxx',
    tour: 'Phú Quốc Nghỉ Dưỡng 4N3Đ Resort 5*',
    departureDate: '05/12/2025',
    bookDate: '24/11/2025',
    amount: '12.000.000đ',
    status: 'Đã xác nhận',
  },
  {
    id: '#BK-9085',
    customer: 'Phạm Hoàng D',
    phone: '0988.xxx.xxx',
    tour: 'Ninh Bình: Tràng An - Bái Đính - Hang Múa',
    departureDate: '20/11/2025',
    bookDate: '18/11/2025',
    amount: '1.990.000đ',
    status: 'Đã hủy',
  },
];

// Hàm helper để lấy màu sắc trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Đã thanh toán':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Đã xác nhận':
      return 'bg-blue-100 text-primary border-blue-200';
    case 'Đã hủy':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function BookingList() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tất cả các đơn đặt tour trên hệ thống.</p>
        </div>
        <Link 
          to="/bookings/create" 
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <i className="ri-add-line mr-2 text-lg"></i>
          Tạo Booking (Offline)
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors w-full md:w-auto">
          <i className="ri-search-line text-slate-400"></i>
          <input type="text" placeholder="Mã booking, tên khách..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700" />
        </div>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả trạng thái</option>
          <option value="pending" className="text-amber-600 font-medium">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="paid">Đã thanh toán</option>
          <option value="active">Đang diễn ra</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled" className="text-red-600">Đã hủy</option>
        </select>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full">
            <i className="ri-calendar-2-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="date" defaultValue="2025-11-01" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 w-full focus:ring-primary focus:border-primary" />
          </div>
          <span className="text-slate-400">đến</span>
          <div className="relative w-full">
            <i className="ri-calendar-2-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="date" defaultValue="2025-11-25" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-3 py-2.5 w-full focus:ring-primary focus:border-primary" />
          </div>
        </div>
      </div>

      {/* BOOKING TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã Booking</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tour</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              
              {mockBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className={`hover:bg-slate-50 transition-colors ${
                    booking.status === 'Chờ xác nhận' ? 'bg-amber-50/50 border-l-4 border-amber-400' : ''
                  } ${booking.status === 'Đã hủy' ? 'opacity-70' : ''}`}
                >
                  <td className="px-6 py-4">
                    <Link to={`/bookings/${booking.id.replace('#', '')}`} className="font-medium text-primary hover:underline cursor-pointer">
                      {booking.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{booking.customer}</div>
                    <div className="text-xs text-slate-500">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700 line-clamp-1 max-w-[200px]" title={booking.tour}>{booking.tour}</div>
                    <div className="text-xs text-slate-500">Khởi hành: {booking.departureDate}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{booking.bookDate}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{booking.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {booking.status === 'Chờ xác nhận' && (
                      <>
                        <button className="px-3 py-1 bg-green-500 text-white hover:bg-green-600 text-xs font-medium rounded-md transition-colors shadow-sm shadow-green-500/30">Xác nhận</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-md transition-colors">Hủy</button>
                      </>
                    )}
                    {booking.status === 'Đã xác nhận' && (
                      <>
                        <button className="px-3 py-1 bg-white border border-slate-200 text-green-600 hover:bg-green-50 text-xs font-medium rounded-md transition-colors">Ghi nhận TT</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-md transition-colors">Hủy</button>
                      </>
                    )}
                    {booking.status !== 'Chờ xác nhận' && booking.status !== 'Đã xác nhận' && (
                       <Link 
                         to={`/bookings/${booking.id.replace('#', '')}`}
                         className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
                       >
                         Xem
                       </Link>
                    )}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">4</span> trong tổng số <span className="font-medium text-slate-800">128</span> booking
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">3</button>
            <span className="px-2 py-1 text-slate-500">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">13</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}