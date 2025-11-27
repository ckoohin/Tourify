import React from 'react';
import { Pencil, Trash2, Shield } from 'lucide-react';

const RoleTable = ({ roles, onEdit, onDelete, onAssign }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Tên Vai trò</th>
            <th className="px-6 py-3">Slug</th>
            <th className="px-6 py-3">Mô tả</th>
            <th className="px-6 py-3 text-center">Phân quyền</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id} className="bg-white border-b hover:bg-slate-50">
              <td className="px-6 py-4">{r.id}</td>
              <td className="px-6 py-4 font-bold text-slate-800">{r.name}</td>
              <td className="px-6 py-4 font-mono text-xs bg-slate-100 px-2 py-1 rounded w-fit">{r.slug}</td>
              <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{r.description}</td>
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => onAssign(r)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <Shield size={14} /> Cấu hình
                </button>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => onEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleTable;