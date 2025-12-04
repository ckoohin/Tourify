import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, User, FileText, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import staffAssignmentService from '../../../services/api/staffAssignmentService';
import staffService from '../../../services/api/staffService';

const ROLES = [
  { value: 'tour_leader', label: 'Trưởng đoàn (Tour Leader)' },
  { value: 'tour_guide', label: 'Hướng dẫn viên (Guide)' },
  { value: 'driver', label: 'Lái xe (Driver)' },
  { value: 'assistant', label: 'Phụ xe / Trợ lý' },
  { value: 'coordinator', label: 'Điều hành (Coordinator)' }
];

const StaffAssignmentModal = ({ isOpen, onClose, onSuccess, departureId, initialData, defaultDate }) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [fetchingStaff, setFetchingStaff] = useState(false);
  
  const [formData, setFormData] = useState({
    staff_id: '',
    role: 'tour_guide',
    assignment_date: '',
    notes: ''
  });

  // Load danh sách nhân viên khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        setFetchingStaff(true);
        try {
          const res = await staffService.getAll({ status: 'active', limit: 100 });
          
          // FIX: Xử lý linh hoạt dữ liệu trả về (do axios interceptor đã trả về body)
          let list = [];
          if (res.data) {
            // Trường hợp 1: API trả về mảng trực tiếp trong data (vd: { data: [...] })
            if (Array.isArray(res.data)) {
              list = res.data;
            } 
            // Trường hợp 2: API trả về phân trang (vd: { data: { data: [...] } })
            else if (res.data.data && Array.isArray(res.data.data)) {
              list = res.data.data;
            }
          }
          
          setStaffList(list);
        } catch (error) {
          console.error("Lỗi tải danh sách nhân viên", error);
          toast.error("Không thể tải danh sách nhân viên");
        } finally {
          setFetchingStaff(false);
        }
      };
      
      fetchStaff();

      if (initialData) {
        setFormData({
          staff_id: initialData.staff_id,
          role: initialData.role,
          assignment_date: initialData.assignment_date ? initialData.assignment_date.split('T')[0] : '',
          notes: initialData.notes || ''
        });
      } else {
        // Reset form, dùng defaultDate nếu có
        setFormData({
          staff_id: '',
          role: 'tour_guide',
          assignment_date: defaultDate ? defaultDate.split('T')[0] : new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    }
  }, [isOpen, initialData, defaultDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staff_id) {
        toast.error("Vui lòng chọn nhân sự");
        return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        tour_departure_id: departureId
      };

      if (initialData) {
        await staffAssignmentService.update(initialData.id, payload);
        toast.success('Cập nhật phân công thành công');
      } else {
        await staffAssignmentService.create(payload);
        toast.success('Phân công nhân sự thành công');
      }
      onSuccess(); 
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi lưu';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={20}/>
            {initialData ? 'Điều chỉnh Phân công' : 'Phân công Nhân sự Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Chọn Nhân viên */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nhân sự <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <select
                name="staff_id"
                required
                className={`w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${initialData ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                value={formData.staff_id}
                onChange={handleChange}
                disabled={!!initialData}
                >
                <option value="">-- Chọn nhân sự --</option>
                {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                    {staff.staff_code} - {staff.full_name} ({staff.staff_type})
                    </option>
                ))}
                </select>
            </div>
            {fetchingStaff && <p className="text-xs text-blue-500 mt-1">Đang tải danh sách nhân viên...</p>}
          </div>

          {/* Chọn Vai trò */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Vai trò nhiệm vụ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <select
                name="role"
                required
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                value={formData.role}
                onChange={handleChange}
                >
                {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                ))}
                </select>
            </div>
          </div>

          {/* Ngày phân công */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ngày bắt đầu nhiệm vụ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input
                type="date"
                name="assignment_date"
                required
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                value={formData.assignment_date}
                onChange={handleChange}
                />
            </div>
          </div>

           {/* Ghi chú */}
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú (Tùy chọn)</label>
            <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400" size={18}/>
                <textarea
                name="notes"
                rows="3"
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all resize-none"
                value={formData.notes}
                onChange={handleChange}
                placeholder="VD: Phụ trách xe số 1, Lo vé máy bay..."
                ></textarea>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-sm text-blue-700 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5"/>
            <p className="leading-relaxed">
                Hệ thống sẽ tự động kiểm tra lịch trình của nhân sự để tránh trùng lặp.
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || fetchingStaff}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            {initialData ? 'Cập nhật' : 'Lưu phân công'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignmentModal;