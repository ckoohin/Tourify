import React from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'; 

const PermissionTable = ({ 
    permissions, 
    onEdit, 
    onDelete,
    currentPage,
    limit,
    totalPages,
    totalItems,
    onPageChange,
    onLimitChange,
}) => {
    const limitOptions = [10, 25, 50, 100];

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col">
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
                                    <button 
                                        onClick={() => onEdit(p)} 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        aria-label="Chỉnh sửa"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(p.id)} 
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        aria-label="Xóa"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalItems > 0 && (
                <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-white">
                    
                    <div className="text-sm text-slate-600 mb-2 sm:mb-0">
                        Hiển thị {startItem} đến {endItem} trên tổng {totalItems} quyền
                    </div>

                    <div className="flex items-center gap-4">
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            Hiển thị:
                            <select 
                                value={limit} 
                                onChange={(e) => onLimitChange(Number(e.target.value))} 
                                className="border border-slate-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                aria-label="Số mục trên mỗi trang"
                            >
                                {limitOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Trang trước"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <span className="text-sm font-medium text-slate-700 mx-2">
                                Trang {currentPage} / {totalPages}
                            </span>

                            <button 
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Trang sau"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {totalItems === 0 && !permissions.length && (
                <div className="p-8 text-center text-slate-500">
                    Không tìm thấy quyền nào.
                </div>
            )}
        </div>
    );
};

export default PermissionTable;