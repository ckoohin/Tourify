import React, { useState, useEffect } from 'react';
import { X, Save, User, Briefcase, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import staffService from '../../../services/api/staffService';
import staffAssignmentService from '../../../services/api/staffAssignmentService';

const AssignmentForm = ({ isOpen, onClose, onSuccess, departureId, departureDates }) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [checking, setChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null); 

  const [formData, setFormData] = useState({
    tour_departure_id: departureId,
    staff_id: '',
    role: 'tour_guide',
    assignment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load danh sách nhân viên
  useEffect(() => {
    if (isOpen) {
        const fetchStaff = async () => {
            try {
                const res = await staffService.getAll({ status: 'active', limit: 100 });
                if (res.success) setStaffList(res.data.staffs || []);
            } catch (e) { console.error(e); }
        };
        fetchStaff();
        
        setFormData({
            tour_departure_id: departureId,
            staff_id: '',
            role: 'tour_guide',
            assignment_date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setAvailabilityStatus(null);
    }
  }, [isOpen, departureId]);

  const getFilteredStaff = () => {
      const roleMap = {
          'tour_guide': 'tour_guide',
          'tour_leader': 'tour_leader',
          'driver': 'driver',
          'assistant': ['tour_guide', 'other'], 
          'coordinator': 'coordinator'
      };
      
      const requiredType = roleMap[formData.role];
      
      return staffList.filter(s => {
          if (Array.isArray(requiredType)) return requiredType.includes(s.staff_type);
          return s.staff_type === requiredType;
      });
  };

  // Check trùng lịch khi chọn nhân viên
  useEffect(() => {
      if (formData.staff_id && departureDates?.start && departureDates?.end) {
          const check = async () => {
              setChecking(true);
              try {
                  const res = await staffAssignmentService.checkAvailability(formData.staff_id, {
                      departure_date: departureDates.start,
                      return_date: departureDates.end
                  });
                  if (res.success) {
                      setAvailabilityStatus(res.data.is_available ? 'available' : 'busy');
                  }
              } catch (e) {
                  setAvailabilityStatus('unknown');
              } finally {
                  setChecking(false);
              }
          };
          check();
      } else {
          setAvailabilityStatus(null);
      }
  }, [formData.staff_id, departureDates]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (availabilityStatus === 'busy') {
          return toast.error("Nhân sự này đang bận trong khoảng thời gian tour!");
      }

      setLoading(true);
      try {
          await staffAssignmentService.create(formData);
          toast.success("Phân công thành công");
          onSuccess();
          onClose();
      } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi phân công");
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-indigo-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-indigo-800 flex items-center gap-2">
                <Briefcase size={20}/> Phân bổ Nhân sự
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Chọn Vai trò */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                <select 
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.role}
                    onChange={e => {
                        setFormData({...formData, role: e.target.value, staff_id: ''});
                        setAvailabilityStatus(null);
                    }}
                >
                    <option value="tour_guide">Hướng dẫn viên (Tour Guide)</option>
                    <option value="tour_leader">Trưởng đoàn (Tour Leader)</option>
                    <option value="driver">Tài xế (Driver)</option>
                    <option value="assistant">Trợ lý (Assistant)</option>
                    <option value="coordinator">Điều phối (Coordinator)</option>
                </select>
            </div>

            {/* Chọn Nhân viên */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhân sự</label>
                <select 
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.staff_id}
                    onChange={e => setFormData({...formData, staff_id: e.target.value})}
                    required
                >
                    <option value="">-- Chọn nhân sự --</option>
                    {getFilteredStaff().map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.staff_code})</option>
                    ))}
                </select>
                
                {/* Trạng thái check lịch */}
                {formData.staff_id && (
                    <div className="mt-2 text-xs flex items-center gap-1">
                        {checking ? (
                            <span className="text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Đang kiểm tra lịch...</span>
                        ) : availabilityStatus === 'available' ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Có thể nhận việc</span>
                        ) : availabilityStatus === 'busy' ? (
                            <span className="text-red-600 flex items-center gap-1 font-bold"><AlertCircle size={12}/> Đang bận lịch khác!</span>
                        ) : null}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày phân công</label>
                <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.assignment_date}
                    onChange={e => setFormData({...formData, assignment_date: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú công việc</label>
                <textarea 
                    className="w-full px-3 py-2 border rounded-lg" 
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="VD: Đón khách tại sân bay..."
                ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm font-medium">Hủy</button>
                <button 
                    type="submit" 
                    disabled={loading || availabilityStatus === 'busy'}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={16}/> Lưu Phân Công
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;