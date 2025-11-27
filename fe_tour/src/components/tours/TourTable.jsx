import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, MapPin, Clock, Users, Tag, Edit, Image as ImageIcon } from 'lucide-react'; 
import StatusBadge from '../ui/StatusBadge';

const TourTable = ({ tours, onDelete, onEdit }) => {

  // --- LOGIC XỬ LÝ DỮ LIỆU (Giữ nguyên từ TourCard) ---
  
  const getDisplayImage = (tour) => {
    if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
        const featured = tour.images.find(img => img.is_featured);
        return featured ? featured.url : tour.images[0].url;
    }
    return 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';
  };

  const getDisplayPrice = (tour) => {
    if (!tour.versions || !Array.isArray(tour.versions) || tour.versions.length === 0) {
        return <span className="text-slate-400 italic text-xs">Đang cập nhật</span>;
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

    if (minPrice === Infinity) return <span className="text-blue-600 font-medium text-xs">Liên hệ</span>;
    
    return (
        <span className="text-orange-600 font-bold text-sm">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)}
        </span>
    );
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* --- HEADER --- */}
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Ảnh</th>
              <th className="px-4 py-3 max-w-[250px]">Thông tin Tour</th>
              <th className="px-4 py-3">Mã & Danh mục</th>
              <th className="px-4 py-3">Lịch trình & Thời gian</th>
              <th className="px-4 py-3">Giá & Nhóm</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-slate-100">
            {tours.length === 0 ? (
                <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Chưa có dữ liệu tour.
                    </td>
                </tr>
            ) : (
                tours.map((tour) => {
                    const statusConfig = getStatusConfig(tour.status);
                    const displayImage = getDisplayImage(tour);

                    const durationText = (tour.duration_days || tour.duration_nights) 
                        ? `${tour.duration_days || 0}N ${tour.duration_nights || 0}Đ` 
                        : '---';

                    const groupSizeText = (tour.min_group_size || tour.max_group_size)
                        ? `${tour.min_group_size || 0} - ${tour.max_group_size || '∞'}`
                        : '---';

                    const routeText = (tour.departure_location && tour.destination)
                        ? `${tour.departure_location} → ${tour.destination}`
                        : (tour.destination || tour.departure_location || 'Chưa cập nhật');

                    return (
                        <tr key={tour.id} className="bg-white hover:bg-slate-50 transition-colors group">
                            {/* 1. Hình ảnh */}
                            <td className="px-4 py-3 text-center">
                                <Link to={`/tours/${tour.id}`} className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 mx-auto relative group-hover:shadow-md transition-all">
                                    <img 
                                        src={displayImage} 
                                        alt={tour.code} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {e.target.src = 'https://placehold.co/100x100?text=Error'}}
                                    />
                                </Link>
                            </td>

                            {/* 2. Tên Tour */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <Link 
                                        to={`/tours/${tour.id}`} 
                                        className="font-bold text-slate-800 hover:text-blue-600 line-clamp-2 transition-colors"
                                        title={tour.name}
                                    >
                                        {tour.name}
                                    </Link>
                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                        <Clock size={12} />
                                        <span>Cập nhật: {new Date(tour.updated_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </td>

                            {/* 3. Mã & Danh mục */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col items-start gap-1.5">
                                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {tour.code || '---'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 max-w-full truncate">
                                        <Tag size={10} /> {tour.category_name || 'Chưa phân loại'}
                                    </span>
                                </div>
                            </td>

                            {/* 4. Lịch trình */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                                    <div className="flex items-center gap-1.5" title="Hành trình">
                                        <MapPin size={14} className="text-red-500 shrink-0"/>
                                        <span className="truncate max-w-[150px]">{routeText}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Thời lượng">
                                        <Clock size={14} className="text-blue-500 shrink-0"/>
                                        <span className="font-medium">{durationText}</span>
                                    </div>
                                </div>
                            </td>

                            {/* 5. Giá & Quy mô */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <div>{getDisplayPrice(tour)}</div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500" title="Quy mô nhóm">
                                        <Users size={12} className="text-slate-400"/>
                                        <span>{groupSizeText} khách</span>
                                    </div>
                                </div>
                            </td>

                            {/* 6. Trạng thái */}
                            <td className="px-4 py-3 text-center">
                                <StatusBadge level={statusConfig.level} text={statusConfig.text} />
                            </td>

                            {/* 7. Hành động */}
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => onEdit && onEdit(tour)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete && onDelete(tour.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="Xóa tour"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourTable;