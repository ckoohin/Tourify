import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import StaffForm from './StaffForm'; // 👈 Tái sử dụng Form

export default function StaffEdit() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading cho cả fetch và submit
  const [error, setError] = useState(null);

  // API 4: Lấy dữ liệu cũ (GET /api/v1/staff/:id)
  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- GỌI API THẬT ---
        // const response = await fetch(`http://localhost:5000/api/v1/staff/${id}`);
        // if (!response.ok) throw new Error('Không tìm thấy nhân sự');
        // const data = await response.json();
        
        // (Xóa mock)
        const mockData = { id: 1, staff_code: 'HDV-001', full_name: 'Nguyễn Văn An', staff_type: 'tour_guide', phone: '0901234567', status: 'active', birthday: '1990-01-01' };
        await new Promise(res => setTimeout(res, 500)); 
        
        setInitialData(mockData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  // API 5: Cập nhật nhân sự (PUT /api/v1/staff/:id)
  const handleEditSubmit = async (formData) => {
    setLoading(true);
    try {
      // --- GỌI API THẬT ---
      // const response = await fetch(`http://localhost:5000/api/v1/staff/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Cập nhật thất bại');

      console.log('Đã cập nhật (API):', formData);
      alert('Cập nhật nhân sự thành công!');
      navigate('/guides'); // Chuyển về trang danh sách
      
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // Xử lý Loading/Error
  if (loading && !initialData) {
    return <div className="flex h-64 ..."><Loader2 className="w-12 h-12 ... animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-center p-10"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border ...">
      <Link to="/guides" className="flex items-center text-sm text-primary ...">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Quay lại danh sách
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2">Chỉnh sửa Nhân sự</h1>
      
      {initialData && (
        <StaffForm 
          initialData={initialData} 
          onSubmit={handleEditSubmit} 
          loading={loading} 
        />
      )}
    </div>
  );
}