import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StaffForm from '../../components/staff/StaffForm';

const StaffCreate = () => {
  const navigate = useNavigate();

  const handleSuccess = (newStaff) => {
    const newId = newStaff.id || newStaff.insertId;
    if (confirm('Tạo nhân viên thành công! Bạn có muốn chuyển đến trang chi tiết để thêm lịch làm việc không?')) {
        navigate(`/guides/edit/${newId}`);
    } else {
        navigate('/guides');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/guides')} 
        className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thêm Nhân sự Mới</h1>
      
      <StaffForm onSuccess={handleSuccess} />
    </div>
  );
};

export default StaffCreate;