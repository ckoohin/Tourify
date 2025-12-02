import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';

const TourPriceTable = ({ prices, onEdit, onDelete }) => {
  
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if(!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type) => {
    const map = {
        adult: { label: 'Người lớn', class: 'bg-blue-100 text-blue-800' },
        child: { label: 'Trẻ em', class: 'bg-green-100 text-green-800' },
        infant: { label: 'Em bé', class: 'bg-pink-100 text-pink-800' },
        senior: { label: 'Cao tuổi', class: 'bg-orange-100 text-orange-800' },
        group: { label: 'Đoàn thể', class: 'bg-purple-100 text-purple-800' },
    };
    const conf = map[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${conf.class}`}>{conf.label}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Giá niêm yết</th>
                <th className="px-4 py-3">Phạm vi khách</th>
                <th className="px-4 py-3">Hiệu lực</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
            {prices.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400 italic">Chưa có bảng giá nào</td></tr>
            ) : (
                prices.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                                <div>{getTypeLabel(item.price_type)}</div>
                                {item.description && <span className="text-xs text-slate-400">{item.description}</span>}
                            </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                            {formatCurrency(item.price, item.currency)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                            <div className="flex items-center gap-1">
                                <Users size={14} className="text-slate-400"/>
                                {item.min_pax || 1} - {item.max_pax || '∞'}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                            {(item.valid_from || item.valid_to) ? (
                                <span>{formatDate(item.valid_from)} <br/> {formatDate(item.valid_to)}</span>
                            ) : 'Luôn áp dụng'}
                        </td>
                        <td className="px-4 py-3 text-center">
                            {item.is_active === 1 ? (
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Đang hoạt động"></span>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" title="Tạm ngưng"></span>
                            )}
                        </td>
                        <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => onEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
      </table>
    </div>
  );
};

export default TourPriceTable;