import toast from 'react-hot-toast';
import React from 'react'; 
import { Trash2, X, AlertTriangle } from 'lucide-react';

export const showDeleteConfirm = (onConfirm, message = "Hành động này không thể hoàn tác.") => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-100`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
               <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-slate-900">Xác nhận xóa?</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <div className="mt-4 flex gap-3">
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        onConfirm(); 
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Trash2 size={14} /> Xóa ngay
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Hủy bỏ
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: 'top-center',
  });
};