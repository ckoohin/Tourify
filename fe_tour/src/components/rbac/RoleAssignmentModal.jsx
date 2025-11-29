import React from 'react';
import { X, Check, Shield, Lock } from 'lucide-react';

const RoleAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  roleName,     
  roleSlug,     
  allPermissions, 
  selectedIds, 
  onToggle, 
  loading 
}) => {
  if (!isOpen) return null;

  
  const ADMIN_ONLY_PERMISSIONS = [
    'roles.view', 
    'permissions.view', 
    'roles.assign-permissions', 
    'roles.revoke-permissions', 
    'permissions.delete', 
    'roles.delete', 
    'permissions.create', 
    'permissions.edit',
    'roles.create',
    'roles.edit'
  ];

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
                const isChecked = selectedIds.includes(perm.id);
                
                const isAdminOnly = ADMIN_ONLY_PERMISSIONS.includes(perm.slug);
                
                let isDisabled = false;
                let forcedState = null; // null: ko ép, true: ép check, false: ép bỏ check
                let noticeText = "";
                let noticeColor = "text-orange-600";

                if (isAdminOnly) {
                  if (roleSlug === 'admin') {
                    isDisabled = true;
                    forcedState = true; 
                    noticeText = "Quyền mặc định của Admin";
                    noticeColor = "text-blue-600";
                  } else {
                    isDisabled = true;
                    forcedState = false;
                    noticeText = "Chỉ dành cho Admin";
                    noticeColor = "text-red-500";
                  }
                }

                const finalChecked = (forcedState !== null) ? forcedState : isChecked;

                return (
                  <div 
                    key={perm.id} 
                    onClick={() => {
                      if (!isDisabled) onToggle(perm.id);
                    }}
                    className={`
                      relative p-3 rounded-lg border transition-all select-none flex items-start gap-3 group
                      ${isDisabled ? 'opacity-80 bg-slate-50 cursor-not-allowed' : 'cursor-pointer bg-white hover:border-blue-400 hover:shadow-md'}
                      ${!isDisabled && finalChecked ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500 z-10' : ''}
                      ${!isDisabled && !finalChecked ? 'border-slate-200' : ''}
                    `}
                  >
                    <div className={`
                      mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                      ${finalChecked 
                        ? (isDisabled ? 'bg-slate-400 border-slate-400' : 'bg-blue-600 border-blue-600') 
                        : 'border-slate-300 bg-white'
                      }
                    `}>
                      {finalChecked && <Check size={12} className="text-white font-bold" />}
                      {isAdminOnly && !finalChecked && <Lock size={10} className="text-slate-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${finalChecked ? 'text-blue-900' : 'text-slate-700'} ${isDisabled ? 'text-slate-500' : ''}`}>
                        {perm.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1 bg-white/50 px-1.5 py-0.5 rounded w-fit truncate max-w-full" title={perm.slug}>
                        {perm.slug}
                      </p>
                      
                      {isAdminOnly && (
                        <p className={`text-[10px] font-medium mt-1.5 flex items-center gap-1 ${noticeColor}`}>
                          <Lock size={10} /> {noticeText}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center rounded-b-xl">
          <div className="text-sm text-slate-500">
            Đã chọn: <span className="font-bold text-blue-600 text-lg mx-1">{selectedIds.length}</span> quyền
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Đóng</button>
            <button onClick={onSave} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all flex items-center gap-2">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;