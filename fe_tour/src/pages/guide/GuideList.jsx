import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, AlertTriangle, Eye, Edit, Trash2, UserSearch } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
// import FilterBar from '../../components/ui/FilterBar'; // (Bạn có thể dùng FilterBar chung)

// Component FilterBar nội bộ cho trang này
const StaffFilterBar = ({ onFilter }) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const handleApply = () => {
    onFilter({ search, type, status });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      {/* Tìm kiếm */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Tìm kiếm</label>
        <div className="flex items-center bg-slate-50 border ... rounded-lg px-3 py-2 mt-1">
          <UserSearch className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tên, SĐT, Email..."
            className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Lọc theo Loại (từ SQL 'staff_type') */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Loại nhân sự</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-class-tailwind w-full p-2 mt-1">
          <option value="all">Tất cả loại</option>
          <option value="tour_guide">Hướng dẫn viên</option>
          <option value="tour_leader">Trưởng đoàn</option>
          <option value="driver">Tài xế</option>
          <option value="coordinator">Điều phối</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {/* Lọc theo Trạng thái (từ SQL 'status') */}
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-500">Trạng thái</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-class-tailwind w-full p-2 mt-1">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="on_leave">Đang nghỉ phép</option>
        </select>
      </div>

      <div className="self-end">
        <button onClick={handleApply} className="px-4 py-2 bg-primary text-white ... mt-1">Lọc</button>
      </div>
    </div>
  );
};


export default function GuideList() {
  // State cho dữ liệu
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho phân trang và bộ lọc
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });
  
  // State cho Modal xóa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // API 1: Lấy danh sách nhân sự (GET /api/v1/staff)
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        // Xây dựng params cho API
        const params = new URLSearchParams({
          page: pagination.currentPage,
          limit: 15,
          search: filters.search,
          type: filters.type,
          status: filters.status,
        });

        // --- GỌI API THẬT ---
        // const response = await fetch(`http://localhost:5000/api/v1/staff?${params.toString()}`);
        // if (!response.ok) throw new Error('Không thể tải danh sách nhân sự');
        // const data = await response.json();
        
        // (Xóa mock data khi kết nối BE)
        const mockData = {
          data: [
            { id: 1, staff_code: 'HDV-001', full_name: 'Nguyễn Văn An', staff_type: 'tour_guide', phone: '0901234567', status: 'active' },
            { id: 2, staff_code: 'DRV-001', full_name: 'Trần Thị Bê', staff_type: 'driver', phone: '0987654321', status: 'on_leave' },
          ],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 2 }
        };
        await new Promise(res => setTimeout(res, 500)); // Giả lập chờ
        
        setStaffList(mockData.data);
        setPagination(mockData.pagination);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [pagination.currentPage, filters]); // Chạy lại khi đổi trang hoặc lọc

  // Xử lý khi bộ lọc thay đổi
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Quay về trang 1
  };
  
  // Xử lý khi đổi trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Xử lý Xóa
  const handleDelete = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  // API 2: Xóa nhân sự (DELETE /api/v1/staff/:id)
  const confirmDelete = async () => {
    try {
      // --- GỌI API THẬT ---
      // const response = await fetch(`http://localhost:5000/api/v1/staff/${selectedId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Xóa thất bại');

      console.log('Đã xóa (API):', selectedId);
      setIsModalOpen(false);
      // Tải lại dữ liệu trang hiện tại
      setLoading(true); // Bắt fetchStaff chạy lại
      fetchStaff(pagination.currentPage, filters); 
      
    } catch (err) {
      alert(err.message);
      setIsModalOpen(false);
    }
  };
  
  // Ánh xạ 'status' từ DB sang 'level' của StatusBadge
  const statusMap = {
    active: { level: 'success', text: 'Đang hoạt động' },
    inactive: { level: 'info', text: 'Không hoạt động' },
    on_leave: { level: 'warning', text: 'Đang nghỉ phép' },
  };

  // Render nội dung chính (Loading, Error, Data)
  const renderContent = () => {
    if (loading) {
      return <div className="flex h-64 items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
    }
    if (error) {
      return <div className="text-center p-10"><AlertTriangle /> {error}</div>;
    }
    if (staffList.length === 0) {
      return <div className="text-center p-10">Không tìm thấy nhân sự.</div>;
    }

    // Render Bảng (Table)
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 ...">
            <tr>
              <th className="px-5 py-3">Tên nhân sự</th>
              <th className="px-5 py-3">Loại</th>
              <th className="px-5 py-3">Liên hệ</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {staffList.map((staff) => {
              const currentStatus = statusMap[staff.status] || { level: 'info', text: staff.status };
              return (
                <tr key={staff.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <Link to={`/guides/${staff.id}`} className="font-medium text-slate-800 hover:text-primary ...">
                      {staff.full_name}
                    </Link>
                    <div className="text-xs text-slate-400 mt-1">{staff.staff_code}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{staff.staff_type}</td>
                  <td className="px-5 py-4 text-slate-600">{staff.phone}</td>
                  <td className="px-5 py-4">
                    <StatusBadge level={currentStatus.level} text={currentStatus.text} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link to={`/guides/${staff.id}`} title="Xem" className="..."><Eye className="w-4 h-4" /></Link>
                      <Link to={`/guides/edit/${staff.id}`} title="Sửa" className="..."><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(staff.id)} title="Xóa" className="..."><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header trang */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h1>
        <Link 
          to="/guides/create" 
          className="px-4 py-2 bg-primary text-white ... flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Nhân sự
        </Link>
      </div>
      
      {/* Thanh Lọc */}
      <StaffFilterBar onFilter={handleFilterChange} />
      
      {/* Bảng Dữ liệu */}
      <div className="bg-white rounded-2xl border ... overflow-hidden">
        {renderContent()}
      </div>

      {/* Phân trang */}
      {!loading && !error && staffList.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Modal Xóa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa Nhân sự"
        confirmLevel="danger"
      >
        <p>Bạn có chắc chắn muốn xóa nhân sự này không? Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}