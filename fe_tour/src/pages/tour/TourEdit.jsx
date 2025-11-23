import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import tourService from '../../services/api/tourService';

// Components
import TourForm from '../../components/tours/TourForm';
import TourImages from '../../components/tours/TourImages';
import TourVersions from '../../components/tours/TourVersions';

const TourEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm fetch dữ liệu tổng
  const fetchTourData = async () => {
    try {
      const res = await tourService.getTourById(id);
      if (res.success) {
        // Xử lý dữ liệu trả về từ Backend (do dùng raw query nên có thể là mảng)
        const data = Array.isArray(res.data.tour) ? res.data.tour[0] : res.data.tour;
        setTourData(data);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không tìm thấy tour hoặc lỗi kết nối!");
      navigate('/tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTourData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-500">
        <Loader2 className="animate-spin w-8 h-8 mr-2 text-blue-600"/> Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20 bg-slate-50 min-h-screen">
      {/* Header điều hướng */}
      <button 
        onClick={() => navigate('/tours')} 
        className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa Tour</h1>
          <p className="text-slate-500 text-sm mt-1">
            Cập nhật thông tin, hình ảnh và bảng giá cho tour <span className="font-semibold text-blue-600">#{tourData?.code}</span>
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
            tourData?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {tourData?.status}
          </span>
        </div>
      </div>

      {/* --- KHU VỰC 1: THÔNG TIN CHUNG --- */}
      <section id="basic-info">
        <TourForm 
          tourId={id} 
          initialData={tourData} 
          onSaveSuccess={() => {
             alert("Đã lưu thông tin cơ bản!");
             fetchTourData(); // Reload để update các trường hiển thị nếu cần
          }}
        />
      </section>

      {/* --- KHU VỰC 2: QUẢN LÝ ẢNH --- */}
      <section id="images">
        <TourImages 
          tourId={id} 
          existingImages={tourData?.images || []} 
          onRefresh={fetchTourData} // Quan trọng: Reload lại data sau khi upload ảnh
        />
      </section>

      {/* --- KHU VỰC 3: PHIÊN BẢN & GIÁ --- */}
      <section id="versions">
        <TourVersions 
          tourId={id} 
          versions={tourData?.versions || []} 
          onRefresh={fetchTourData} // Quan trọng: Reload lại data sau khi thêm version/giá
        />
      </section>
      
    </div>
  );
};

export default TourEditPage;