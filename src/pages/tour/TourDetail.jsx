import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// --- DỮ LIỆU GIẢ (MOCK DATA) CHO 1 TOUR CHI TIẾT ---
// Sau này, bạn sẽ dùng useParams() để lấy ID và gọi API
const mockTour = {
  id: 1,
  title: 'Hạ Long Du Thuyền 5 Sao - Khám Phá Kỳ Quan',
  code: "HL-ST5",
  price: 3590000,
  duration: '3N2Đ',
  category: 'Du lịch Biển',
  status: 'Đang mở bán',
  imageUrl: 'https://i.imgur.com/A5a2v1C.jpeg',
  gallery: [
    'https://i.imgur.com/A5a2v1C.jpeg',
    'https://i.imgur.com/g0P3YfQ.jpeg',
    'https://i.imgur.com/0aJ8Z1a.jpeg',
    'https://i.imgur.com/9qR7Z8o.jpeg',
  ],
  description: 'Trải nghiệm du thuyền đẳng cấp 5 sao trên Vịnh Hạ Long, một trong bảy kỳ quan thiên nhiên thế giới. Tour bao gồm các hoạt động thăm hang Sửng Sốt, chèo kayak tại hang Luồn, tắm biển tại đảo Titop và thưởng thức ẩm thực cao cấp trên du thuyền. Đây là lựa chọn hoàn hảo cho kỳ nghỉ ngắn ngày, kết hợp giữa thư giãn và khám phá.',
  itinerary: [
    {
      day: 1,
      title: 'Hà Nội - Vịnh Hạ Long - Hang Sửng Sốt',
      details: [
        '**08:00:** Xe đón quý khách tại Nhà hát Lớn Hà Nội, khởi hành đi Hạ Long.',
        '**12:00:** Tới cảng Tuần Châu, làm thủ tục lên du thuyền. Thưởng thức đồ uống chào mừng.',
        '**13:00:** Ăn trưa trên du thuyền trong khi tàu di chuyển ra vịnh.',
        '**15:00:** Thăm hang Sửng Sốt - một trong những hang động đẹp nhất Vịnh Hạ Long.',
        '**17:00:** Tàu dừng tại điểm nghỉ đêm. Tự do bơi lội hoặc chèo kayak.',
        '**19:00:** Ăn tối. Buổi tối tự do (câu mực, hát karaoke...).',
      ]
    },
    {
      day: 2,
      title: 'Hang Luồn - Đảo Titop - Lớp học nấu ăn',
      details: [
        '**06:30:** Tham gia lớp học Thái Cực Quyền (Taichi) trên sundeck.',
        '**07:30:** Ăn sáng nhẹ.',
        '**08:30:** Khám phá Hang Luồn (bằng thuyền kayak hoặc thuyền nan).',
        '**10:00:** Leo 400 bậc thang lên đỉnh đảo Titop để ngắm toàn cảnh Vịnh.',
        '**11:00:** Tham gia lớp học nấu ăn (cooking class) trên tàu.',
        '**12:30:** Ăn trưa.',
        '**14:00:** Tàu di chuyển đến khu vực Làng chài Cửa Vạn.',
        '**19:00:** Ăn tối BBQ hải sản.',
      ]
    },
     {
      day: 3,
      title: 'Hạ Long - Hà Nội',
      details: [
        '**07:00:** Ăn sáng.',
        '**08:00:** Tự do thư giãn, ngắm cảnh hoặc sử dụng các dịch vụ trên du thuyền.',
        '**09:30:** Làm thủ tục trả phòng (check-out).',
        '**10:30:** Ăn trưa sớm (brunch) trong khi tàu quay về cảng.',
        '**12:00:** Tàu cập cảng Tuần Châu. Xe đón quý khách trở về Hà Nội.',
        '**16:00:** Về đến Hà Nội. Kết thúc chương trình.',
      ]
    },
  ],
  departures: [
    { id: 'HL001-241125', date: '24/11/2025', slots: '20/20 (Đầy)', guide: 'Nguyễn Tuấn Anh', status: 'Đang chạy' },
    { id: 'HL001-261125', date: '26/11/2025', slots: '18/20', guide: 'Trần Thị Mai', status: 'Sắp khởi hành' },
    { id: 'HL001-301125', date: '30/11/2025', slots: '5/20', guide: 'Chưa phân công', status: 'Sắp khởi hành' },
  ],
  bookings: [
    { id: '#BK-9080', customer: 'Lê Minh C', date: '20/11/2025', amount: '7.180.000đ', status: 'Đã thanh toán' },
    { id: '#BK-9081', customer: 'Phạm Thị D', date: '21/11/2025', amount: '3.590.000đ', status: 'Đã cọc' },
    { id: '#BK-9082', customer: 'Vũ Văn E', date: '22/11/2025', amount: '10.770.000đ', status: 'Chờ xử lý' },
  ]
};
// --- KẾT THÚC MOCK DATA ---


