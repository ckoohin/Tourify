import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import departureService from '../../services/api/departureService';
import DepartureStatusBadge from '../../components/operations/DepartureStatusBadge';
import DepartureFormModal from '../../components/operations/DepartureFormModal';
import toast from 'react-hot-toast';

import Pagination from '../../components/ui/Pagination'; 

const DepartureList = () => {
  const navigate = useNavigate();
  
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // [NEW] Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách Lịch khởi hành
      const res = await departureService.getAll({ 
        status: filterStatus || undefined,
        search: searchTerm || undefined,
        page: currentPage,       // [NEW] Thêm page
        limit: itemsPerPage      // [NEW] Thêm limit
      });
      
      if (res.success) {
        // Xử lý dữ liệu trả về từ API phân trang
        const dataList = res.data?.data || res.data || [];
        const initialList = Array.isArray(dataList) ? dataList : [];
        
        // [NEW] Cập nhật tổng số bản ghi để tính số trang
        const total = res.data?.pagination?.totalItems || res.pagination?.totalItems || res.total || 0;
        setTotalItems(total);

        // Hiển thị dữ liệu ban đầu ngay lập tức
        setDepartures(initialList);

        // 2. [LOGIC GUEST LIST] Cập nhật số lượng khách chính xác (như đã làm trước đó)
        const updatedList = await Promise.all(initialList.map(async (item) => {
            try {
                const guestRes = await departureService.getGuests(item.id, { limit: 1 });
                if (guestRes.success) {
                    const realCount = guestRes.data?.pagination?.totalItems || guestRes.pagination?.totalItems;
                    const finalCount = realCount !== undefined 
                        ? realCount 
                        : (Array.isArray(guestRes.data) ? guestRes.data.length : (item.confirmed_guests || 0));
                    
                    return { ...item, confirmed_guests: finalCount };
                }
                return item;
            } catch (err) {
                return item;
            }
        }));

        setDepartures(updatedList);

      } else {
        setDepartures([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error(error);
      setDepartures([]);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Reload khi filter hoặc page thay đổi
  useEffect(() => {
    fetchData();
  }, [filterStatus, currentPage, itemsPerPage]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const handleSearch = () => {
      setCurrentPage(1);
      fetchData();
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa lịch khởi hành này?")) return;
      try {
          await departureService.delete(id);
          toast.success("Đã xóa thành công");
          fetchData();
      } catch (error) {
          toast.error("Lỗi xóa: Có thể đã có khách đặt tour");
      }
  }

  const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch Khởi Hành</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi và điều hành các chuyến đi sắp tới</p>
        </div>
        <button 
            onClick={handleCreate}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95 font-medium"
        >
            <Plus size={20} /> Tạo Lịch Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm theo mã tour, tên tour..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            
            <select 
                className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none bg-white min-w-[160px] cursor-pointer hover:border-blue-300 transition-colors"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="scheduled">Dự kiến</option>
                <option value="confirmed">Chắc chắn</option>
                <option value="in_progress">Đang đi</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
            </select>
        </div>

        <button 
            onClick={fetchData} 
            className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-blue-600 transition-colors"
            title="Làm mới dữ liệu"
        >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                        <th className="p-4 w-32">Mã Lịch</th>
                        <th className="p-4 min-w-[250px]">Tour / Hành trình</th>
                        <th className="p-4 min-w-[180px]">Thời gian</th>
                        <th className="p-4 w-48">Tiến độ bán</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {loading && departures.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-12 text-center text-slate-400">
                                <div className="flex justify-center mb-2"><RefreshCw className="animate-spin"/></div>
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    ) : departures.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-12 text-center text-slate-400 italic">
                                Không tìm thấy lịch khởi hành nào phù hợp.
                            </td>
                        </tr>
                    ) : (
                        departures.map(item => {
                            const current = item.confirmed_guests || 0;
                            const max = item.max_guests || 1;
                            const percent = Math.round((current / max) * 100);
                            const progressColor = getProgressColor(percent);

                            return (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 font-mono font-bold text-blue-600">{item.departure_code}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors" title={item.tour_name}>{item.tour_name}</div>
                                        <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                            {item.version_name}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                                            <Calendar size={15} className="text-slate-400"/> 
                                            {new Date(item.departure_date).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 pl-6">
                                            đến {new Date(item.return_date).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-medium text-slate-700">
                                                {current}/{max} <span className="text-slate-400 font-normal">khách</span>
                                            </span>
                                            <span className={`font-bold ${percent >= 100 ? 'text-red-600' : 'text-slate-600'}`}>
                                                {percent}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`} 
                                                style={{width: `${Math.min(percent, 100)}%`}}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <DepartureStatusBadge status={item.status} />
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/departures/${item.id}`)}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors" 
                                                title="Sửa"
                                            >
                                                <Edit size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                                                title="Xóa"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>

        {/* [NEW] Pagination Footer */}
        {totalItems > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 mt-auto">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </div>
        )}
      </div>

      <DepartureFormModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        initialData={selectedItem}
      />
    </div>
  );
};

export default DepartureList;