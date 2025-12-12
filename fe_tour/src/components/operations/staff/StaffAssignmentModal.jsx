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

  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        setFetchingStaff(true);
        try {
          const res = await staffService.getAll({ status: 'active', limit: 100 });
          
          let list = [];
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            list = res.data.data;
          } else if (res.data?.staff && Array.isArray(res.data.staff)) {
             list = res.data.staff;
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
        // Reset form
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
    
    setFormData(prev => {
        const newData = { ...prev, [name]: value };

        if (name === 'staff_id') {
            const selectedStaff = staffList.find(s => s.id == value);
            if (selectedStaff) {
                const matchingRole = ROLES.find(r => r.value === selectedStaff.staff_type);
                if (matchingRole) {
                    newData.role = matchingRole.value;
                }
            }
        }
        return newData;
    });
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
        staff_id: parseInt(formData.staff_id), 
        tour_departure_id: departureId
      };

      if (initialData) {
        await staffAssignmentService.update(initialData.id, payload);
        toast.success('Cập nhật phân công thành công');
      } else {
        await staffAssignmentService.create(payload);
        toast.success('Đã gửi thông báo phân công cho nhân sự'); 
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={20}/>
            {initialData ? 'Điều chỉnh Phân công' : 'Phân công Nhân sự'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
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
                className={`w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${initialData ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                value={formData.staff_id}
                onChange={handleChange}
                disabled={!!initialData}
                >
                <option value="">-- Chọn nhân sự từ danh sách --</option>
                {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                    {staff.full_name} - {staff.staff_code} ({staff.staff_type === 'tour_guide' ? 'HDV' : staff.staff_type === 'driver' ? 'Lái xe' : staff.staff_type})
                    </option>
                ))}
                </select>
            </div>
            {fetchingStaff && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><span className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></span> Đang tải danh sách...</p>}
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
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
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
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                value={formData.assignment_date}
                onChange={handleChange}
                />
            </div>
          </div>

           {/* Ghi chú */}
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú công việc</label>
            <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400" size={18}/>
                <textarea
                name="notes"
                rows="3"
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all resize-none"
                value={formData.notes}
                onChange={handleChange}
                placeholder="VD: Phụ trách xe số 1, Đón khách tại sân bay..."
                ></textarea>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-xs text-blue-700 items-start">
            <AlertCircle size={16} className="shrink-0 mt-0.5"/>
            <p className="leading-relaxed">
                Sau khi lưu, nhân sự sẽ nhận được thông báo về lịch trình này trên trang "Lịch công tác của tôi". Hệ thống sẽ tự động kiểm tra trùng lịch.
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm text-sm font-bold text-slate-600 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || fetchingStaff}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            {initialData ? 'Lưu thay đổi' : 'Xác nhận phân công'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignmentModal;