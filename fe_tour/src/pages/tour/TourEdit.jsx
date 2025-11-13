import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
// Giả lập dữ liệu được fetch từ API dựa trên ID
const mockTourData = {
  id: 1,
  title: 'Hạ Long Du Thuyền 5 Sao - Khám Phá Kỳ Quan',
  code: "HL-ST5",
  price: 3590000,
  duration: '3N2Đ',
  category: 'Du lịch Biển',
  status: 'Đang mở bán',
  capacity: 20, // Thêm dữ liệu này
  imageUrl: 'https://i.imgur.com/A5a2v1C.jpeg',
  description: 'Trải nghiệm du thuyền đẳng cấp 5 sao trên Vịnh Hạ Long, một trong bảy kỳ quan thiên nhiên thế giới. Tour bao gồm các hoạt động thăm hang Sửng Sốt, chèo kayak tại hang Luồn, tắm biển tại đảo Titop và thưởng thức ẩm thực cao cấp trên du thuyền. Đây là lựa chọn hoàn hảo cho kỳ nghỉ ngắn ngày, kết hợp giữa thư giãn và khám phá.',
};
// --- KẾT THÚC MOCK DATA ---


export default function TourEdit() {
  const { id } = useParams(); // Lấy /:id từ URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null); // Bắt đầu là null
  const [loading, setLoading] = useState(true);

  // Giả lập việc fetch dữ liệu tour khi component được tải
  useEffect(() => {
    // TODO: Thay thế bằng API thật
    // const tour = await tourService.getTourById(id);
    // setFormData(tour);
    
    // Giả lập: tìm tour có id trùng khớp
    // (Trong ví dụ này, chúng ta luôn trả về mockTourData nếu id=1)
    if (id === '1') {
      setFormData(mockTourData);
    } else {
      // Nếu không tìm thấy tour (ví dụ id=2, 3...),
      // chúng ta sẽ tự tạo dữ liệu mẫu
      setFormData({
        id: id,
        title: `Tour Mẫu (ID: ${id})`,
        code: `TOUR-${id}`,
        price: 5000000,
        duration: '4N3Đ',
        category: 'Núi rừng',
        status: 'Bản nháp',
        capacity: 25,
        imageUrl: 'https://i.imgur.com/0aJ8Z1a.jpeg',
        description: 'Mô tả chi tiết cho tour mẫu này...',
      });
    }
    setLoading(false);
  }, [id]); // Chạy lại khi id thay đổi

  // Xử lý khi input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu đã cập nhật:', formData);
    // TODO: Gọi API để cập nhật
    // await tourService.updateTour(id, formData);
    alert('Đã cập nhật tour thành công!');
    navigate(`/tours/${id}`); // Quay lại trang chi tiết
  };

  // Hiển thị loading trong khi "fetch" dữ liệu
  if (loading || !formData) {
    return (
      <div className="max-w-7xl mx-auto text-center py-10">
        <h1 className="text-xl font-bold text-slate-700">Đang tải dữ liệu tour...</h1>
      </div>
    );
  }

  // Giao diện Form
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <Link to={`/tours/${id}`} className="text-slate-400 hover:text-primary" title="Quay lại trang chi tiết">
          <i className="ri-arrow-left-s-line text-2xl"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa Tour</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin cho tour #{formData.code}</p>
        </div>
      </div>

      {/* FORM CONTENT */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Form Section: Thông tin cơ bản */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Thông tin cơ bản</h3>
            <div className="space-y-4">
              {/* Tên Tour */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Tên Tour</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="Ví dụ: Tour khám phá Sapa"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mã Tour */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">Mã Tour</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-slate-100"
                    readOnly
                  />
                </div>
                 {/* Thời gian */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Thời gian (Duration)</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Ví dụ: 3N2Đ"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Section: Giá & Phân loại */}
           <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Giá & Phân loại</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Giá */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="3500000"
                  />
                </div>
                 {/* Số chỗ */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">Số chỗ (Capacity)</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="25"
                  />
                </div>
                 {/* Danh mục */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="Du lịch Biển">Du lịch Biển</option>
                    <option value="Núi rừng">Núi rừng</option>
                    <option value="Nghỉ dưỡng">Nghỉ dưỡng</option>
                    <option value="Du lịch sinh thái">Du lịch sinh thái</option>
                    <option value="Du lịch văn hóa">Du lịch văn hóa</option>
                    <option value="Chưa phân loại">Chưa phân loại</option>
                  </select>
                </div>
            </div>
          </div>

          {/* Form Section: Mô tả & Hình ảnh */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Mô tả & Hình ảnh</h3>
            <div className="space-y-4">
               {/* Mô tả */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="Mô tả về các hoạt động, điểm nổi bật của tour..."
                ></textarea>
              </div>
              {/* Ảnh bìa */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">Link ảnh bìa (Cover Image URL)</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="block w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="https://imgur.com/..."
                />
              </div>
            </div>
          </div>
          
           {/* Form Section: Quản lý */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Quản lý</h3>
             {/* Trạng thái */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Trạng thái Tour</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full md:w-1/3 text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="Đang mở bán">Đang mở bán</option>
                <option value="Sắp hết chỗ">Sắp hết chỗ</option>
                <option value="Đã đóng">Đã đóng</option>
                <option value="Bản nháp">Bản nháp</option>
              </select>
            </div>
          </div>

          {/* Nút bấm */}
          <div className="p-5 bg-slate-50 flex justify-between items-center rounded-b-2xl">
            {/* Nút Xóa (Hành động nguy hiểm) */}
            <button 
              type="button" 
              className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm"
              onClick={() => {
                if(window.confirm(`Bạn có chắc chắn muốn xóa tour "${formData.title}"? Hành động này không thể hoàn tác.`)) {
                   console.log(`Xóa tour ID: ${id}`);
                   // TODO: gọi API xóa
                   // await tourService.deleteTour(id);
                   navigate('/tours'); // Quay về danh sách tour
                }
              }}
            >
              Xóa Tour này
            </button>
            
            {/* Nút Hủy và Lưu */}
            <div className="flex gap-3">
              <Link 
                to={`/tours/${id}`}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Hủy
              </Link>
              <button 
                type="submit" 
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}