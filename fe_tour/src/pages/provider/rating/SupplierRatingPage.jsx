import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, CheckCircle, ArrowLeft, Building, 
  MapPin, Calendar, Users, AlertCircle, Filter, Search 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import services
import serviceBookingService from '../../../services/api/serviceBookingService';
import supplierRatingService from '../../../services/api/supplierRatingService';
import tourDepartureService from '../../../services/api/departureService'; 
import RatingModal from '../../../components/suppliers/ratings/RatingModal';

const SupplierRatingPage = () => {
  const { departureId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState(null);
  const [suppliers, setSuppliers] = useState([]); // List unique suppliers
  const [ratingsMap, setRatingsMap] = useState({}); // { supplierId: ratingScore }
  
  const [selectedSupplier, setSelectedSupplier] = useState(null); // Cho Modal
  const [filter, setFilter] = useState('all'); // all | pending | rated
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (departureId) fetchData();
  }, [departureId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Gọi song song các API cần thiết
      const [depRes, serviceRes, ratingRes] = await Promise.all([
        tourDepartureService.getById(departureId),
        serviceBookingService.getByDepartureId(departureId),
        supplierRatingService.getByTourDeparture(departureId)
      ]);

      // 2. Xử lý thông tin Tour
      if (depRes.data && depRes.data.success) {
          setDeparture(depRes.data.data);
      }

      // 3. Xử lý danh sách Nhà cung cấp từ Service Bookings
      if (serviceRes.data) {
         // API trả về list bookings, ta cần gom nhóm theo Supplier ID
         const bookings = serviceRes.data.data || serviceRes.data;
         const uniqueMap = new Map();
         
         bookings.forEach(bk => {
             // Chỉ lấy những booking đã confirm hoặc completed (đã sử dụng dịch vụ)
             if (bk.status === 'confirmed' || bk.status === 'completed') {
                 if (!uniqueMap.has(bk.supplier_id)) {
                     uniqueMap.set(bk.supplier_id, {
                         id: bk.supplier_id,
                         company_name: bk.supplier_name || bk.supplier?.company_name || 'N/A',
                         type: bk.supplier_type || bk.supplier?.type || 'Partner',
                         total_services: 0,
                         services_list: []
                     });
                 }
                 const sup = uniqueMap.get(bk.supplier_id);
                 sup.total_services += 1;
                 sup.services_list.push(bk.service_name || 'Dịch vụ'); // Giả sử có trường service_name
             }
         });
         setSuppliers(Array.from(uniqueMap.values()));
      }

      // 4. Xử lý trạng thái đánh giá cũ
      if (ratingRes.data && ratingRes.data.data && ratingRes.data.data.ratings) {
         const map = {};
         ratingRes.data.data.ratings.forEach(r => {
             // Nếu đã có đánh giá loại 'overall' thì coi như NCC này đã được đánh giá
             if (r.rating_type === 'overall') {
                 map[r.supplier_id] = Number(r.rating);
             }
         });
         setRatingsMap(map);
      }

    } catch (error) {
      console.error("Lỗi tải trang:", error);
      toast.error("Không thể tải dữ liệu tour");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và tìm kiếm
  const filteredSuppliers = suppliers.filter(sup => {
      const matchesSearch = sup.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const isRated = !!ratingsMap[sup.id];
      
      let matchesFilter = true;
      if (filter === 'rated') matchesFilter = isRated;
      if (filter === 'pending') matchesFilter = !isRated;

      return matchesSearch && matchesFilter;
  });

  // Tính toán tiến độ
  const progress = suppliers.length > 0 ? (Object.keys(ratingsMap).length / suppliers.length) * 100 : 0;

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-500 text-sm font-medium">Đang tải dữ liệu...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium mb-3 transition-colors">
                  <ArrowLeft size={16}/> Quay lại chi tiết Tour
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                      <h1 className="text-2xl font-bold text-slate-800">Đánh giá Chất lượng Dịch vụ</h1>
                      {departure && (
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 mt-2">
                              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100 font-bold">
                                  <MapPin size={14}/> {departure.departure_code}
                              </span>
                              <span className="flex items-center gap-1.5">
                                  <Calendar size={14}/> 
                                  {new Date(departure.departure_date).toLocaleDateString('vi-VN')} - {new Date(departure.return_date).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="flex items-center gap-1.5 hidden sm:flex">
                                  <Users size={14}/> {departure.confirmed_guests || 0} khách
                              </span>
                          </div>
                      )}
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full md:w-64">
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                          <span>Tiến độ hoàn thành</span>
                          <span className={progress === 100 ? "text-green-600" : "text-blue-600"}>
                              {Object.keys(ratingsMap).length}/{suppliers.length}
                          </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                              className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                          ></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          {/* Controls: Filter & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  {['all', 'pending', 'rated'].map(type => (
                      <button
                          key={type}
                          onClick={() => setFilter(type)}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                              filter === type 
                              ? 'bg-slate-800 text-white shadow' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                          {type === 'all' ? 'Tất cả' : type === 'pending' ? 'Chưa đánh giá' : 'Đã xong'}
                      </button>
                  ))}
              </div>

              <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                  <input 
                      type="text" 
                      placeholder="Tìm nhà cung cấp..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
              </div>
          </div>

          {/* Suppliers Grid */}
          {filteredSuppliers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Building size={32}/>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Không tìm thấy nhà cung cấp nào</h3>
                  <p className="text-slate-500 mt-1">Vui lòng kiểm tra lại bộ lọc hoặc danh sách booking.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSuppliers.map(sup => {
                      const ratedScore = ratingsMap[sup.id];
                      const isRated = !!ratedScore;

                      return (
                          <div 
                              key={sup.id} 
                              className={`
                                  group relative bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col
                                  ${isRated ? 'border-green-200' : 'border-slate-200 hover:border-blue-300'}
                              `}
                          >
                              {/* Status Badge */}
                              <div className="absolute top-4 right-4">
                                  {isRated ? (
                                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                                          <CheckCircle size={12}/> Hoàn thành
                                      </span>
                                  ) : (
                                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                                          <AlertCircle size={12}/> Chờ đánh giá
                                      </span>
                                  )}
                              </div>

                              {/* Supplier Info */}
                              <div className="mb-4 pr-16">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border mb-3 ${isRated ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                      {sup.company_name.charAt(0).toUpperCase()}
                                  </div>
                                  <h4 className="font-bold text-slate-800 line-clamp-1 text-base" title={sup.company_name}>
                                      {sup.company_name}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                                      {sup.type}
                                  </p>
                              </div>

                              {/* Stats / Services */}
                              <div className="flex-1 space-y-3">
                                  <div className="text-xs text-slate-500 flex justify-between border-t border-slate-100 pt-3">
                                      <span>Sử dụng:</span>
                                      <span className="font-medium text-slate-700">{sup.total_services} dịch vụ</span>
                                  </div>

                                  {isRated ? (
                                      <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between border border-green-100">
                                          <span className="text-xs font-bold text-green-800 uppercase">Điểm của bạn</span>
                                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-green-100">
                                              <span className="font-bold text-slate-800 text-sm">{ratedScore.toFixed(1)}</span>
                                              <Star size={12} className="text-yellow-400 fill-yellow-400"/>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="bg-slate-50 p-3 rounded-lg text-center border border-dashed border-slate-200 text-xs text-slate-400 italic">
                                          Chưa có đánh giá nào cho NCC này
                                      </div>
                                  )}
                              </div>

                              {/* Action Button */}
                              <button 
                                  onClick={() => setSelectedSupplier(sup)}
                                  className={`
                                      w-full mt-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                      ${isRated 
                                          ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600' 
                                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 translate-y-0 hover:-translate-y-0.5'
                                      }
                                  `}
                              >
                                  {isRated ? 'Chỉnh sửa / Xem lại' : 'Viết đánh giá ngay'}
                              </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </main>

      {/* MODAL */}
      <RatingModal 
          isOpen={!!selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          supplier={selectedSupplier}
          tourDepartureId={departureId}
          onSuccess={fetchData} // Refresh data after submit
      />
    </div>
  );
};

export default SupplierRatingPage;