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
  const [totalItems, setTotalItems] = useState(0); 
  
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedStaffData, setSelectedStaffData] = useState(null); 
  const [stats, setStats] = useState(null); 
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
            setTotalItems(res.pagination.total || res.pagination.totalItems || 0);
        } else if (res.total) {

            setTotalItems(res.total);
            setTotalPages(Math.ceil(res.total / ITEMS_PER_PAGE));
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

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedStaffId(null);
    setSelectedStaffData(null);
    setStats(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (staff) => {
    if (!staff || !staff.id) return;
    setModalMode('edit');
    setSelectedStaffId(staff.id);
    setIsModalOpen(true);
    setIsFetchingDetail(true);
    setStats(null); 

    try {
        const res = await staffService.getById(staff.id);
        if (res.success) {
            setSelectedStaffData(res.data.staff);
            setStats(res.data.stats);
        }
    } catch (error) {
        toast.error("Lỗi tải chi tiết nhân viên",error);
        setIsModalOpen(false);
    } finally {
        setIsFetchingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
        setSelectedStaffId(null);
        setSelectedStaffData(null);
    }, 300);
  };

  const handleDelete = (id) => {
    if(window.confirm("Bạn có chắc chắn muốn xóa?")) {
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen">
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

      <StaffFilter filters={filters} onChange={(newFilters) => { setFilters(newFilters); setCurrentPage(1); }} />

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
      ) : (
         <>
            <StaffTable staffList={staffList} onDelete={handleDelete} onEdit={handleOpenEdit} />
            
            <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                    totalItems={totalItems} 
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            </div>
         </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? "Thêm Nhân sự Mới" : "Chỉnh sửa hồ sơ nhân sự"}
        maxWidth={modalMode === 'edit' ? 'max-w-6xl' : 'max-w-4xl'}
      >
        {isFetchingDetail ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
                <Loader2 className="animate-spin w-8 h-8 mr-2 text-blue-600"/> Đang tải thông tin...
            </div>
        ) : (
            <>
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

                {modalMode === 'edit' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <StaffForm 
                                staffId={selectedStaffId} 
                                initialData={selectedStaffData} 
                                onSuccess={() => { fetchStaff(); }}
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
                    <StaffForm 
                        onSuccess={(result) => {
                            fetchStaff();
                            handleCloseModal();
                            const newStaff = result?.data || result;
                            if (newStaff?.id) {
                                if (window.confirm("Tạo thành công! Bạn có muốn xem chi tiết nhân sự vừa tạo không?")) {
                                    handleOpenEdit(newStaff); 
                                }
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