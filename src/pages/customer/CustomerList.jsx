import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập cho danh sách khách hàng
const mockCustomers = [
  {
    id: '#KH-0001',
    name: 'Nguyễn Văn A',
    joinDate: '12/01/2023',
    email: 'nguyenvana@gmail.com',
    phone: '0905.123.456',
    avatar: 'https://i.pravatar.cc/150?img=1',
    totalBookings: 12,
    totalSpent: 120500000,
    rank: 'VIP',
    status: 'Đang hoạt động',
  },
  {
    id: '#KH-0002',
    name: 'Trần Thị B',
    joinDate: '05/03/2024',
    email: 'tranthib@gmail.com',
    phone: '0912.xxx.xxx',
    avatar: 'https://i.pravatar.cc/150?img=2',
    totalBookings: 5,
    totalSpent: 42800000,
    rank: 'Thân thiết',
    status: 'Đang hoạt động',
  },
  {
    id: '#KH-0003',
    name: 'Lê Minh C',
    joinDate: '20/11/2025',
    email: 'minhcle@gmail.com',
    phone: '0933.xxx.xxx',
    avatar: 'https://i.pravatar.cc/150?img=4',
    totalBookings: 1,
    totalSpent: 12000000,
    rank: 'Mới',
    status: 'Đang hoạt động',
  },
  {
    id: '#KH-0004',
    name: 'Phạm Hoàng D',
    joinDate: '15/09/2024',
    email: 'phamhoangd@gmail.com',
    phone: '0988.xxx.xxx',
    avatar: 'https://i.pravatar.cc/150?img=5',
    totalBookings: 2,
    totalSpent: 3500000,
    rank: 'Mới',
    status: 'Bị khóa',
  },
];

// Hàm helper để định dạng tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm helper cho trạng thái
const getStatusClass = (status) => {
  if (status === 'Đang hoạt động') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'Bị khóa') return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

// Hàm helper cho Hạng
const getRankClass = (rank) => {
  if (rank === 'VIP') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (rank === 'Thân thiết') return 'bg-blue-100 text-primary border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function CustomerList() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách khách hàng đã đăng ký và đặt tour.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors">
          <i className="ri-user-add-line mr-2 text-lg"></i>
          Thêm Khách hàng
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors w-full md:w-auto">
          <i className="ri-search-line text-slate-400"></i>
          <input type="text" placeholder="Tên, Email, SĐT..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700" />
        </div>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Hạng</option>
          <option value="new">Mới</option>
          <option value="silver">Thân thiết</option>
          <option value="gold">VIP</option>
        </select>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked" className="text-red-600">Bị khóa</option>
        </select>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã KH</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Đã đặt</th>
                <th className="px-6 py-4">Tổng chi tiêu</th>
                <th className="px-6 py-4">Hạng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              
              {mockCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className={`hover:bg-slate-50 transition-colors ${customer.status === 'Bị khóa' ? 'opacity-70 bg-red-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <Link to={`/customers/${customer.id.replace('#KH-', '')}`} className="font-medium text-primary hover:underline cursor-pointer">
                      {customer.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={customer.avatar} alt="Avatar" className={`w-9 h-9 rounded-full object-cover ${customer.status === 'Bị khóa' ? 'grayscale' : ''}`} />
                      <div>
                        <div className="font-medium text-slate-700">{customer.name}</div>
                        <div className="text-xs text-slate-500">Tham gia: {customer.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{customer.email}</div>
                    <div className="text-xs text-slate-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{customer.totalBookings} tours</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRankClass(customer.rank)}`}>
                      {customer.rank === 'VIP' && <i className="ri-vip-crown-fill mr-1"></i>}
                      {customer.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <Link 
                      to={`/customers/${customer.id.replace('#KH-', '')}`}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
                    >
                      Xem
                    </Link>
                    {customer.status === 'Đang hoạt động' ? (
                      <button className="px-3 py-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-md transition-colors">
                        Khóa
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-white border border-slate-200 text-green-600 hover:bg-green-50 text-xs font-medium rounded-md transition-colors">
                        Mở khóa
                      </button>
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
            Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">4</span> trong tổng số <span className="font-medium text-slate-800">97</span> khách hàng
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">3</button>
            <span className="px-2 py-1 text-slate-500">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">10</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">Sau</button>
          </div>
        </div>

      </div>
    </div>
  );
}