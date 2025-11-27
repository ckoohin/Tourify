import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Briefcase, User as UserIcon } from 'lucide-react';
import staffService from '../../services/api/staffService';
import StaffTable from '../../components/staff/StaffTable';
import StaffFilter from '../../components/staff/StaffFilter';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal'; 
import StaffForm from '../../components/staff/StaffForm';
import StaffSchedule from '../../components/staff/StaffSchedule'; 
import toast from 'react-hot-toast';

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', staff_type: '', status: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- STATE CHO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedStaffData, setSelectedStaffData] = useState(null); // Data cho form
  const [stats, setStats] = useState(null); // Thống kê (Rating, Total tours)
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = { 
        ...filters, 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
      };
      const res = await staffService.getAll(params);
      if (res.success) {
        setStaffList(res.data);
        if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [filters, currentPage]);

  // --- HÀM MỞ MODAL CREATE ---
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedStaffId(null);
    setSelectedStaffData(null);
    setStats(null);
    setIsModalOpen(true);
  };

  // --- HÀM MỞ MODAL EDIT (ĐÃ SỬA LỖI 404) ---
  const handleOpenEdit = async (staff) => {
    // Kiểm tra dữ liệu đầu vào
    if (!staff || !staff.id) {
        toast.error("Lỗi: Không tìm thấy ID nhân viên");
        return;
    }

    // Mở modal và set trạng thái loading
    setModalMode('edit');
    setSelectedStaffId(staff.id);
    setIsModalOpen(true);
    setIsFetchingDetail(true);
    setStats(null); // Reset stats cũ

    try {
        const res = await staffService.getById(staff.id);
        if (res.success) {
            setSelectedStaffData(res.data.staff);
            setStats(res.data.stats);
        }
    } catch (error) {
        console.error("API Error:", error);
        
        // Xử lý trường hợp nhân viên bị xóa (404)
        if (error.response && error.response.status === 404) {
            toast.error("Nhân viên này không còn tồn tại hoặc đã bị xóa.");
            setIsModalOpen(false); // Đóng modal
            fetchStaff(); // Tải lại danh sách mới nhất
        } else {
            const msg = error.response?.data?.message || "Không thể tải chi tiết nhân viên";
            toast.error(msg);
            setIsModalOpen(false);
        }
    } finally {
        setIsFetchingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clear data để tránh giật UI khi modal đang đóng
    setTimeout(() => {
        setSelectedStaffId(null);
        setSelectedStaffData(null);
    }, 300);
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-sm">Bạn có chắc chắn muốn xóa nhân viên này?</span>
        <div className="flex gap-2 shrink-0">
          <button
            className="btn-confirm"
            onClick={async () => {
              toast.dismiss(t.id); 
              try {
                await staffService.delete(id);
                toast.success("Đã xóa nhân viên");
                fetchStaff(); 
              } catch (error) {
                toast.error("Không thể xóa: " + (error.response?.data?.message || error.message));
              }
            }}
          >
            Xóa
          </button>
          <button
            className="btn-cancel"
            onClick={() => toast.dismiss(t.id)}
          >
            Hủy
          </button>
        </div>
      </div>
    ), {
      className: 'my-toast-confirm',
      position: 'top-center',
      duration: 5000,
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h1>
            <p className="text-slate-500 text-sm">Quản lý hồ sơ Hướng dẫn viên, Tài xế và Điều hành</p>
        </div>
        <button 
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
            <Plus size={20} /> Thêm Nhân viên
        </button>
      </div>

      {/* Filter */}
      <StaffFilter filters={filters} onChange={(newFilters) => { setFilters(newFilters); setCurrentPage(1); }} />

      {/* Table */}
      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
      ) : (
         <>
            <StaffTable staffList={staffList} onDelete={handleDelete} onEdit={handleOpenEdit} />
            
            <div className="mt-6">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                    totalItems={0} 
                />
            </div>
         </>
      )}

      {/* --- MODAL XỬ LÝ CREATE / EDIT --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? "Thêm Nhân sự Mới" : "Chỉnh sửa hồ sơ nhân sự"}
        // Nếu Edit thì cần modal rộng để chứa cả lịch (max-w-6xl), nếu Create thì nhỏ hơn (max-w-4xl)
        maxWidth={modalMode === 'edit' ? 'max-w-6xl' : 'max-w-4xl'}
      >
        {isFetchingDetail ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
                <Loader2 className="animate-spin w-8 h-8 mr-2 text-blue-600"/> Đang tải thông tin...
            </div>
        ) : (
            <>
                {/* Header Stats (Chỉ hiện khi Edit và có dữ liệu) */}
                {modalMode === 'edit' && selectedStaffData && (
                    <div className="flex justify-between items-end mb-6 px-1 border-b border-slate-100 pb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedStaffData.full_name} 
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    #{selectedStaffData.staff_code}
                                </span>
                            </h1>
                            <p className="text-slate-500 text-xs mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1"><Briefcase size={12}/> {selectedStaffData.staff_type?.toUpperCase()}</span>
                                <span className="flex items-center gap-1"><UserIcon size={12}/> {selectedStaffData.phone}</span>
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="bg-blue-50 px-3 py-1.5 rounded border border-blue-100 text-center">
                                <p className="text-[10px] text-blue-500 uppercase font-bold">Tổng Tour</p>
                                <p className="text-lg font-bold text-blue-700 leading-none">{stats?.total_tours || 0}</p>
                            </div>
                            <div className="bg-yellow-50 px-3 py-1.5 rounded border border-yellow-100 text-center">
                                <p className="text-[10px] text-yellow-600 uppercase font-bold">Đánh giá</p>
                                <p className="text-lg font-bold text-yellow-600 leading-none">{stats?.avg_rating || '0.0'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nội dung chính */}
                {modalMode === 'edit' ? (
                    // --- Giao diện Edit: Chia 2 cột (Form + Lịch) ---
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <StaffForm 
                                staffId={selectedStaffId} 
                                initialData={selectedStaffData} 
                                onSuccess={() => {
                                    fetchStaff(); // Reload list nhưng không đóng modal
                                    // Toast đã được gọi bên trong StaffForm
                                }}
                                onClose={handleCloseModal}
                                isInModal={true} 
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="h-full min-h-[500px] bg-slate-50 rounded-lg border border-slate-200">
                                <StaffSchedule staffId={selectedStaffId} />
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- Giao diện Create: Chỉ hiện Form ---
                    <StaffForm 
                        onSuccess={(result) => {
                            // result trả về từ StaffForm thường là object: { id: ..., name: ... } hoặc { data: { ... } }
                            // Cần lấy chính xác ID để chuyển sang edit
                            const newStaff = result.data || result;
                            
                            if (window.confirm("Tạo thành công! Bạn có muốn thêm lịch làm việc ngay không?")) {
                                // Chuyển sang mode edit ngay lập tức
                                handleOpenEdit(newStaff); 
                            } else {
                                fetchStaff();
                                handleCloseModal();
                            }
                        }}
                        onClose={handleCloseModal}
                        isInModal={true}
                    />
                )}
            </>
        )}
      </Modal>
    </div>
  );
};

export default StaffList;