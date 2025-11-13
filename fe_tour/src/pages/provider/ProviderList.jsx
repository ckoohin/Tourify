import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập cho danh sách nhà cung cấp
const mockProviders = [
  {
    id: '#NCC-001',
    name: 'Khách sạn Silk Path Grand Sapa',
    email: 'contact@silkpath.com',
    phone: '0214 3788 999',
    avatar: 'https://i.pravatar.cc/150?img=11', // Placeholder avatar
    type: 'Khách sạn',
    address: 'Sapa, Lào Cai',
    status: 'Đang hoạt động',
  },
  {
    id: '#NCC-002',
    name: 'Nhà hàng Ẩm Thực Trần',
    email: 'info@amthuctran.com',
    phone: '0236 3888 666',
    avatar: 'https://i.pravatar.cc/150?img=12', // Placeholder avatar
    type: 'Nhà hàng',
    address: 'Đà Nẵng',
    status: 'Đang hoạt động',
  },
  {
    id: '#NCC-003',
    name: 'Công ty Vận Tải ABC',
    email: 'vantaiabc@gmail.com',
    phone: '0905 111 222',
    avatar: 'https://i.pravatar.cc/150?img=14', // Placeholder avatar
    type: 'Vận chuyển',
    address: 'Hà Nội',
    status: 'Ngừng hợp tác',
  },
  {
    id: '#NCC-004',
    name: 'Du thuyền Paradise Vịnh Hạ Long',
    email: 'sales@paradisevietnam.com',
    phone: '0988 777 666',
    avatar: 'https://i.pravatar.cc/150?img=15', // Placeholder avatar
    type: 'Du thuyền',
    address: 'Quảng Ninh',
    status: 'Đang hoạt động',
  },
];

// Hàm helper cho trạng thái
const getStatusClass = (status) => {
  if (status === 'Đang hoạt động') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'Ngừng hợp tác') return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

// Hàm helper cho loại hình NCC
const getTypeClass = (type) => {
  switch (type) {
    case 'Khách sạn':
      return 'bg-blue-100 text-blue-800';
    case 'Nhà hàng':
      return 'bg-amber-100 text-amber-800';
    case 'Vận chuyển':
      return 'bg-indigo-100 text-indigo-800';
    case 'Du thuyền':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};


export default function ProviderList() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhà cung cấp</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách đối tác (khách sạn, nhà hàng, vận chuyển...).</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors">
          <i className="ri-add-line mr-2 text-lg"></i>
          Thêm Nhà cung cấp
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors w-full md:w-auto">
          <i className="ri-search-line text-slate-400"></i>
          <input type="text" placeholder="Tên NCC, Email, SĐT..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700" />
        </div>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Loại hình</option>
          <option value="hotel">Khách sạn</option>
          <option value="restaurant">Nhà hàng</option>
          <option value="transport">Vận chuyển</option>
          <option value="cruise">Du thuyền</option>
          <option value="other">Khác</option>
        </select>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked" className="text-red-600">Ngừng hợp tác</option>
        </select>
      </div>

      {/* PROVIDER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã NCC</th>
                <th className="px-6 py-4">Tên Nhà cung cấp</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Loại hình</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              
              {mockProviders.map((provider) => (
                <tr 
                  key={provider.id} 
                  className={`hover:bg-slate-50 transition-colors ${provider.status === 'Ngừng hợp tác' ? 'opacity-70 bg-red-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <Link to={`/providers/${provider.id.replace('#NCC-', '')}`} className="font-medium text-primary hover:underline cursor-pointer">
                      {provider.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={provider.avatar} alt="Avatar" className={`w-9 h-9 rounded-full object-cover ${provider.status === 'Ngừng hợp tác' ? 'grayscale' : ''}`} />
                      <div>
                        <div className="font-medium text-slate-700">{provider.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{provider.email}</div>
                    <div className="text-xs text-slate-500">{provider.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeClass(provider.type)}`}>
                      {provider.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{provider.address}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(provider.status)}`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <Link 
                      to={`/providers/${provider.id.replace('#NCC-', '')}`}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
                    >
                      Xem
                    </Link>
                    {provider.status === 'Đang hoạt động' ? (
                      <button className="px-3 py-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-md transition-colors">
                        Ngừng
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-white border border-slate-200 text-green-600 hover:bg-green-50 text-xs font-medium rounded-md transition-colors">
                        Kích hoạt
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
            Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">4</span> trong tổng số <span className="font-medium text-slate-800">32</span> nhà cung cấp
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">3</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">Sau</button>
          </div>
        </div>

      </div>
    </div>
  );
}