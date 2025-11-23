import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

import tourService from '../../services/api/tourService';

import TourCard from '../../components/tours/TourCard';
import TourFilter from '../../components/tours/TourFilter';

const ITEMS_PER_ROW = 4;
const ROWS_PER_PAGE = 6;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE; 

const TourList = () => {
  const [allTours, setAllTours] = useState([]);
  const [displayTours, setDisplayTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category_id: '', status: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getTours(filters);
      if (res.success) {
        const data = res.data?.tours || [];
        setAllTours(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
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

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const slicedData = allTours.slice(startIndex, endIndex);
    setDisplayTours(slicedData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, allTours]);

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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Danh sách Tour</h1>
          <p className="text-slate-500 mt-1 text-sm">Quản lý {allTours.length} tour du lịch trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/tours/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-medium"
          >
            <Plus size={20} /> Tạo Tour Mới
          </Link>
        </div>
      </div>

      <TourFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {displayTours.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <LayoutGrid className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Không tìm thấy tour nào</h3>
              <p className="text-slate-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo tour mới.</p>
            </div>
          ) : (
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {displayTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} onDelete={handleDelete} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TourList;