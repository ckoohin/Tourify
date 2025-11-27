import React from 'react';
import { X, Check, Shield } from 'lucide-react';

const RoleAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  roleName, 
  allPermissions, 
  selectedIds, // Mảng chứa các ID quyền đã được chọn (từ RoleList truyền vào)
  onToggle, 
  loading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Phân quyền hệ thống</h3>
              <p className="text-sm text-slate-500">
                Đang cấu hình cho: <span className="font-semibold text-slate-900 bg-yellow-100 px-2 py-0.5 rounded">{roleName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body: Danh sách quyền */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {allPermissions.map((perm) => {
                // LOGIC CHECKBOX: Kiểm tra xem ID quyền này có nằm trong danh sách đã chọn không
                const isChecked = selectedIds.includes(perm.id);
                
                return (
                  <div 
                    key={perm.id} 
                    onClick={() => onToggle(perm.id)}
                    className={`
                      relative p-3 rounded-lg border cursor-pointer transition-all select-none flex items-start gap-3 group
                      ${isChecked 
                        ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500 z-10' // Style khi được chọn (Màu xanh)
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md' // Style khi chưa chọn
                      }
                    `}
                  >
                    {/* Checkbox Icon */}
                    <div className={`
                      mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                      ${isChecked 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-slate-300 bg-white group-hover:border-blue-400'
                      }
                    `}>
                      {isChecked && <Check size={12} className="text-white font-bold" />}
                    </div>

                    {/* Nội dung quyền */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isChecked ? 'text-blue-800' : 'text-slate-700'}`}>
                        {perm.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 px-1.5 py-0.5 rounded w-fit truncate max-w-full" title={perm.slug}>
                        {perm.slug}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center rounded-b-xl">
          <div className="text-sm text-slate-500">
            Đã chọn: <span className="font-bold text-blue-600 text-lg mx-1">{selectedIds.length}</span> quyền
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>
            <button 
              onClick={onSave} 
              disabled={loading} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all flex items-center gap-2"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;