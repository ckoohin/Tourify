import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertTriangle } from 'lucide-react';

export default function AttractionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Bắt đầu bằng true để tải data
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    // (Thêm các trường khác)
  });

  // API 2: Lấy dữ liệu cũ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API thật
        // const data = await api.get(`/api/v1/suppliers/${id}`);
        // if (data.type !== 'attraction') throw new Error('Không phải điểm tham quan');
        
        // --- GIẢ LẬP DỮ LIỆU ---
        const mockData = { id: id, company_name: 'Vinpearl Land (Đã tải)', contact_person: 'Ms. Lan', phone: '0901234567', type: 'attraction' };
        // --- KẾT THÚC GIẢ LẬP ---
        
        setFormData(mockData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => { /* ... (Tương tự trang Create) ... */ };

  // API 3: Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Gọi API PUT /api/v1/suppliers/:id
      // body: formData
      console.log('Đang cập nhật:', formData);
      alert('Cập nhật thành công!');
      navigate('/attractions');
    } catch (err) {
      alert('Cập nhật thất bại!',err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.company_name) { /* ... Render Loading ... */ }
  if (error) { /* ... Render Error ... */ }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white ...">
      <Link to="/attractions" className="...">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Quay lại
      </Link>
      <h1 className="text-2xl font-bold mt-2">Chỉnh sửa Điểm tham quan</h1>
      
      {/* FORM TƯƠNG TỰ TRANG CREATE,
        NHƯNG CÁC Ô INPUT ĐÃ CÓ `value={formData.company_name}`
      */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* ... (Các trường input giống hệt trang Create) ... */}
         <div>
          <label>Tên Điểm tham quan</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="input-class-tailwind w-full mt-1"
          />
        </div>
        {/* ... (Các nút bấm) ... */}
      </form>
    </div>
  );
}