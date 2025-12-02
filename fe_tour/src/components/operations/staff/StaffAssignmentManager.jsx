import React, { useState } from 'react';
import { Plus, User, Phone, Trash2, Check, Shield, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import staffAssignmentService from '../../../services/api/staffAssignmentService';
import AssignmentForm from './AssignmentForm';

const StaffAssignmentManager = ({ departureId, assignments = [], onRefresh, departureDates }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa phân công này?")) return;
    try {
        await staffAssignmentService.delete(id);
        toast.success("Đã xóa");
        onRefresh();
    } catch (e) { toast.error("Lỗi xóa"); }
  };

  const handleConfirm = async (id) => {
    try {
        await staffAssignmentService.confirm(id);
        toast.success("Đã xác nhận");
        onRefresh();
    } catch (e) { toast.error("Lỗi xác nhận"); }
  };

  // Group assignments by role type for better UI
  const grouped = {
      leader: assignments.filter(a => a.role === 'tour_leader'),
      guide: assignments.filter(a => a.role === 'tour_guide'),
      driver: assignments.filter(a => a.role === 'driver'),
      other: assignments.filter(a => !['tour_leader','tour_guide','driver'].includes(a.role))
  };

  const renderCard = (item) => (
    <div key={item.id} className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg mb-2 hover:shadow-sm transition-shadow">
        <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                item.role === 'driver' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            }`}>
                <User size={20}/>
            </div>
            <div>
                <div className="font-bold text-slate-800 text-sm">{item.full_name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Phone size={10}/> {item.phone}</span>
                    <span className="bg-slate-100 px-1.5 rounded text-[10px] border uppercase">{item.staff_code}</span>
                </div>
                {item.notes && <div className="text-xs text-slate-500 italic mt-1">Note: {item.notes}</div>}
            </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
            <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                item.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
                {item.confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </div>
            <div className="flex gap-1 mt-1">
                {!item.confirmed && (
                    <button onClick={() => handleConfirm(item.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Xác nhận">
                        <Check size={14}/>
                    </button>
                )}
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa">
                    <Trash2 size={14}/>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Nhân sự & Điều hành</h3>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
                <Plus size={16}/> Phân công mới
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
            {/* Nhóm Dẫn đoàn */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Shield size={16}/> Ban Quản Lý Tour
                </h4>
                {grouped.leader.length === 0 && grouped.guide.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-lg text-slate-400 text-xs">Chưa có trưởng đoàn/HDV</div>
                )}
                {grouped.leader.map(renderCard)}
                {grouped.guide.map(renderCard)}
            </div>

            {/* Nhóm Vận chuyển */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <MapPin size={16}/> Vận chuyển
                </h4>
                {grouped.driver.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-lg text-slate-400 text-xs">Chưa có tài xế</div>
                )}
                {grouped.driver.map(renderCard)}
            </div>

            {/* Nhóm Khác */}
            {grouped.other.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Khác</h4>
                    {grouped.other.map(renderCard)}
                </div>
            )}
        </div>

        <AssignmentForm 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={onRefresh}
            departureId={departureId}
            departureDates={departureDates}
        />
    </div>
  );
};

export default StaffAssignmentManager;