import React from 'react';
import { Link } from 'react-router-dom';

// Đây là trang Home.jsx (Dashboard)
// Nó chỉ chứa phần nội dung <main>
export default function Dashboard() {
  return (
    // Chúng ta không cần thẻ <main> nữa, vì MainLayout đã có
    <div className="max-w-7xl mx-auto space-y-6">

      {/* PAGE TITLE & BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan điều hành</h1>
          <p className="text-sm text-slate-500 mt-1">Thứ Hai, 25 Tháng 11, 2025</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center transition-colors">
            <i className="ri-download-cloud-2-line mr-2"></i>
            Xuất báo cáo
          </button>
          <Link to="/bookings/create" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors">
            <i className="ri-add-circle-line mr-2"></i>
            Tạo Booking mới
          </Link>
        </div>
      </div>

      {/* STATS CARDS (4 Cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Doanh thu hôm nay</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">32.500.000đ</h3>
            </div>
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <i className="ri-money-dollar-circle-line text-xl"></i>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <i className="ri-arrow-up-line mr-1"></i> 12.5%
            </span>
            <span className="text-slate-400 ml-2">so với hôm qua</span>
          </div>
        </div>

        {/* Card 2: New Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Booking mới</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">18</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <i className="ri-ticket-2-line text-xl"></i>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-amber-500 font-medium">8 chờ xác nhận</span>
            <span className="text-slate-400 ml-2">cần xử lý ngay</span>
          </div>
        </div>

        {/* Card 3: Active Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Tour đang chạy</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">6</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-500 rounded-xl">
              <i className="ri-bus-line text-xl"></i>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-slate-600 font-medium">142 khách</span>
            <span className="text-slate-400 ml-2">đang được phục vụ</span>
          </div>
        </div>

        {/* Card 4: Issues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-full bg-red-500/5 skew-x-12 -mr-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Sự cố / Cảnh báo</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">2</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <i className="ri-alarm-warning-line text-xl"></i>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <Link to="/reports" className="text-red-500 hover:underline font-medium">Xem chi tiết báo cáo →</Link>
          </div>
        </div>
      </div>

      {/* GRID CONTENT (Chart + List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái (Chiếm 2 phần): Danh sách Booking mới nhất */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="ri-file-list-3-line text-primary"></i>
              Booking gần đây
            </h2>
            <Link to="/bookings" className="text-sm text-primary font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Mã</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Tour đăng ký</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-primary">#BK-9088</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-700">Nguyễn Văn A</div>
                    <div className="text-xs text-slate-400">0905.123.456</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 truncate max-w-[200px]">Hà Giang Mùa Hoa Tam Giác Mạch 3N2Đ</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Chờ xác nhận
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800 text-right">4.500.000đ</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-primary">#BK-9087</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-700">Trần Thị B</div>
                    <div className="text-xs text-slate-400">tranthib@gmail.com</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 truncate max-w-[200px]">Đà Nẵng - Hội An - Bà Nà Hills</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Đã thanh toán
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800 text-right">7.200.000đ</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-primary">#BK-9086</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-700">Lê Minh C</div>
                    <div className="text-xs text-slate-400">0912.xxx.xxx</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 truncate max-w-[200px]">Phú Quốc Nghỉ Dưỡng 4N3Đ Resort 5*</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Đã cọc
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800 text-right">12.000.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Phải (Chiếm 1 phần): Tour sắp chạy & HDV */}
        <div className="space-y-6">
          {/* Widget: Tour sắp khởi hành */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="ri-calendar-todo-line text-primary"></i>
              Sắp khởi hành
            </h2>
            <div className="space-y-4">
              {/* Tour Item */}
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg w-14 h-14 shadow-sm flex-shrink-0">
                  <span className="text-xs font-bold text-red-500 uppercase">Thg 11</span>
                  <span className="text-xl font-bold text-slate-800 leading-none">26</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">Hạ Long Du Thuyền 5 Sao</h4>
                  <div className="mt-1 flex items-center text-xs text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><i className="ri-group-line"></i> 18/20</span>
                    <span className="flex items-center gap-1 text-green-600"><i className="ri-check-double-line"></i> Đủ đk</span>
                  </div>
                </div>
              </div>
              {/* Tour Item (Cảnh báo) */}
              <div className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex flex-col items-center justify-center bg-white border border-red-200 rounded-lg w-14 h-14 shadow-sm flex-shrink-0">
                  <span className="text-xs font-bold text-red-500 uppercase">Thg 11</span>
                  <span className="text-xl font-bold text-slate-800 leading-none">28</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">Khám Phá Côn Đảo Linh Thiêng</h4>
                  <div className="mt-1 flex items-center text-xs text-red-600 gap-3 font-medium">
                    <span className="flex items-center gap-1"><i className="ri-alarm-warning-line"></i> Thiếu HDV</span>
                    <span className="flex items-center gap-1"><i className="ri-group-line"></i> 5/15</span>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/schedule" className="block w-full mt-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center">
              Xem lịch trình chi tiết
            </Link>
          </div>

          {/* Widget: Trạng thái HDV */}
          <div className="bg-midnight text-slate-300 rounded-2xl shadow-sm p-5 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

            <h2 className="font-bold text-white mb-4 flex items-center gap-2 relative">
              <i className="ri-team-fill"></i>
              Nhân sự hôm nay
            </h2>
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center">
                <span>Đang dẫn tour</span>
                <span className="font-bold text-white bg-primary/30 px-2 py-0.5 rounded">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sẵn sàng (Standby)</span>
                <span className="font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Nghỉ phép</span>
                <span className="font-bold text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* END GRID */}

    </div>
  );
}