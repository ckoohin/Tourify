import React from 'react';
import { X } from 'lucide-react';

/**
 * Component Modal (Cửa sổ bật lên) có thể tái sử dụng.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Trạng thái Bật/Tắt của modal.
 * @param {function} props.onClose - Hàm được gọi khi đóng modal (click 'x' hoặc overlay).
 * @param {function} [props.onConfirm] - (Tùy chọn) Hàm được gọi khi click nút Xác nhận.
 * @param {string} props.title - Tiêu đề của modal.
 * @param {React.ReactNode} props.children - Nội dung (thân) của modal.
 * @param {string} [props.confirmText="Xác nhận"] - Văn bản cho nút xác nhận.
 * @param {string} [props.cancelText="Hủy bỏ"] - Văn bản cho nút hủy.
 * @param {'primary' | 'danger'} [props.confirmLevel='primary'] - Kiểu của nút xác nhận ('primary' hoặc 'danger').
 */
const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  confirmLevel = 'primary'
}) => {
  // Nếu modal không mở, không render gì cả
  if (!isOpen) {
    return null;
  }

  // Ngăn việc click vào nội dung modal làm đóng modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Lớp CSS cho nút xác nhận dựa trên 'level'
  const confirmButtonClasses = {
    primary: 'bg-primary text-white hover:bg-blue-600 shadow-blue-500/30',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30',
  };

  return (
    // Lớp phủ (Backdrop/Overlay)
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300 ease-out"
      // Thêm hiệu ứng fade-in
      style={{ opacity: isOpen ? 1 : 0 }}
    >
      {/* Khung nội dung Modal */}
      <div
        onClick={handleModalContentClick}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 ease-out"
        // Thêm hiệu ứng zoom-in
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
      >
        {/* === Header === */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === Body === */}
        <div className="p-5 text-sm text-slate-600">
          {children}
        </div>

        {/* === Footer (Nút bấm) === */}
        <div className="flex items-center justify-end gap-3 p-5 bg-slate-50 rounded-b-2xl border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          
          {/* Chỉ hiển thị nút Xác nhận nếu có hàm onConfirm */}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 font-medium rounded-lg shadow-sm transition-colors ${confirmButtonClasses[confirmLevel]}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;