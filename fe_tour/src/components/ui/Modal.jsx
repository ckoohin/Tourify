import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  maxWidth = "max-w-md", // 1. Thêm giá trị mặc định
  confirmLevel = 'primary'
}) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const confirmButtonClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30',
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    >
      <div
        onClick={handleModalContentClick}
        // 2. Thay thế class cứng 'max-w-md' bằng biến 'maxWidth'
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer (Chỉ hiện nếu có onConfirm - dùng cho các modal xác nhận) */}
        {onConfirm && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 font-medium rounded-lg shadow-sm transition-colors ${confirmButtonClasses[confirmLevel]}`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;