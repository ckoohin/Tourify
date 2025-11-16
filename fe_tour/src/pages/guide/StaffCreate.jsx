import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StaffForm from './StaffForm'; // 👈 Tái sử dụng Form

export default function StaffCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // API 3: Tạo nhân sự (POST /api/v1/staff)
  const handleCreateSubmit = async (formData) => {
    setLoading(true);
    try {
      // --- GỌI API THẬT ---
      // const response = await fetch('http://localhost:5000/api/v1/staff', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Tạo mới thất bại');

      console.log('Đã tạo (API):', formData);
      alert('Tạo nhân sự thành công!');
      navigate('/guides'); // Chuyển về trang danh sách
      
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border ...">
      <Link to="/guides" className="flex items-center text-sm text-primary ...">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Quay lại danh sách
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2">Thêm Nhân sự mới</h1>
      
      <StaffForm onSubmit={handleCreateSubmit} loading={loading} />
    </div>
  );
}