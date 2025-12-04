import React from 'react';

const STATUS_CONFIG = {
  scheduled: { label: 'Dự kiến', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmed: { label: 'Chắc chắn', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  in_progress: { label: 'Đang đi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
};

const DepartureStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default DepartureStatusBadge;