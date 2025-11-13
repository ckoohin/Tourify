import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập cho danh sách HDV
const mockGuides = [
  {
    id: '#HDV-001',
    name: 'Nguyễn Tuấn Anh',
    email: 'anhtuan@tourify.com',
    phone: '0987.654.321',
    avatar: 'https://i.pravatar.cc/150?img=7',
    languages: 'Tiếng Anh, Tiếng Việt',
    toursLed: 120,
    rating: 4.8,
    status: 'Sẵn sàng',
  },
  {
    id: '#HDV-002',
    name: 'Trần Thị Mai',
    email: 'maitran@tourify.com',
    phone: '0912.345.678',
    avatar: 'https://i.pravatar.cc/150?img=8',
    languages: 'Tiếng Việt',
    toursLed: 85,
    rating: 4.5,
    status: 'Đang dẫn tour',
  },
  {
    id: '#HDV-003',
    name: 'Lê Minh C',
    email: 'minhcle@tourify.com',
    phone: '0933.222.111',
    avatar: 'https://i.pravatar.cc/150?img=9',
    languages: 'Tiếng Anh',
    toursLed: 52,
    rating: 4.2,
    status: 'Nghỉ phép',
  },
  {
    id: '#HDV-004',
    name: 'Phạm Hoàng D',
    email: 'hoangdpham@tourify.com',
    phone: '0988.111.222',
    avatar: 'https://i.pravatar.cc/150?img=10',
    languages: 'Tiếng Việt',
    toursLed: 10,
    rating: 3.0,
    status: 'Bị khóa',
  },
];

// Hàm helper cho trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case 'Sẵn sàng':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Đang dẫn tour':
      return 'bg-blue-100 text-primary border-blue-200';
    case 'Nghỉ phép':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Bị khóa':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function GuideList() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Hướng dẫn viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách đội ngũ hướng dẫn viên của công ty.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors">
          <i className="ri-user-add-line mr-2 text-lg"></i>
          Thêm HDV mới
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors w-full md:w-auto">
          <i className="ri-search-line text-slate-400"></i>
          <input type="text" placeholder="Tên, Email, SĐT..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700" />
        </div>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Ngôn ngữ</option>
          <option value="vi">Tiếng Việt</option>
          <option value="en">Tiếng Anh</option>
          <option value="fr">Tiếng Pháp</option>
          <option value="kr">Tiếng Hàn</option>
        </select>
        
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer w-full md:w-52">
          <option value="">Tất cả Trạng thái</option>
          <option value="available" className="text-green-600 font-medium">Sẵn sàng</option>
          <option value="on-tour" className="text-blue-600">Đang dẫn tour</option>
          <option value="on-leave" className="text-slate-500">Nghỉ phép</option>
          <option value="locked" className="text-red-600">Bị khóa</option>
        </select>
      </div>

      {/* GUIDE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã HDV</th>
                <th className="px-6 py-4">Hướng dẫn viên</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Ngôn ngữ</th>
                <th className="px-6 py-4">Số tour đã dẫn</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              
              {mockGuides.map((guide) => (
                <tr 
                  key={guide.id} 
                  className={`hover:bg-slate-50 transition-colors ${guide.status === 'Bị khóa' ? 'opacity-70 bg-red-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <Link to={`/guides/${guide.id.replace('#HDV-', '')}`} className="font-medium text-primary hover:underline cursor-pointer">
                      {guide.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={guide.avatar} alt="Avatar" className={`w-9 h-9 rounded-full object-cover ${guide.status === 'Bị khóa' ? 'grayscale' : ''}`} />
                      <div>
                        <div className="font-medium text-slate-700">{guide.name}</div>
                        <div className="text-xs text-slate-500">{guide.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{guide.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{guide.languages}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-center">{guide.toursLed}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-medium text-amber-500">
                      <i className="ri-star-fill"></i> {guide.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(guide.status)}`}>
                      {guide.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <Link 
                      to={`/guides/${guide.id.replace('#HDV-', '')}`}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
                    >
                      Xem
                    </Link>
                    {guide.status !== 'Bị khóa' ? (
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
            Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">4</span> trong tổng số <span className="font-medium text-slate-800">25</span> hướng dẫn viên
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