import React from 'react';

/**
 * Component StatusBadge (Huy hiệu Trạng thái) có thể tái sử dụng.
 *
 * @param {object} props
 * @param {string} props.text - Nội dung văn bản hiển thị (ví dụ: "Đang mở bán", "Chờ xác nhận").
 * @param {'success' | 'warning' | 'danger' | 'info' | 'primary'} [props.level='info'] - 
 * Cấp độ của huy hiệu, quyết định màu sắc:
 * - 'success': Xanh lá (Hoàn thành, Đang hoạt động, Đã thanh toán)
 * - 'warning': Vàng/Cam (Chờ, Sắp hết)
 * - 'danger': Đỏ (Hủy, Đã đóng, Lỗi)
 * - 'info': Xám/Bạc (Bản nháp, Mặc định)
 * - 'primary': Xanh dương (Thông tin, Mới)
 * @param {string} [props.className] - (Tùy chọn) Các lớp CSS bổ sung nếu cần tùy chỉnh thêm.
 */
const StatusBadge = ({ text, level = 'info', className = '' }) => {
  
  // Ánh xạ (Mapping) từ 'level' sang các lớp Tailwind CSS
  // Dựa trên thiết kế trong ListTour.html và Dashboard.jsx
  const colorClasses = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-slate-100 text-slate-600 border border-slate-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
  };

  // Lớp CSS cơ bản (Base classes)
  // Giống như trong Dashboard.jsx: RecentBookingsTable
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

  // Lấy lớp màu sắc tương ứng, hoặc dùng 'info' làm mặc định
  const levelClasses = colorClasses[level] || colorClasses.info;

  return (
    <span className={`${baseClasses} ${levelClasses} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;