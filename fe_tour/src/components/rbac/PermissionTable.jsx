import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const PermissionTable = ({ permissions, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Tên Quyền</th>
            <th className="px-6 py-3">Slug</th>
            <th className="px-6 py-3">Mô tả</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.id} className="bg-white border-b hover:bg-slate-50">
              <td className="px-6 py-4">{p.id}</td>
              <td className="px-6 py-4 font-semibold text-slate-700">{p.name}</td>
              <td className="px-6 py-4 font-mono text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded w-fit">{p.slug}</td>
              <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{p.description || '-'}</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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

export default PermissionTable;