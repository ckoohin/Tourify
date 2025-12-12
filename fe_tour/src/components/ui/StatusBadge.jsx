import React from 'react';

/**
 * 
 *
 * @param {object} props
 * @param {string} props.text 
 * @param {'success' | 'warning' | 'danger' | 'info' | 'primary' | 'purple' | 'orange'} [props.level='info'] 
 * @param {string} [props.className] 
 */
const StatusBadge = ({ text, level = 'info', className = '' }) => {
  
  const colorClasses = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-slate-100 text-slate-600 border border-slate-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    // Thêm các màu mới từ CustomerTable
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border border-orange-200',
  };

  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

  const levelClasses = colorClasses[level] || colorClasses.info;

  return (
    <span className={`${baseClasses} ${levelClasses} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;