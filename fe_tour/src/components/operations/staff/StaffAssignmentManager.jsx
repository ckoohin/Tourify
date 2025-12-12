import React, { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import StaffAssignmentList from './StaffAssignmentList';
import StaffAssignmentModal from './StaffAssignmentModal';
import staffAssignmentService from '../../../services/api/staffAssignmentService';

const StaffAssignmentManager = ({ 
  departureId, 
  assignments = [], 
  onRefresh, 
  departureDates,
  departureStatus 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const isReadOnly = departureStatus === 'cancelled' || departureStatus === 'completed';

  const handleCreate = () => {
    setSelectedAssignment(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedAssignment(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân sự này khỏi tour?')) return;
    try {
      await staffAssignmentService.delete(id);
      toast.success('Đã xóa phân công');
      onRefresh && onRefresh(); 
    } catch (error) {
      toast.error('Lỗi khi xóa phân công');
    }
  };

  const handleSuccess = () => {
    onRefresh && onRefresh();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Manager Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Đội ngũ Nhân sự <span className="text-slate-400 text-sm font-normal">({assignments.length})</span>
        </h2>
        
        {!isReadOnly && (
          <button 
            onClick={handleCreate}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <UserPlus size={16}/> Phân công Mới
          </button>
        )}
      </div>

      {/* List Content */}
      <div className="p-6">
        <StaffAssignmentList 
          assignments={assignments}
          onEdit={!isReadOnly ? handleEdit : null}
          onDelete={!isReadOnly ? handleDelete : null}
        />
      </div>

      {/* Modal Form */}
      <StaffAssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        departureId={departureId}
        initialData={selectedAssignment}
        defaultDate={departureDates?.start}
      />
    </div>
  );
};

export default StaffAssignmentManager;