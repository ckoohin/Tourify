import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, AlertCircle, Building, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

// Import services
import serviceBookingService from '../../../services/api/serviceBookingService';
import supplierRatingService from '../../../services/api/supplierRatingService';
import RatingModal from './RatingModal';

const TourSupplierList = ({ departureId }) => {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({}); // { supplierId: { score, label... } }
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | rated
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (departureId) fetchData();
  }, [departureId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách NCC từ Service Bookings
      const serviceRes = await serviceBookingService.getByDepartureId(departureId);
      let services = [];
      
      // Xử lý linh hoạt response service
      if (serviceRes.data) { 
         services = Array.isArray(serviceRes.data) ? serviceRes.data : (serviceRes.data.data || []);
      }

      // Gom nhóm Supplier
      const uniqueMap = new Map();
      services.forEach(item => {
          // Lấy ID NCC
          const supId = item.supplier_id || item.supplier?.id;
          
          if(supId && !uniqueMap.has(supId)) {
              uniqueMap.set(supId, {
                  id: supId,
                  company_name: item.supplier_name || item.supplier?.company_name || 'Nhà cung cấp ẩn danh',
                  type: item.supplier_type || item.supplier?.type || 'Other',
                  service_count: 0
              });
          }
          
          if (supId) {
            const sup = uniqueMap.get(supId);
            sup.service_count += 1;
          }
      });
      setSuppliers(Array.from(uniqueMap.values()));

      // 2. Lấy danh sách đánh giá đã có
      const ratingRes = await supplierRatingService.getByTourDeparture(departureId);
      
      // [FIX] Xử lý linh hoạt cấu trúc response để tránh lỗi không tìm thấy dữ liệu
      const ratingsData = ratingRes.data?.ratings || ratingRes.data?.data?.ratings || [];
      
      if (Array.isArray(ratingsData)) {
         const map = {};
         // Gom nhóm rating theo supplier_id
         const bySupplier = {};
         ratingsData.forEach(r => {
             const sId = r.supplier_id;
             if (!bySupplier[sId]) bySupplier[sId] = [];
             bySupplier[sId].push(r);
         });

         // Logic xác định điểm số hiển thị
         Object.keys(bySupplier).forEach(supId => {
             const list = bySupplier[supId];
             const overall = list.find(r => r.rating_type === 'overall');
             
             // Chuyển key supId thành số để khớp với id của supplier
             const key = Number(supId);

             if (overall) {
                 map[key] = { score: Number(overall.rating), isPartial: false, count: list.length };
             } else {
                 // Nếu chưa có overall, lấy điểm trung bình
                 const avg = list.reduce((sum, item) => sum + parseFloat(item.rating), 0) / list.length;
                 map[key] = { score: avg, isPartial: true, count: list.length };
             }
         });
         setRatingsMap(map);
      }

    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu đánh giá");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và tìm kiếm
  const filteredSuppliers = suppliers.filter(sup => {
      // Kiểm tra xem đã có đánh giá chưa
      const isRated = !!ratingsMap[sup.id];
      const matchesSearch = sup.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filter === 'rated') return isRated;   // Đã xong: Phải có trong ratingsMap
      if (filter === 'pending') return !isRated; // Chưa xong: Không có trong ratingsMap
      
      return true; // All
  });

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải danh sách nhà cung cấp...</div>;

  return (
    <div className="p-6">
        {/* Header Section: Title & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800">Đánh giá Nhà cung cấp trong Tour</h3>
            
            <div className="flex gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="Tìm nhà cung cấp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                    {['all', 'pending', 'rated'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${
                                filter === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {t === 'all' ? 'Tất cả' : t === 'pending' ? 'Chưa xong' : 'Đã xong'}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content: Grid */}
        {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Building size={32} className="mx-auto text-slate-300 mb-2"/>
                <p className="text-slate-500 text-sm">
                    {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : filter === 'rated' ? 'Chưa có nhà cung cấp nào được đánh giá.' : 'Tất cả nhà cung cấp đã được đánh giá.'}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSuppliers.map(sup => {
                    const ratingInfo = ratingsMap[sup.id];
                    const isRated = !!ratingInfo;

                    return (
                        <div 
                            key={sup.id} 
                            className={`
                                relative p-5 bg-white border rounded-xl shadow-sm transition-all duration-200
                                ${isRated ? 'border-green-200 hover:border-green-300' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                            `}
                        >
                            {/* Supplier Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0 pr-2">
                                    <h4 className="font-bold text-slate-800 line-clamp-1" title={sup.company_name}>
                                        {sup.company_name}
                                    </h4>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded tracking-wider">
                                        {sup.type}
                                    </span>
                                </div>
                                <div className="shrink-0 pl-2 text-right">
                                    {isRated ? (
                                        <div className="flex flex-col items-end">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <CheckCircle size={10}/> {ratingInfo.isPartial ? 'Đang đánh giá' : 'Đã xong'}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1 text-yellow-500 font-bold text-sm">
                                                <span>{ratingInfo.score.toFixed(1)}</span>
                                                <Star size={12} fill="currentColor"/>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-medium text-slate-400 italic">Chưa đánh giá</span>
                                    )}
                                </div>
                            </div>

                            {/* Divider & Info */}
                            <div className="border-t border-slate-50 pt-3 mt-2 flex justify-between items-center">
                                <span className="text-xs text-slate-400">Sử dụng: <b className="text-slate-600">{sup.service_count}</b> dịch vụ</span>
                                
                                <button 
                                    onClick={() => setSelectedSupplier(sup)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-bold transition-colors
                                        ${isRated 
                                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                                        }
                                    `}
                                >
                                    {isRated ? 'Xem chi tiết' : 'Đánh giá'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Modal */}
        <RatingModal 
            isOpen={!!selectedSupplier}
            onClose={() => setSelectedSupplier(null)}
            supplier={selectedSupplier}
            tourDepartureId={departureId}
            onSuccess={fetchData} 
        />
    </div>
  );
};

export default TourSupplierList;