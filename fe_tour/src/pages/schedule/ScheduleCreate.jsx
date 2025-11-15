import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// (Import các component Form UI của bạn: Input, Select, DatePicker...)

export default function ScheduleCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tour_version_id: '',
    departure_date: '',
    return_date: '',
    max_guests: 20,
    status: 'scheduled',
    tour_guide_id: ''
  });
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);

  // API 3: Lấy dữ liệu cho các Select Box
  useEffect(() => {
    // TODO: Gọi API GET /api/v1/tours?minimal=true (chỉ lấy ID và Tên)
    // setTours(data);
    
    // TODO: Gọi API GET /api/v1/staff?role=guide (chỉ lấy ID và Tên HDV)
    // setGuides(data);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Gọi API POST /api/v1/departures
    // body: formData
    //
    // if (success) {
    //   navigate('/schedules'); // Quay về trang lịch
    // }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border ...">
      <h1 className="text-2xl font-bold mb-6">Tạo Lịch Khởi Hành Mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Trường 1: Chọn Tour */}
        <div>
          <label>Tour (Bắt buộc)</label>
          <select 
            required 
            onChange={(e) => setFormData({...formData, tour_version_id: e.target.value})}
            className="input-class-tailwind"
          >
            <option value="">-- Chọn tour --</option>
            {/* {tours.map(tour => <option value={tour.id}>{tour.name}</option>)} */}
          </select>
        </div>

        {/* Trường 2: Ngày đi & Ngày về */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Ngày khởi hành</label>
            <input type="date" onChange={(e) => setFormData({...formData, departure_date: e.target.value})} />
          </div>
          <div>
            <label>Ngày về</label>
            <input type="date" onChange={(e) => setFormData({...formData, return_date: e.target.value})} />
          </div>
        </div>
        
        {/* Trường 3: Số khách & Trạng thái */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Số khách tối đa (Max Guests)</label>
            <input type="number" value={formData.max_guests} onChange={(e) => setFormData({...formData, max_guests: e.target.value})} />
          </div>
          <div>
            <label>Trạng thái</label>
            <select onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="scheduled">Đã lên lịch</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </div>
        </div>

        {/* Trường 4: Phân công HDV */}
        <div>
          <label>Hướng dẫn viên chính</label>
          <select onChange={(e) => setFormData({...formData, tour_guide_id: e.target.value})}>
            <option value="">-- Chưa phân công --</option>
            {/* {guides.map(guide => <option value={guide.id}>{guide.name}</option>)} */}
          </select>
        </div>

        {/* Nút Submit */}
        <div className="pt-4 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-primary text-white ...">
            Lưu Lịch Khởi Hành
          </button>
        </div>
      </form>
    </div>
  );
}