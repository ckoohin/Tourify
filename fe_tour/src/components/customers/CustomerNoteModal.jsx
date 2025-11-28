import React from 'react';
import { FileText, X } from 'lucide-react';

const CustomerNoteModal = ({ isOpen, onClose, content, name }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/80">
          <h3 className="font-bold text-amber-800 flex items-center gap-2">
            <FileText size={18} className="text-amber-600"/> 
            Ghi chú đặc biệt
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-amber-100/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <span>Khách hàng:</span>
            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{name}</span>
          </div>
          
          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-gray-700 text-sm leading-relaxed shadow-inner min-h-[100px]">
            {content || "Không có nội dung ghi chú."}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-all shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerNoteModal;