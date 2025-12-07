import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import departureService from '../../services/api/departureService';
// Giả sử bạn có service lấy version tour
// import tourVersionService from '../../services/api/tourVersionService'; 

const DepartureFormModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tour_version_id: '', 
    departure_date: '',
    return_date: '',
    departure_time: '08:00',
    meeting_point: '',
    meeting_time: '07:30',
    min_guests: 10,
    max_guests: 20,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        ...initialData,
        departure_date: initialData.departure_date ? initialData.departure_date.split('T')[0] : '',
        return_date: initialData.return_date ? initialData.return_date.split('T')[0] : '',
      });
    } else if (isOpen) {
        // Reset form
        setFormData({
            tour_version_id: '',
            departure_date: '',
            return_date: '',
            departure_time: '08:00',
            meeting_point: '',
            meeting_time: '07:30',
            min_guests: 10,
            max_guests: 20,
            notes: ''
        });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await departureService.update(initialData.id, formData);
        toast.success("Cập nhật thành công");
      } else {
        await departureService.create(formData);
        toast.success("Tạo lịch khởi hành thành công");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0">
          <h3 className="font-bold text-lg text-slate-800">
            {initialData ? 'Chỉnh sửa Lịch khởi hành' : 'Lên Lịch khởi hành Mới'}
          </h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Chọn Tour Version (Tạm thời là input, thực tế nên là Select) */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã Phiên bản Tour (Version ID) <span className="text-red-500">*</span></label>
            <input 
                type="number" 
                name="tour_version_id" 
                value={formData.tour_version_id} 
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!!initialData} // Không sửa version khi đã tạo
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Ngày đi <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-2" required/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Ngày về <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-2" required/>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Giờ tập trung</label>
                <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input type="time" name="meeting_time" value={formData.meeting_time} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-2"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Giờ khởi hành</label>
                <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input type="time" name="departure_time" value={formData.departure_time} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-2"/>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Điểm tập trung / Đón khách</label>
            <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input type="text" name="meeting_point" value={formData.meeting_point} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="VD: Nhà hát lớn Hà Nội"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Số khách tối thiểu</label>
                <input type="number" name="min_guests" value={formData.min_guests} onChange={handleChange} className="w-full border rounded-lg px-3 py-2"/>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Số khách tối đa <span className="text-red-500">*</span></label>
                <input type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú điều hành</label>
            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full border rounded-lg px-3 py-2"></textarea>
          </div>

        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                <Save size={16}/> {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DepartureFormModal;