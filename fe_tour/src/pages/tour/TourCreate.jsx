import React from 'react';
import { useNavigate } from 'react-router-dom';
import TourForm from '../../components/tours/TourForm';

const TourCreatePage = () => {
  const navigate = useNavigate();

  const handleCreateSuccess = (newTour) => {
    alert('Tạo mới thành công! Chuyển sang trang chỉnh sửa để thêm ảnh.');
    const newId = newTour.id || newTour.insertId; 
    navigate(`/tours/edit/${newId}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Tạo Tour Mới</h1>
      <p className="text-slate-500 text-sm mb-6">Vui lòng điền thông tin cơ bản. Bạn có thể thêm ảnh và giá sau khi tạo.</p>
      
      <TourForm onSaveSuccess={handleCreateSuccess} />
    </div>
  );
};

export default TourCreatePage;