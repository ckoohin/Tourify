import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import staffService from '../../services/api/staffService';
import StaffTable from '../../components/staff/StaffTable';
import StaffFilter from '../../components/staff/StaffFilter';
import Pagination from '../../components/ui/Pagination';

import { useNavigate } from 'react-router-dom';

const StaffList = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', staff_type: '', status: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
        setStaffList(res.data); // Backend trả về res.data là mảng staff
        // Nếu backend có trả về pagination info
        if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [filters, currentPage]);

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await staffService.delete(id);
        fetchStaff();
      } catch (error) {
        alert("Không thể xóa: " + error.response?.data?.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h1>
            <p className="text-slate-500 text-sm">Quản lý hồ sơ Hướng dẫn viên, Tài xế và Điều hành</p>
        </div>
        <button 
            onClick={() => navigate('/staff/create')} // Hoặc mở Modal
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
            <Plus size={20} /> Thêm Nhân viên
        </button>
      </div>

      <StaffFilter filters={filters} onChange={(newFilters) => { setFilters(newFilters); setCurrentPage(1); }} />

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
      ) : (
         <>
            <StaffTable staffList={staffList} onDelete={handleDelete} />
            <div className="mt-6">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                    totalItems={0} // Nếu BE không trả về total, tạm để 0
                />
            </div>
         </>
      )}
    </div>
  );
};

export default StaffList;