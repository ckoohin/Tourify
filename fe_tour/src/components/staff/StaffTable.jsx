import React from 'react';
import { Edit, Trash2, Star, Phone, Mail, Bus, User, Map, Eye } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const StaffTable = ({ staffList, onDelete, onEdit, onViewDetail }) => {
  
  const getRoleIcon = (type) => {
    switch(type) {
        case 'driver': return <Bus size={14} className="text-purple-600"/>;
        case 'tour_guide': return <Map size={14} className="text-green-600"/>;
        default: return <User size={14} className="text-blue-600"/>;
    }
  };

  const getRoleName = (type) => {
    const map = {
        tour_guide: 'HDV',
        tour_leader: 'Trưởng đoàn',
        driver: 'Tài xế',
        coordinator: 'Điều hành',
        other: 'Khác'
    };
    return map[type] || type;
  };

  const getStatusLevel = (status) => {
      if (status === 'active') return 'success';
      if (status === 'on_leave') return 'warning';
      return 'danger';
  };

  if (!staffList || staffList.length === 0) {
    return <div className="text-center p-8 text-slate-500">Không tìm thấy nhân viên nào.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
          <tr>
            <th className="p-4">Nhân viên</th>
            <th className="p-4">Vai trò</th>
            <th className="p-4">Liên hệ</th>
            <th className="p-4">Kỹ năng / Xe</th>
            <th className="p-4 text-center">Đánh giá</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {staffList.map((staff) => (
            <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {staff.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{staff.full_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{staff.staff_code}</div>
                  </div>
                </div>
              </td>
              
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    {getRoleIcon(staff.staff_type)}
                    {getRoleName(staff.staff_type)}
                </span>
              </td>

              <td className="p-4">
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1"><Phone size={12}/> {staff.phone}</div>
                    {staff.email && <div className="flex items-center gap-1"><Mail size={12}/> {staff.email}</div>}
                </div>
              </td>

              <td className="p-4 max-w-xs">
                <div className="flex flex-wrap gap-1">
                    {staff.staff_type === 'driver' ? (
                        <>
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] border border-purple-100">Bằng {staff.driver_license_class}</span>
                            {staff.vehicle_types && staff.vehicle_types.map((v, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] border">{v}</span>
                            ))}
                        </>
                    ) : (
                        staff.languages && staff.languages.map((lang, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] border border-orange-100">{lang}</span>
                        ))
                    )}
                </div>
              </td>

              <td className="p-4 text-center">
                <div className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                    {staff.rating || '0.0'}
                </div>
                <div className="text-[10px] text-slate-400">{staff.total_tours} tour</div>
              </td>

              <td className="p-4">
                <StatusBadge level={getStatusLevel(staff.status)} text={staff.status === 'active' ? 'Hoạt động' : (staff.status === 'on_leave' ? 'Nghỉ phép' : 'Đã nghỉ')} />
              </td>

              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onViewDetail && onViewDetail(staff)} 
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(staff)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(staff.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;