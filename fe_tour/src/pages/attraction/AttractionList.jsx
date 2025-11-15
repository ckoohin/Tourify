import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, AlertTriangle, Eye, Edit, Trash2, MapPin } from 'lucide-react'; // 👈 Thêm icon
import Pagination from '../../components/ui/Pagination'; // Tái sử dụng
import StatusBadge from '../../components/ui/StatusBadge'; // Tái sử dụng
import Modal from '../../components/ui/Modal'; // Tái sử dụng
import FilterBar from '../../components/ui/FilterBar'; // 👈 Tái sử dụng FilterBar

export default function AttractionList() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // State cho bộ lọc (để FilterBar hoạt động)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all', // Bạn có thể dùng 'category' để lọc theo Tỉnh/Thành
    status: 'all',
  });

  // API 1: Lấy danh sách (Đã lọc 'attraction' ở BE)
  useEffect(() => {
    const fetchAttractions = async (page = 1, currentFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Gọi API thật
        // const params = new URLSearchParams({ 
        //   page, 
        //   type: 'attraction',
        //   search: currentFilters.search,
        //   status: currentFilters.status 
        // });
        // const data = await api.get(`/api/v1/suppliers?${params.toString()}`);
        
        // --- GIẢ LẬP DỮ LIỆU (từ bảng suppliers) ---
        await new Promise(res => setTimeout(res, 500)); // Giả lập chờ
        const mockData = {
          data: [
            { id: 1, code: 'ATT-001', company_name: 'Vinpearl Land Nha Trang', city: 'Nha Trang', phone: '0901234567', status: 'active', contact_person: 'Ms. Lan' },
            { id: 2, code: 'ATT-002', company_name: 'Bảo tàng Dân tộc học Việt Nam', city: 'Hà Nội', phone: '0987654321', status: 'active', contact_person: 'Mr. Hùng' },
            { id: 3, code: 'ATT-003', company_name: 'Địa đạo Củ Chi', city: 'TP. Hồ Chí Minh', phone: '0123456789', status: 'inactive', contact_person: 'Mr. Nam' },
          ],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 3 }
        };
        // --- KẾT THÚC GIẢ LẬP ---
        
        setAttractions(mockData.data);
        setPagination(mockData.pagination);
      } catch (err) {
        setError('Không thể tải dữ liệu điểm tham quan.');
      } finally {
        setLoading(false);
      }
    };
    // Chạy lại khi trang hoặc bộ lọc thay đổi
    fetchAttractions(pagination.currentPage, filters);
  }, [pagination.currentPage, filters]);

  const handleDelete = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    // ... (Logic xóa) ...
    setIsModalOpen(false);
  };
  
  // Hàm xử lý khi bộ lọc thay đổi (từ con)
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Quay về trang 1
  };
  
  // --- SỬA 1: Hoàn thiện các trạng thái render ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex h-64 items-center justify-center p-6 bg-white border border-red-200 rounded-2xl">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">Đã xảy ra lỗi</h3>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        </div>
      );
    }
    
    if (attractions.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center p-6">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">Không tìm thấy điểm tham quan</h3>
            <p className="mt-1 text-sm text-slate-500">Hãy thử thay đổi bộ lọc hoặc thêm mới.</p>
          </div>
        </div>
      );
    }

    // Render Bảng (Table)
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-5 py-3">Tên Điểm tham quan</th>
              <th className="px-5 py-3">Địa chỉ / Thành phố</th>
              <th className="px-5 py-3">Liên hệ</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {attractions.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  {/* --- SỬA 2: Thêm Link vào tên --- */}
                  <Link 
                    to={`/attractions/${att.id}`} 
                    className="font-medium text-slate-800 hover:text-primary hover:underline"
                  >
                    {att.company_name}
                  </Link>
                  <div className="text-xs text-slate-400 mt-1">{att.code}</div>
                </td>
                <td className="px-5 py-4 text-slate-600">{att.city}</td>
                <td className="px-5 py-4 text-slate-600">
                  <div>{att.contact_person}</div>
                  <div className="text-xs text-slate-400 mt-1">{att.phone}</div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge 
                    level={att.status === 'active' ? 'success' : 'info'} 
                    text={att.status === 'active' ? 'Hoạt động' : 'Không hoạt động'} 
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Link to={`/attractions/${att.id}`} title="Xem" className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-slate-50"><Eye className="w-4 h-4" /></Link>
                    <Link to={`/attractions/edit/${att.id}`} title="Sửa" className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(att.id)} title="Xóa" className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Điểm tham quan</h1>
        <Link 
          to="/attractions/create"
          // --- SỬA 3: Hoàn thiện class cho nút ---
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 shadow-sm shadow-blue-500/30 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Điểm tham quan
        </Link>
      </div>
      
      {/* --- SỬA 4: Kích hoạt FilterBar --- */}
      <FilterBar 
        onFilterChange={handleFilterChange}
        // Tùy chỉnh placeholder cho phù hợp
        searchPlaceholder="Tên điểm tham quan, mã..."
        // (Ẩn các bộ lọc không cần thiết nếu muốn)
        // showCategoryFilter={false} 
        // showStatusFilter={true} 
      />
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {renderContent()}
      </div>

      {/* Chỉ hiển thị Phân trang nếu có nội dung */}
      {!loading && !error && attractions.length > 0 && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        confirmLevel="danger"
        confirmText="Xác nhận Xóa"
      >
        <p>Bạn có chắc chắn muốn xóa điểm tham quan này không? Dữ liệu liên quan có thể bị ảnh hưởng.</p>
      </Modal>
    </div>
  );
}