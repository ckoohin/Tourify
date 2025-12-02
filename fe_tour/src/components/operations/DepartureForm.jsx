import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, Users, User, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import departureService from '../../services/api/departureService';
import tourService from '../../services/api/tourService';
import staffService from '../../services/api/staffService';

const DepartureForm = ({ isOpen, onClose, onSuccess }) => {
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  
  // Data Sources
  const [tours, setTours] = useState([]);
  const [versions, setVersions] = useState([]);
  const [staffs, setStaffs] = useState([]);

  // Form Data
  const [selectedTourId, setSelectedTourId] = useState('');
  const [formData, setFormData] = useState({
    tour_version_id: '',
    departure_date: '',
    return_date: '',
    departure_time: '06:00', // Mặc định
    meeting_point: '',
    meeting_time: '05:30', // Mặc định
    min_guests: 10,
    max_guests: 20,
    tour_leader_id: '',
    tour_guide_id: '',
    notes: ''
  });

  // --- EFFECTS ---
  
  // 1. Load Tours & Staff khi mở modal
  useEffect(() => {
    if (isOpen) {
        const initData = async () => {
            try {
                const [tourRes, staffRes] = await Promise.all([
                    tourService.getTours(),
                    staffService.getAll({ status: 'active' }) // Chỉ lấy nhân viên đang hoạt động
                ]);
                
                if (tourRes.success) setTours(tourRes.data.tours || []);
                if (staffRes.success) setStaffs(staffRes.data.staffs || []); // Giả định API trả về list staff
            } catch (error) {
                console.error(error);
                toast.error("Lỗi tải dữ liệu danh mục");
            }
        };
        initData();
        
        // Reset form
        setSelectedTourId('');
        setFormData({
            tour_version_id: '',
            departure_date: '',
            return_date: '',
            departure_time: '06:00',
            meeting_point: '',
            meeting_time: '05:30',
            min_guests: 10,
            max_guests: 20,
            tour_leader_id: '',
            tour_guide_id: '',
            notes: ''
        });
    }
  }, [isOpen]);

  // 2. Load Versions khi chọn Tour
  useEffect(() => {
    if (selectedTourId) {
        const fetchVersions = async () => {
            try {
                const res = await tourService.getVersions(selectedTourId);
                if (res.success) {
                    setVersions(res.data.tourVersions || []);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchVersions();
    } else {
        setVersions([]);
    }
  }, [selectedTourId]);

  // 3. Tự động tính ngày về (Gợi ý) khi chọn ngày đi và version
  useEffect(() => {
      if (formData.departure_date && selectedTourId) {
          const tour = tours.find(t => String(t.id) === String(selectedTourId));
          if (tour && tour.duration_days) {
              const start = new Date(formData.departure_date);
              const end = new Date(start);
              end.setDate(start.getDate() + (tour.duration_days - 1)); // -1 vì tính cả ngày đi
              setFormData(prev => ({ ...prev, return_date: end.toISOString().split('T')[0] }));
          }
      }
  }, [formData.departure_date, selectedTourId, tours]);


  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate cơ bản
    if (new Date(formData.return_date) < new Date(formData.departure_date)) {
        toast.error("Ngày về không thể trước ngày đi");
        setLoading(false);
        return;
    }

    try {
        const payload = {
            ...formData,
            min_guests: Number(formData.min_guests),
            max_guests: Number(formData.max_guests),
            tour_version_id: Number(formData.tour_version_id),
            tour_leader_id: formData.tour_leader_id ? Number(formData.tour_leader_id) : null,
            tour_guide_id: formData.tour_guide_id ? Number(formData.tour_guide_id) : null,
        };

        const res = await departureService.create(payload);
        if (res.success) {
            toast.success("Tạo lịch khởi hành thành công!");
            onSuccess(); // Refresh list
            onClose();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi tạo lịch");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter staff by role
  const guides = staffs.filter(s => s.staff_type === 'tour_guide');
  const leaders = staffs.filter(s => s.staff_type === 'tour_leader');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b bg-blue-50 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-xl text-blue-800 flex items-center gap-2">
                <Calendar size={24}/> Tạo Lịch Khởi Hành Mới
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
            <form id="departureForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Chọn Tour & Version */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-blue-600"/> Thông tin Tour
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Tour <span className="text-red-500">*</span></label>
                            <select 
                                value={selectedTourId} 
                                onChange={(e) => setSelectedTourId(e.target.value)} 
                                className="w-full px-3 py-2 border rounded-lg bg-white"
                                required
                            >
                                <option value="">-- Chọn Tour --</option>
                                {tours.map(t => (
                                    <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phiên bản áp dụng <span className="text-red-500">*</span></label>
                            <select 
                                name="tour_version_id"
                                value={formData.tour_version_id} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border rounded-lg bg-white disabled:bg-slate-100"
                                required
                                disabled={!selectedTourId}
                            >
                                <option value="">-- Chọn Phiên bản --</option>
                                {versions.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Thời gian & Địa điểm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 border-b pb-2">Thời gian</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày đi <span className="text-red-500">*</span></label>
                                <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giờ đi</label>
                                <input type="time" name="departure_time" value={formData.departure_time} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày về <span className="text-red-500">*</span></label>
                                <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required/>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 border-b pb-2">Tập trung & Đón khách</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Điểm tập trung</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                <input 
                                    type="text" 
                                    name="meeting_point" 
                                    value={formData.meeting_point} 
                                    onChange={handleChange} 
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg"
                                    placeholder="VD: Nhà hát lớn Hà Nội"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giờ tập trung</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                <input 
                                    type="time" 
                                    name="meeting_time" 
                                    value={formData.meeting_time} 
                                    onChange={handleChange} 
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Cấu hình chỗ & Nhân sự */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 border-b pb-2">Số lượng khách (Pax)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tối thiểu (Min)</label>
                                <div className="relative">
                                    <Users size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                    <input type="number" name="min_guests" value={formData.min_guests} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tối đa (Max) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Users size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                    <input type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg" required/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 border-b pb-2">Nhân sự phụ trách</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hướng dẫn viên</label>
                                <select name="tour_guide_id" value={formData.tour_guide_id} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                                    <option value="">-- Chưa chọn --</option>
                                    {guides.map(s => (<option key={s.id} value={s.id}>{s.full_name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trưởng đoàn</label>
                                <select name="tour_leader_id" value={formData.tour_leader_id} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                                    <option value="">-- Chưa chọn --</option>
                                    {leaders.map(s => (<option key={s.id} value={s.id}>{s.full_name}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Note */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nội bộ</label>
                    <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                        rows={3} 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Lưu ý đặc biệt cho chuyến đi này..."
                    ></textarea>
                </div>

            </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-5 py-2 bg-white border rounded-lg hover:bg-gray-100 text-slate-700 font-medium transition-colors">Hủy bỏ</button>
            <button 
                type="submit" 
                form="departureForm" 
                disabled={loading}
                className={`px-6 py-2 text-white rounded-lg font-medium flex items-center gap-2 shadow-md transition-all ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                <Save size={18}/> {loading ? 'Đang tạo...' : 'Tạo Lịch Khởi Hành'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default DepartureForm;