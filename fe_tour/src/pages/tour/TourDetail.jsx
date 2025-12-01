import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, MapPin, Clock, Users, 
  Tag, CheckCircle, XCircle, Globe, Image as ImageIcon 
} from 'lucide-react';

import tourService from '../../services/api/tourService';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourService.getTourById(id);
        if (res.success) {
          const data = Array.isArray(res.data.tour) ? res.data.tour[0] : res.data.tour;
          setTour(data);
        }
      } catch (error) {
        console.error("Error fetching tour details:", error);
        alert("Không thể tải thông tin tour.");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-500">Đang tải dữ liệu...</div>;
  if (!tour) return <div className="flex justify-center items-center h-screen text-slate-500">Không tìm thấy tour.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button 
            onClick={() => navigate('/tours')} 
            className="flex items-center text-slate-500 hover:text-blue-600 mb-2 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{tour.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-sm font-mono font-bold">
              {tour.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
              tour.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {tour.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
              {tour.status === 'active' ? 'Đang mở bán' : 'Bản nháp'}
            </span>
          </div>
        </div>
        <Link 
          to={`/tours/${tour.id}/edit`} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md font-medium"
        >
          <Edit size={18}/> Chỉnh sửa Tour
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Images & Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Images Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-100 relative">
              {tour.images && tour.images.length > 0 ? (
                <img 
                  src={tour.images[0].url} 
                  alt={tour.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ImageIcon size={48} className="mb-2 opacity-50"/>
                    <span>Chưa có hình ảnh</span>
                </div>
              )}
            </div>
            {/* Thumbnail list */}
            {tour.images && tour.images.length > 1 && (
              <div className="p-4 flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 pb-2">
                {tour.images.map((img) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    className="w-24 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 border border-slate-200 shrink-0" 
                    alt="Thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">Giới thiệu</h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line mb-8">
              {tour.description || "Chưa có mô tả."}
            </div>
            
            {tour.highlights && (
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Tag size={18}/> Điểm nổi bật
                </h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                    {tour.highlights.split('\n').map((line, idx) => (
                        line.trim() && <li key={idx}>{line}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Versions & Prices Table */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Bảng giá & Phiên bản</h2>
            {(!tour.versions || tour.versions.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500">Chưa có phiên bản giá nào được tạo.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tour.versions.map((ver) => (
                  <div key={ver.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-200">
                      <span className="font-bold text-slate-700">{ver.name}</span>
                      <span className="text-xs bg-white border border-slate-300 px-2 py-1 rounded uppercase font-bold text-slate-500 tracking-wide">
                        {ver.type}
                      </span>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3 font-medium">Đối tượng</th>
                          <th className="px-5 py-3 font-medium">Giá (VND)</th>
                          <th className="px-5 py-3 font-medium text-right">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {ver.prices && ver.prices.length > 0 ? (
                          ver.prices.map((price) => (
                            <tr key={price.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3 capitalize font-medium text-slate-700">
                                {price.price_type === 'adult' ? 'Người lớn' : 
                                 price.price_type === 'child' ? 'Trẻ em' : 
                                 price.price_type === 'infant' ? 'Em bé' : price.price_type}
                              </td>
                              <td className="px-5 py-3 font-bold text-blue-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price.price)}
                              </td>
                              <td className="px-5 py-3 text-right text-slate-500">
                                {price.min_pax || 1} - {price.max_pax || '∞'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="px-5 py-4 text-center text-slate-400 italic">Chưa cập nhật giá</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-5">Thông tin hành trình</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Clock size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-700">Thời lượng</span>
                  <span className="text-slate-600">{tour.duration_days} Ngày / {tour.duration_nights} Đêm</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                    <MapPin size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-700">Điểm khởi hành</span>
                  <span className="text-slate-600">{tour.departure_location || "Chưa cập nhật"}</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <Globe size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-700">Điểm đến</span>
                  <span className="text-slate-600">{tour.destination || "Chưa cập nhật"}</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                    <Users size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-700">Quy mô nhóm</span>
                  <span className="text-slate-600">{tour.min_group_size} - {tour.max_group_size} khách</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-5">Cài đặt khác</h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between items-center py-2 border-b border-slate-100">
                 <span className="text-slate-500">Thiết kế riêng (Custom)</span>
                 <span className={`font-bold ${tour.is_customizable ? 'text-green-600' : 'text-slate-400'}`}>
                   {tour.is_customizable ? 'Có' : 'Không'}
                 </span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-slate-100">
                 <span className="text-slate-500">Danh mục ID</span>
                 <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{tour.category_id}</span>
               </div>
               <div className="pt-2">
                   <span className="text-slate-500 block mb-1">Link Booking:</span>
                   <a href="#" className="text-blue-600 hover:underline truncate block">{tour.booking_url || "Chưa có link"}</a>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;