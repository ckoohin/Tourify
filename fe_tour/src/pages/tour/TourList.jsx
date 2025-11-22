import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
// Import đúng file service vừa sửa
import tourService from '../../services/api/tourService'; 

import TourTable from '../../components/tours/TourTable';
import TourFilter from '../../components/tours/TourFilter';

const TourListPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category_id: '', status: '' });

  const fetchTours = async () => {
    setLoading(true);
    try {
      // Gọi API
      const res = await tourService.getTours(filters);
      
      // Debug: In ra để xem cấu trúc thực tế
      console.log("API Response:", res); 

      if (res.success) {
        // Backend trả về: { success: true, data: { tours: [...] } }
        // Vì axios interceptor đã trả về response.data, nên 'res' chính là object trên.
        // Dữ liệu tour nằm ở res.data.tours
        setTours(res.data?.tours || []);
      } else {
        // Trường hợp success: false
        console.error("API Error:", res.message);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách tour:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
      try {
        await tourService.deleteTour(id);
        alert('Xóa thành công!');
        fetchTours(); 
      } catch (error) {
        alert('Xóa thất bại');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách Tour</h1>
          <p className="text-sm text-slate-500">Quản lý toàn bộ tour du lịch của hệ thống</p>
        </div>
        <Link 
          to="/tours/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Thêm Tour Mới
        </Link>
      </div>

      {/* Component Lọc */}
      <TourFilter onFilterChange={handleFilterChange} />

      {/* Component Bảng dữ liệu */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <TourTable tours={tours} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default TourListPage;