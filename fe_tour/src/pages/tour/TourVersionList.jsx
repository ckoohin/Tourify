import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '../../services/api/tourService';
import TourVersionTable from '../../components/tours/versions/TourVersionTable';
import TourVersionForm from '../../components/tours/versions/TourVersionForm';
import Pagination from '../../components/ui/Pagination';

const TourVersionList = () => {
  const [versions, setVersions] = useState([]);
  const [allVersions, setAllVersions] = useState([]); // Dữ liệu gốc để lọc client-side
  const [tours, setTours] = useState([]); // Danh sách tour để map tên
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [filters, setFilters] = useState({
    page: 1, 
    limit: 10,
    search: '',
    tour_id: ''
  });
  const [total, setTotal] = useState(0);

  // Modal
  const [modal, setModal] = useState({ open: false, data: null });

  // 1. Fetch Data (Tours & Versions)
  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        try {
            // Lấy danh sách tour để đổ vào dropdown và map tên
            const tourRes = await tourService.getTours();
            const tourData = tourRes.success ? (tourRes.data.tours || []) : [];
            setTours(tourData);

            // Lấy danh sách version (Toàn bộ)
            const verRes = await tourService.getVersions(); // Không truyền ID để lấy hết
            if (verRes.success) {
                setAllVersions(verRes.data.tourVersions || []);
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };
    initData();
  }, []);

  // 2. Logic Lọc & Phân trang (Client-side)
  useEffect(() => {
    let result = [...allVersions];

    // Lọc theo Tour
    if (filters.tour_id) {
        result = result.filter(v => String(v.tour_id) === filters.tour_id);
    }

    // Lọc theo tên version
    if (filters.search) {
        const term = filters.search.toLowerCase();
        result = result.filter(v => v.name.toLowerCase().includes(term));
    }

    setTotal(result.length);

    // Phân trang
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    setVersions(result.slice(start, end));

  }, [allVersions, filters]);

  // Handlers
  const handleCreate = () => setModal({ open: true, data: null });
  const handleEdit = (ver) => setModal({ open: true, data: ver });

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phiên bản này?")) return;
    try {
        await tourService.deleteVersion(id);
        toast.success("Xóa thành công");
        // Reload data
        const verRes = await tourService.getVersions();
        if (verRes.success) setAllVersions(verRes.data.tourVersions || []);
    } catch (e) { toast.error("Xóa thất bại"); }
  };

  const handleSubmit = async (data) => {
    try {
        if (modal.data) {
            await tourService.updateVersion(modal.data.id, data);
            toast.success("Cập nhật thành công");
        } else {
            await tourService.createVersion(data);
            toast.success("Tạo mới thành công");
        }
        setModal({ open: false, data: null });
        // Reload data
        const verRes = await tourService.getVersions();
        if (verRes.success) setAllVersions(verRes.data.tourVersions || []);
    } catch (e) { 
        toast.error("Có lỗi xảy ra"); 
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Phiên bản Tour</h1>
            <p className="text-sm text-gray-500">Thiết lập các phiên bản theo mùa, khuyến mãi cho Tour</p>
        </div>
        <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Plus size={18}/> Thêm Phiên bản
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
                type="text" placeholder="Tìm tên phiên bản..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
            />
        </div>
        <div className="w-full sm:w-64 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <select 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500 appearance-none bg-white"
                value={filters.tour_id}
                onChange={(e) => setFilters(prev => ({...prev, tour_id: e.target.value, page: 1}))}
            >
                <option value="">-- Tất cả Tour --</option>
                {tours.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>
      ) : (
        <div className="space-y-4">
            <TourVersionTable 
                versions={versions} 
                tours={tours} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />
            
            <div className="bg-white p-4 border rounded-xl">
                <Pagination 
                    currentPage={filters.page} 
                    totalItems={total} 
                    itemsPerPage={filters.limit} 
                    onPageChange={(p) => setFilters(prev => ({...prev, page: p}))} 
                />
            </div>
        </div>
      )}

      {/* Modal Form */}
      <TourVersionForm 
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        onSubmit={handleSubmit}
        initialData={modal.data}
        tours={tours} // Truyền danh sách tour để chọn
      />
    </div>
  );
};

export default TourVersionList;