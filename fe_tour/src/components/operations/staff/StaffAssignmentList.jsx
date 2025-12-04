import React from 'react';
import { User, Bus, Flag, Users, ShieldCheck, Edit, Trash2, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StaffAssignmentList = ({ assignments, onEdit, onDelete }) => {
  
  const getRoleConfig = (role) => {
    switch (role) {
      case 'tour_leader': return { icon: Flag, label: 'Trưởng đoàn', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'tour_guide': return { icon: User, label: 'Hướng dẫn viên', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'driver': return { icon: Bus, label: 'Lái xe', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'assistant': return { icon: Users, label: 'Phụ tá', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'coordinator': return { icon: ShieldCheck, label: 'Điều hành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      default: return { icon: User, label: role, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Users size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Chưa có nhân sự nào được phân công.</p>
        <p className="text-slate-400 text-sm">Vui lòng bấm nút "Phân công Mới" để thêm nhân sự.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {assignments.map((item) => {
        const { icon: RoleIcon, label, bg, text, border } = getRoleConfig(item.role);
        
        return (
          <div key={item.id} className={`relative group border rounded-xl p-4 transition-all hover:shadow-md bg-white ${border}`}>
            {/* Role Header */}
            <div className="flex justify-between items-start mb-3">
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${bg} ${text}`}>
                  <RoleIcon size={14} /> {label}
              </div>
              
              {/* Actions */}
              {(onEdit || onDelete) && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-white shadow-sm border rounded-lg p-0.5">
                    {onEdit && (
                      <button 
                          onClick={() => onEdit(item)}
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="Chỉnh sửa"
                      >
                          <Edit size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Xóa bỏ"
                      >
                          <Trash2 size={14} />
                      </button>
                    )}
                  </div>
              )}
            </div>

            {/* Staff Info */}
            <div className="mb-3">
              <h4 className="font-bold text-slate-800 text-base">{item.full_name}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{item.staff_code}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 text-sm text-slate-600 mb-3">
              <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400"/> 
                  <span className="truncate">{item.phone}</span>
              </div>
              {item.email && (
                  <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400"/> 
                      <span className="truncate max-w-[200px]" title={item.email}>{item.email}</span>
                  </div>
              )}
            </div>

            {/* Footer: Date & Status */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500" title="Ngày bắt đầu nhiệm vụ">
                  <Clock size={12}/> {new Date(item.assignment_date).toLocaleDateString('vi-VN')}
              </div>
              
              {item.confirmed ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle size={12}/> Đã nhận
                  </span>
              ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <AlertCircle size={12}/> Chờ nhận
                  </span>
              )}
            </div>

            {/* Notes display */}
            {item.notes && (
                <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-500 italic border border-slate-100 line-clamp-2">
                    "{item.notes}"
                </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default StaffAssignmentList;