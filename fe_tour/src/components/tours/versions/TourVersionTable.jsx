import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Check, Star, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import TourPriceManager from '../prices/TourPriceManager'; 

const TourVersionTable = ({ versions, tours, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };
  
  const getTourName = (tourId) => {
    const tour = tours.find(t => t.id === tourId);
    return tour ? tour.name : `Tour ID: ${tourId}`;
  };

  const formatDate = (dateString) => {
    if(!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTypeBadge = (type) => {
    const styles = {
        standard: 'bg-blue-100 text-blue-800',
        seasonal: 'bg-green-100 text-green-800',
        promotion: 'bg-orange-100 text-orange-800',
        special: 'bg-purple-100 text-purple-800'
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${styles[type] || 'bg-gray-100'}`}>{type}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
                <th className="px-4 py-3">Tên Phiên bản</th>
                <th className="px-4 py-3">Thuộc Tour</th>
                <th className="px-4 py-3">Loại & Thời gian</th>
                <th className="px-4 py-3 text-center">Mặc định</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
            {versions.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>
            ) : (
                versions.map(ver => (
                    <React.Fragment key={ver.id}>
                        <tr className={`transition-colors border-b border-slate-100 ${expandedId === ver.id ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                            <td className="px-4 py-3 font-medium text-slate-800">
                                {ver.name}
                                {ver.description && <p className="text-xs text-slate-400 font-normal truncate max-w-xs">{ver.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={getTourName(ver.tour_id)}>
                                {getTourName(ver.tour_id)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <div>{getTypeBadge(ver.type)}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar size={12}/> {formatDate(ver.valid_from)} - {formatDate(ver.valid_to)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {ver.is_default === 1 ? <Star size={16} className="text-yellow-500 fill-yellow-500 mx-auto"/> : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {ver.is_active === 1 ? (
                                    <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded"><Check size={12} className="mr-1"/> Active</span>
                                ) : (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Inactive</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => toggleExpand(ver.id)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors border ${
                                            expandedId === ver.id 
                                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                        title="Quản lý bảng giá"
                                    >
                                        <DollarSign size={14} />
                                        <span className="hidden sm:inline">Bảng giá</span>
                                        {expandedId === ver.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                    </button>

                                    <div className="h-5 w-px bg-slate-200 mx-1"></div>

                                    <button onClick={() => onEdit(ver)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa phiên bản"><Edit size={16}/></button>
                                    <button onClick={() => onDelete(ver.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa phiên bản"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>

                        {expandedId === ver.id && (
                            <tr>
                                <td colSpan="6" className="p-0 border-b border-slate-200">
                                    <div className="bg-slate-50/50 p-4 pl-8 animate-in slide-in-from-top-2 duration-200 border-l-4 border-blue-500">
                                         <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                            <div className="mb-3 flex items-center gap-2 text-slate-700 font-medium pb-2 border-b border-slate-100">
                                                <DollarSign size={16} className="text-emerald-600"/>
                                                Cấu hình giá cho phiên bản: <span className="font-bold text-blue-600">{ver.name}</span>
                                            </div>
                                            <TourPriceManager tourVersionId={ver.id} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))
            )}
        </tbody>
      </table>
    </div>
  );
};

export default TourVersionTable;