import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, MapPin, Clock, Users, Eye, Tag } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const TourCard = ({ tour, onDelete }) => {
  let displayImage = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';
  
  if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
      const featured = tour.images.find(img => img.is_featured);
      displayImage = featured ? featured.url : tour.images[0].url;
  }

  const getDisplayPrice = () => {
    if (!tour.versions || !Array.isArray(tour.versions) || tour.versions.length === 0) {
        return 'Đang cập nhật';
    }

    let minPrice = Infinity;
    tour.versions.forEach(ver => {
      if (ver.prices && Array.isArray(ver.prices)) {
        ver.prices.forEach(p => {
          const price = Number(p.price);
          if (price > 0 && price < minPrice) minPrice = price;
        });
      }
    });

    if (minPrice === Infinity) return 'Liên hệ';
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active': return { level: 'success', text: 'Mở bán' };
      case 'draft': return { level: 'warning', text: 'Nháp' };
      case 'inactive': return { level: 'danger', text: 'Ngừng' };
      case 'archived': return { level: 'info', text: 'Lưu trữ' };
      default: return { level: 'info', text: 'Khác' };
    }
  };
  
  const statusConfig = getStatusConfig(tour.status);

  const durationText = (tour.duration_days || tour.duration_nights) 
    ? `${tour.duration_days || 0}N ${tour.duration_nights || 0}Đ` 
    : '---';

  const groupSizeText = (tour.min_group_size || tour.max_group_size)
    ? `${tour.min_group_size || 0} - ${tour.max_group_size || '∞'} khách`
    : '---';

  const routeText = (tour.departure_location && tour.destination)
    ? `${tour.departure_location} → ${tour.destination}`
    : (tour.destination || tour.departure_location || 'Chưa cập nhật lịch trình');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
      
      <Link to={`/tours/${tour.id}`} className="relative aspect-[4/3] overflow-hidden block cursor-pointer">
        <img 
          src={displayImage} 
          alt={tour.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {e.target.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Error'}}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80"></div>

        <div className="absolute top-3 right-3">
          <StatusBadge level={statusConfig.level} text={statusConfig.text} className="shadow-sm backdrop-blur-md bg-white/90" />
        </div>

        <div className="absolute top-3 left-3">
           <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-mono font-bold px-2 py-1 rounded shadow-sm border border-slate-200">
             {tour.code || 'NO-CODE'}
           </span>
        </div>

        <div className="absolute bottom-3 left-3 text-white">
           <p className="text-[10px] opacity-90 font-light uppercase tracking-wider">Giá từ</p>
           <p className="text-lg font-bold text-yellow-400 shadow-black drop-shadow-md leading-none">
             {getDisplayPrice()}
           </p>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        
        {/* Tên Danh mục */}
        <div className="mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-full">
                <Tag size={10} /> {tour.category_name || 'Chưa phân loại'}
            </span>
        </div>

        {/* Tên Tour */}
        <h3 className="font-bold text-base text-slate-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors min-h-[3rem]" title={tour.name}>
          <Link to={`/tours/${tour.id}`}>{tour.name || 'Tên tour đang cập nhật...'}</Link>
        </h3>

        {/* Grid thông tin chi tiết (Icon + Text) */}
        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4">
          {/* Thời lượng */}
          <div className="flex items-center gap-1.5" title="Thời lượng">
            <Clock size={14} className="text-blue-500 shrink-0"/>
            <span className="truncate">{durationText}</span>
          </div>
          
          {/* Số lượng khách */}
          <div className="flex items-center gap-1.5" title="Quy mô nhóm">
            <Users size={14} className="text-blue-500 shrink-0"/>
            <span className="truncate">{groupSizeText}</span>
          </div>
          
          <div className="col-span-2 flex items-center gap-1.5" title="Hành trình">
             <MapPin size={14} className="text-red-500 shrink-0"/>
             <span className="truncate">{routeText}</span>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <Link 
            to={`/tours/${tour.id}`} 
            className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors py-1"
          >
            <Eye size={16} /> Xem chi tiết
          </Link>
          
          <button 
            onClick={(e) => {
              e.preventDefault(); 
              onDelete(tour.id);
            }}
            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
            title="Xóa tour này"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;