import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, MapPin, Clock, Users, 
  Calendar, Tag, CheckCircle, XCircle, Globe 
} from 'lucide-react';
import tourService from '../../services/api/tourService';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourService.getTourById(id);
        if (res.success) {
          // Backend controller của bạn đã group versions và images vào object tour
          // Nếu trả về mảng 1 phần tử thì lấy phần tử đầu
          const data = Array.isArray(res.data.tour) ? res.data.tour[0] : res.data.tour;
          setTour(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!tour) return <div className="p-10 text-center">Không tìm thấy tour.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button 
            onClick={() => navigate('/tours')} 
            className="flex items-center text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-slate-800">{tour.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
              {tour.code}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
              tour.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {tour.status === 'active' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
              {tour.status}
            </span>
          </div>
        </div>
        <Link 
          to={`/tours/edit/${tour.id}`} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Edit size={18}/> Chỉnh sửa
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Images & Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Images Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-100 relative">
              {tour.images && tour.images.length > 0 ? (
                <img 
                  src={tour.images[0].url} 
                  alt={tour.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Chưa có hình ảnh</div>
              )}
            </div>
            {/* Thumbnail list */}
            {tour.images && tour.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {tour.images.map((img) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    className="w-20 h-14 object-cover rounded cursor-pointer hover:opacity-80 border border-slate-200" 
                    alt="Thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Giới thiệu & Điểm nổi bật</h2>
            <div className="prose max-w-none text-slate-600 mb-6">
              <p>{tour.description}</p>
            </div>
            {tour.highlights && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Tag size={16}/> Điểm nổi bật
                </h3>
                <p className="text-sm text-blue-700 whitespace-pre-line">{tour.highlights}</p>
              </div>
            )}
          </div>

          {/* Versions & Prices Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Bảng giá & Phiên bản</h2>
            {(!tour.versions || tour.versions.length === 0) ? (
              <p className="text-slate-500 italic">Chưa có phiên bản nào.</p>
            ) : (
              <div className="space-y-6">
                {tour.versions.map((ver) => (
                  <div key={ver.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b border-slate-200">
                      <span className="font-semibold text-slate-700">{ver.name}</span>
                      <span className="text-xs bg-white border px-2 py-1 rounded text-slate-500 uppercase">{ver.type}</span>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 border-b">
                        <tr>
                          <th className="px-4 py-2">Đối tượng</th>
                          <th className="px-4 py-2">Giá</th>
                          <th className="px-4 py-2">Số lượng (Min-Max)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ver.prices && ver.prices.length > 0 ? (
                          ver.prices.map((price) => (
                            <tr key={price.id}>
                              <td className="px-4 py-2 capitalize">{price.price_type || 'Người lớn'}</td>
                              <td className="px-4 py-2 font-medium text-blue-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price.price)}
                              </td>
                              <td className="px-4 py-2 text-slate-500">{price.min_pax || 1} - {price.max_pax || 99}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="px-4 py-2 text-center text-slate-400">Chưa cập nhật giá</td></tr>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Thông tin hành trình</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5"/>
                <div>
                  <span className="block font-medium text-slate-700">Thời lượng</span>
                  <span className="text-slate-500">{tour.duration_days} Ngày / {tour.duration_nights} Đêm</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5"/>
                <div>
                  <span className="block font-medium text-slate-700">Điểm khởi hành</span>
                  <span className="text-slate-500">{tour.departure_location}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-slate-400 mt-0.5"/>
                <div>
                  <span className="block font-medium text-slate-700">Điểm đến</span>
                  <span className="text-slate-500">{tour.destination}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-slate-400 mt-0.5"/>
                <div>
                  <span className="block font-medium text-slate-700">Quy mô nhóm</span>
                  <span className="text-slate-500">{tour.min_group_size} - {tour.max_group_size} khách</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Cài đặt khác</h3>
            <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-500">Customizable</span>
                 <span className={tour.is_customizable ? 'text-green-600 font-medium' : 'text-slate-400'}>
                   {tour.is_customizable ? 'Có' : 'Không'}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500">Danh mục ID</span>
                 <span className="text-slate-700">{tour.category_id}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;