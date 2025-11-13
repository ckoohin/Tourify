import React from 'react';
import { Link } from 'react-router-dom';
// SỬA LỖI: Cập nhật đường dẫn import. 
// Đường dẫn này giả định file TourList.jsx của bạn nằm trong 'src/pages/tour/'
// và file TourCard.jsx nằm trong 'src/components/ui/'
import TourCard from '../../components/ui/TourCard.jsx'; // Import component UI

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
// (Sau này bạn sẽ thay thế bằng cách gọi API)
const tourData = [
  {
    id: 1,
    title: 'Hạ Long Du Thuyền 5 Sao - Khám Phá Kỳ Quan',
    description: 'Trải nghiệm du thuyền đẳng cấp, thăm hang Sửng Sốt, đảo Titop và chèo kayak...',
    imageUrl: 'https://i.imgur.com/A5a2v1C.jpeg',
    price: 3590000,
    duration: '3N2Đ',
    category: 'Du lịch Biển',
    status: 'Đang mở bán',
  },
  {
    id: 2,
    title: 'Sapa - Fansipan - Bản Cát Cát Mùa Lúa Chín',
    description: 'Chinh phục nóc nhà Đông Dương, thưởng thức đặc sản Tây Bắc...',
    imageUrl: 'https://i.imgur.com/0aJ8Z1a.jpeg',
    price: 2850000,
    duration: '4N3Đ',
    category: 'Núi rừng',
    status: 'Sắp hết chỗ',
  },
  {
    id: 3,
    title: 'Ninh Bình: Tràng An - Bái Đính - Hang Múa',
    description: 'Khám phá di sản văn hóa và thiên nhiên thế giới, check-in "Vạn Lý Trường Thành"...',
    imageUrl: 'https://i.imgur.com/9qR7Z8o.jpeg',
    price: 1990000,
    duration: '2N1Đ',
    category: 'Du lịch sinh thái',
    status: 'Đang mở bán',
  },
  {
    id: 4,
    title: 'Đà Nẵng - Hội An - Bà Nà Hills: Con Đường Di Sản',
    description: 'Thưởng ngoạn vẻ đẹp phố cổ, vui chơi tại Bà Nà Hills và tắm biển Mỹ Khê...',
    imageUrl: 'https://i.imgur.com/L8a5X9o.jpeg',
    price: 4590000,
    duration: '4N3Đ',
    category: 'Nghỉ dưỡng',
    status: 'Đang mở bán',
  },
  {
    id: 5,
    title: 'Phú Quốc - Thiên Đường Đảo Ngọc',
    description: 'Lặn ngắm san hô, khám phá Grand World và thưởng thức hải sản tươi ngon...',
    imageUrl: 'https://i.imgur.com/6bJ9Z8o.jpeg',
    price: 5290000,
    duration: '3N2Đ',
    category: 'Du lịch Biển',
    status: 'Đang mở bán',
  },
  {
    id: 6,
    title: 'Đà Lạt - Thành Phố Ngàn Hoa Mộng Mơ',
    description: 'Check-in các quán cafe view đẹp, tham quan vườn hoa và tận hưởng không khí se lạnh...',
    imageUrl: 'https://i.imgur.com/2e1Z09o.jpeg',
    price: 2690000,
    duration: '3N2Đ',
    category: 'Nghỉ dưỡng',
    status: 'Đang mở bán',
  },
  {
    id: 7,
    title: 'Miền Tây Sông Nước: Mỹ Tho - Cần Thơ',
    description: 'Tham quan chợ nổi Cái Răng, vườn trái cây và thưởng thức đờn ca tài tử...',
    imageUrl: 'https://i.imgur.com/8c7Z98o.jpeg',
    price: 1490000,
    duration: '2N1Đ',
    category: 'Du lịch văn hóa',
    status: 'Đang mở bán',
  },
  {
    id: 8,
    title: '[DRAFT] Tour Khám Phá Hang Sơn Đoòng 2026',
    description: 'Nội dung đang được cập nhật...',
    imageUrl: 'https://i.imgur.com/g0P3YfQ.jpeg', // Ảnh placeholder
    price: 0,
    duration: '--',
    category: 'Chưa phân loại',
    status: 'Bản nháp',
  },
];
// --- KẾT THÚC MOCK DATA ---


export default function TourList() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tour</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tất cả các tour du lịch hiện có trên hệ thống.</p>
        </div>
        <Link 
          to="/tours/create" 
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <i className="ri-add-line mr-2 text-lg"></i>
          Thêm Tour mới
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 focus-within:border-primary transition-colors">
            <i className="ri-search-line text-slate-400"></i>
            <input type="text" placeholder="Tên tour, mã tour..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700" />
          </div>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer">
            <option selected>Tất cả danh mục</option>
            <option value="beach">Du lịch Biển</option>
            <option value="mountain">Du lịch Núi</option>
            <option value="city">City Tour</option>
            <option value="resort">Nghỉ dưỡng</option>
            <option value="ecotourism">Du lịch sinh thái</option>
            <option value="cultural">Du lịch văn hóa</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 cursor-pointer">
            <option selected>Tất cả trạng thái</option>
            <option value="active">Đang mở bán</option>
            <option value="closed">Đã đóng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button className="p-2 bg-white text-primary rounded-md shadow-sm transition-all"><i className="ri-layout-grid-fill"></i></button>
          <button className="p-2 text-slate-500 hover:text-slate-700 rounded-md transition-all"><i className="ri-list-check"></i></button>
        </div>
      </div>

      {/* TOUR GRID LIST (Dùng .map() để render) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tourData.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">8</span> trong tổng số <span className="font-medium text-slate-800">28</span> tours
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
          <button className="px-3 py-1 bg-primary text-white rounded-md">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">2</button>
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">3</button>
          <span className="px-2 py-1 text-slate-500">...</span>
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">4</button>
          <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">Sau</button>
        </div>
      </div>
    </div>
  );
}