// Component con cho Tab Tổng quan
const OverviewTab = ({ tour }) => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái: Hình ảnh & Thông tin cơ bản */}
      <div className="lg:col-span-2 space-y-6">
        {/* Gallery */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Thư viện ảnh</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tour.gallery.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`Gallery ${index+1}`} 
                  className="w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
           </div>
        </div>
        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Mô tả chi tiết</h3>
           <div 
              className="prose prose-sm max-w-none text-slate-600"
              dangerouslySetInnerHTML={{ __html: tour.description.replace(/\n/g, '<br />') }} 
           />
        </div>
      </div>
      
      {/* Cột phải: Thẻ thông tin nhanh */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin Tour</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Mã Tour:</span>
                <span className="text-sm font-medium text-slate-800">{tour.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Thời gian:</span>
                <span className="text-sm font-medium text-slate-800">{tour.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Danh mục:</span>
                <span className="text-sm font-medium text-blue-600">{tour.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Trạng thái:</span>
                <span className="text-sm font-medium text-green-600">{tour.status}</span>
              </div>
              <div className="border-t border-slate-100 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Giá cơ bản:</span>
                <span className="text-xl font-bold text-primary">{formattedPrice}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <i className="ri-edit-line mr-2"></i> Chỉnh sửa thông tin
            </button>
        </div>
      </div>
    </div>
  );
};

// Component con cho Tab Lịch trình (Use Case: Quản lý lịch trình)
const ItineraryTab = ({ itinerary }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Lịch trình chi tiết (Day by Day)</h3>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <i className="ri-edit-line mr-2"></i> Chỉnh sửa lịch trình
        </button>
      </div>
      <div className="p-6 space-y-6">
        {itinerary.map((day, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex items-center justify-center w-12 h-12 bg-blue-100 text-primary font-bold rounded-full">
                {day.day}
              </span>
              {index < itinerary.length - 1 && <div className="w-px h-full bg-slate-200 my-2"></div>}
            </div>
            <div className="flex-1 pb-6">
              <h4 className="font-bold text-slate-800 text-md mb-2">{day.title}</h4>
              <div className="prose prose-sm max-w-none text-slate-600 space-y-2">
                {day.details.map((detail, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component con cho Tab Lịch khởi hành (Use Case: Quản lý lịch trình & HDV)
const DeparturesTab = ({ departures }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Lịch khởi hành của Tour này</h3>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <i className="ri-calendar-todo-line mr-2"></i> Thêm lịch khởi hành
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                    <th className="px-6 py-4">Ngày khởi hành</th>
                    <th className="px-6 py-4">Mã chuyến</th>
                    <th className="px-6 py-4">Số chỗ</th>
                    <th className="px-6 py-4">Hướng dẫn viên</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {departures.map(dep => (
                <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{dep.date}</td>
                  <td className="px-6 py-4 text-slate-600">{dep.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{dep.slots}</td>
                  <td className={`px-6 py-4 font-medium ${dep.guide === 'Chưa phân công' ? 'text-red-500' : 'text-slate-700'}`}>{dep.guide}</td>
                  <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${dep.status === 'Đang chạy' ? 'bg-blue-100 text-primary border-blue-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'}`
                        }
                      >
                          {dep.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                      <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors">Xem</button>
                      <button className="px-3 py-1 bg-white border border-slate-200 text-primary hover:bg-blue-50 text-xs font-medium rounded-md transition-colors">Gán HDV</button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// Component con cho Tab Bookings (Use Case: Xem thông tin khách hàng)
const BookingsTab = ({ bookings }) => {
   return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Danh sách Booking cho Tour này</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                    <th className="px-6 py-4">Mã Booking</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Ngày đặt</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bookings.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{book.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{book.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{book.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{book.amount}</td>
                  <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${book.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800 border-green-200' :
                          book.status === 'Đã cọc' ? 'bg-blue-100 text-primary border-blue-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'}`
                        }
                      >
                          {book.status}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};


// Component Cha: Trang TourDetail
export default function TourDetail() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dùng useParams() để lấy ID từ URL, ví dụ /tours/1
  // const { id } = useParams();
  // TODO: Dùng `id` này để gọi API lấy dữ liệu tour,
  // ở đây chúng ta dùng mockTour
  const tour = mockTour;

  const getTabClass = (tabName) => {
    return `px-4 py-2 font-medium text-sm rounded-lg cursor-pointer transition-colors
            ${activeTab === tabName 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/tours" className="text-slate-400 hover:text-primary">
              <i className="ri-arrow-left-s-line text-2xl"></i>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 line-clamp-1" title={tour.title}>
              {tour.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-10">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{tour.category}</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Mã: {tour.code}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 flex items-center transition-colors">
            <i className="ri-edit-line mr-2 text-lg"></i>
            Chỉnh sửa Tour
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <div onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
          <i className="ri-eye-line mr-2"></i>Tổng quan
        </div>
        <div onClick={() => setActiveTab('itinerary')} className={getTabClass('itinerary')}>
          <i className="ri-map-pin-time-line mr-2"></i>Lịch trình
        </div>
        <div onClick={() => setActiveTab('departures')} className={getTabClass('departures')}>
          <i className="ri-calendar-2-line mr-2"></i>Lịch khởi hành ({tour.departures.length})
        </div>
        <div onClick={() => setActiveTab('bookings')} className={getTabClass('bookings')}>
          <i className="ri-ticket-line mr-2"></i>Bookings ({tour.bookings.length})
        </div>
      </div>
      
      {/* TAB CONTENT */}
      <div>
        {activeTab === 'overview' && <OverviewTab tour={tour} />}
        {activeTab === 'itinerary' && <ItineraryTab itinerary={tour.itinerary} />}
        {activeTab === 'departures' && <DeparturesTab departures={tour.departures} />}
        {activeTab === 'bookings' && <BookingsTab bookings={tour.bookings} />}
      </div>

    </div>
  );
}