import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Đây là component UI có thể tái sử dụng cho 1 thẻ Tour.
 * Nó nhận 'props' (dữ liệu) từ component cha (TourList.jsx).
 */
export default function TourCard({ tour }) {
  // Định dạng lại giá
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price);

  // Map trạng thái sang màu sắc Tailwind
  const statusColors = {
    'Đang mở bán': 'bg-green-500',
    'Sắp hết chỗ': 'bg-amber-500',
    'Bản nháp': 'bg-slate-500',
    'Đã đóng': 'bg-red-500',
  };

  // Map danh mục sang màu sắc
  const categoryColors = {
    'Du lịch Biển': 'text-blue-600 bg-blue-50',
    'Núi rừng': 'text-green-600 bg-green-50',
    'Nghỉ dưỡng': 'text-purple-600 bg-purple-50',
    'Du lịch sinh thái': 'text-emerald-600 bg-emerald-50',
    'Du lịch văn hóa': 'text-orange-600 bg-orange-50',
    'Chưa phân loại': 'text-slate-600 bg-slate-100',
  };
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={tour.imageUrl || 'https://i.imgur.com/g0P3YfQ.jpeg'} 
          alt={tour.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {tour.status && (
          <span className={`absolute top-3 right-3 ${statusColors[tour.status] || 'bg-gray-500'} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {tour.status}
          </span>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium ${categoryColors[tour.category] || 'text-gray-600 bg-gray-100'} px-2 py-0.5 rounded`}>
            {tour.category || 'Khác'}
          </span>
          <span className="text-xs text-slate-400 flex items-center">
            <i className="ri-time-line mr-1"></i> {tour.duration}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          <Link to={`/tours/${tour.id}`}>
            {tour.title}
          </Link>
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
          {tour.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-xs text-slate-400">Giá từ</p>
            <p className="text-lg font-bold text-primary">{formattedPrice}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Chỉnh sửa">
              <i className="ri-edit-line"></i>
            </button>
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Xóa">
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}