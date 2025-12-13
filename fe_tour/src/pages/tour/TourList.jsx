import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Loader2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

import tourService from '../../services/api/tourService';
import TourTable from '../../components/tours/TourTable';
import TourFilter from '../../components/tours/TourFilter';
import TourForm from '../../components/tours/TourForm';

import { showDeleteConfirm } from '../../components/config/toast';

const ITEMS_PER_PAGE = 10; 

const TourList = () => {
  const [allTours, setAllTours] = useState([]);
  const [displayTours, setDisplayTours] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({ keyword: '', category_id: '', status: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await tourService.getCategories();
            if (res.success) {
                const cats = res.data.categories || res.data || [];
                setCategories(cats);
            }
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        }
    };
    fetchCategories();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourService.getTours(filters);
      if (res.success) {
        const data = res.data?.tours || [];
        setAllTours(data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách tour:", error);
      toast.error("Không thể tải danh sách tour");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [filters]);

  const filteredTours = useMemo(() => {
    return allTours.filter(tour => {
      const matchKeyword = !filters.keyword || 
        (tour.name?.toLowerCase().includes(filters.keyword.toLowerCase()) || 
         tour.code?.toLowerCase().includes(filters.keyword.toLowerCase()));

      const matchCategory = !filters.category_id || 
        tour.category_id == filters.category_id;

      const matchStatus = !filters.status || 
        tour.status === filters.status;

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [allTours, filters]);

  useEffect(() => {
    const total = Math.ceil(filteredTours.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(total);
    
    if (currentPage > total) {
      setCurrentPage(1);
    }
  }, [filteredTours.length, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const slicedData = filteredTours.slice(startIndex, endIndex);
    setDisplayTours(slicedData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, filteredTours]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    showDeleteConfirm(async () => {
        try {
            const toastId = toast.loading('Đang xóa...');
            await tourService.deleteTour(id);
            toast.dismiss(toastId);
            toast.success('Đã xóa tour thành công!');
            fetchTours(); 
        } catch (error) {
            toast.dismiss();
            toast.error("Lỗi xóa: " + (error.response?.data?.message || error.message));
        }
    }, "Bạn có chắc chắn muốn xóa tour này?");
  };

  const handleOpenCreate = () => {
    setSelectedTour(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTour(null), 300); 
  };

  const handleSuccess = () => {
    fetchTours();
    handleCloseModal();
  };

  const handleSubmitForm = async (formData) => {
    const toastId = toast.loading("Đang xử lý...");
    try {
        if (selectedTour) {
            await tourService.updateTour(selectedTour.id, formData);
            toast.success("Cập nhật tour thành công");
        } else {
            await tourService.createTour(formData);
            toast.success("Tạo tour mới thành công");
        }
        
        handleCloseModal();
        fetchTours();
        
    } catch (error) {
        const msg = error.response?.data?.message || "Có lỗi xảy ra";
        toast.error(msg);
        console.error(error);
    } finally {
        toast.dismiss(toastId);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Danh sách Tour</h1>
          <p className="text-slate-500 mt-1 text-sm">Quản lý {filteredTours.length} tour du lịch trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-medium"
          >
            <Plus size={20} /> Tạo Tour Mới
          </button>
        </div>
      </div>

      <TourFilter onFilterChange={handleFilterChange} categories={categories} />

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
              <div className="mb-8">
                <TourTable 
                  tours={displayTours} 
                  onDelete={handleDelete} 
                  onEdit={handleOpenEdit}
                  categories={categories}
                />
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-auto pb-8">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={20} /></button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => goToPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>{page}</button>
                    ))}
                  </div>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={20} /></button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <TourForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        onSubmit={handleSubmitForm}
        initialData={selectedTour}
        categories={categories} 
        title={selectedTour ? `Cập nhật Tour: ${selectedTour.code}` : "Tạo Tour Mới"}
      />
    </div>
  );
};

export default TourList;