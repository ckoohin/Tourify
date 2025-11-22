import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, MapPin, Clock, Users, Eye } from 'lucide-react';
// Import Component StatusBadge
import StatusBadge from '../ui/StatusBadge'; 

const TourCard = ({ tour, onDelete }) => {
  const mainImage = tour.images && tour.images.length > 0 
    ? tour.images[0].url 
    : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';

  const getDisplayPrice = () => {
    if (!tour.versions || tour.versions.length === 0) return 'Chưa cập nhật';
    let minPrice = Infinity;
    tour.versions.forEach(ver => {
      if (ver.prices) {
        ver.prices.forEach(p => {
          if (Number(p.price) < minPrice) minPrice = Number(p.price);
        });
      }
    });
    if (minPrice === Infinity) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice);
  };

  // Hàm helper để map trạng thái tour sang props của StatusBadge
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { level: 'success', text: 'Mở bán' };
      case 'draft':
        return { level: 'warning', text: 'Nháp' }; // Dùng warning cho nháp để dễ nhìn
      case 'inactive':
        return { level: 'danger', text: 'Ngừng KD' };
      case 'archived':
        return { level: 'info', text: 'Lưu trữ' };
      default:
        return { level: 'info', text: 'Khác' };
    }
  };

  const statusConfig = getStatusConfig(tour.status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
      
      {/* 1. Image Section */}
      <Link to={`/tours/${tour.id}`} className="relative aspect-[4/3] overflow-hidden block cursor-pointer">
        <img 
          src={mainImage} 
          alt={tour.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {e.target.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Error'}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* --- SỬ DỤNG STATUS BADGE TẠI ĐÂY --- */}
        <div className="absolute top-3 right-3">
          <StatusBadge 
            level={statusConfig.level} 
            text={statusConfig.text} 
            className="shadow-sm backdrop-blur-md bg-opacity-90" // Thêm class tùy chỉnh nếu cần
          />
        </div>

        {/* Code Badge */}
        <div className="absolute top-3 left-3">
           <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-mono font-bold px-2 py-1 rounded shadow-sm">
             {tour.code}
           </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 text-white">
           <p className="text-xs opacity-90 font-light">Giá từ</p>
           <p className="text-lg font-bold text-yellow-400">{getDisplayPrice()}</p>
        </div>
      </Link>

      {/* 2. Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          <Link to={`/tours/${tour.id}`}>{tour.name}</Link>
        </h3>

        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-blue-500"/>
            <span>{tour.duration_days}N{tour.duration_nights}Đ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-blue-500"/>
            <span>{tour.min_group_size} - {tour.max_group_size} khách</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
             <MapPin size={14} className="text-red-500 shrink-0"/>
             <span className="truncate">{tour.departure_location} → {tour.destination}</span>
          </div>
        </div>

        <div className="flex-1"></div>

        {/* 3. Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-3">
             <Link 
              to={`/tours/${tour.id}`} 
              className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <Eye size={16} /> Xem
            </Link>
            
            <Link 
              to={`/tours/edit/${tour.id}`} 
              className="text-sm font-medium text-slate-600 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              <Edit size={16} /> Sửa
            </Link>
          </div>
          
          <button 
            onClick={() => onDelete(tour.id)}
            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
            title="Xóa tour"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;