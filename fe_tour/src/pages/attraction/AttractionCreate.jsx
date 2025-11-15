import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
// (Import các component Form UI của bạn)

export default function AttractionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '', // Tên điểm tham quan
    type: 'attraction', // 👈 GÁN CỨNG
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Vietnam',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Gọi API thật
      // const response = await api.post('/api/v1/suppliers', formData);
      console.log('Đang gửi dữ liệu:', formData);
      alert('Tạo điểm tham quan thành công!');
      navigate('/attractions');
    } catch (err) {
      console.error(err);
      alert('Tạo thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border ...">
      <Link to="/attractions" className="flex items-center text-sm text-primary ...">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Quay lại danh sách
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2">Thêm Điểm tham quan mới</h1>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Tên Điểm tham quan (company_name) */}
        <div>
          <label className="text-sm font-medium">Tên Điểm tham quan (Bắt buộc)</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="input-class-tailwind w-full mt-1"
            required
          />
        </div>
        
        {/* Grid: Liên hệ & Điện thoại */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Người liên hệ</label>
            <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="input-class-tailwind w-full mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại (Bắt buộc)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-class-tailwind w-full mt-1" required />
          </div>
        </div>
        
        {/* (Thêm các trường khác: email, address, city...) */}
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white ...">
            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}