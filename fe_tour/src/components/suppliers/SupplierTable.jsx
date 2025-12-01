import React from 'react';
import { Edit, Trash2, Star, Phone, MapPin, Hotel, Utensils, Bus, Map as MapIcon, ShieldCheck, FileText } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const SupplierTable = ({ suppliers, onDelete, onEdit }) => {
  
  const getTypeIcon = (type) => {
    switch(type) {
        case 'hotel': return <Hotel size={14} className="text-blue-600"/>;
        case 'restaurant': return <Utensils size={14} className="text-orange-600"/>;
        case 'transport': return <Bus size={14} className="text-purple-600"/>;
        case 'attraction': return <MapIcon size={14} className="text-green-600"/>;
        case 'insurance': return <ShieldCheck size={14} className="text-red-600"/>;
        default: return <FileText size={14} className="text-slate-600"/>;
    }
  };

  const getTypeName = (type) => {
    const map = {
        hotel: 'Khách sạn', restaurant: 'Nhà hàng', transport: 'Vận chuyển',
        attraction: 'Tham quan', visa: 'Visa', insurance: 'Bảo hiểm', other: 'Khác'
    };
    return map[type] || type;
  };

  const getStatusConfig = (status) => {
      if (status === 'active') return { level: 'success', text: 'Active' };
      if (status === 'blacklist') return { level: 'danger', text: 'Blacklist' };
      return { level: 'info', text: 'Inactive' };
  };

  if (!suppliers || suppliers.length === 0) {
    return <div className="text-center p-8 text-slate-500">Không tìm thấy nhà cung cấp nào.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
          <tr>
            <th className="p-4">Nhà cung cấp</th>
            <th className="p-4">Loại hình</th>
            <th className="p-4">Liên hệ</th>
            <th className="p-4">Địa chỉ</th>
            <th className="p-4 text-center">Đánh giá</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {suppliers.map((sup) => {
             const statusConf = getStatusConfig(sup.status);
             return (
                <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                    <div className="font-semibold text-slate-800">{sup.company_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{sup.code}</div>
                    {sup.tax_code && <div className="text-[10px] text-slate-400">MST: {sup.tax_code}</div>}
                </td>
                
                <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 capitalize">
                        {getTypeIcon(sup.type)}
                        {getTypeName(sup.type)}
                    </span>
                </td>

                <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <div className="font-medium text-slate-700">{sup.contact_person}</div>
                        <div className="flex items-center gap-1"><Phone size={12}/> {sup.phone}</div>
                    </div>
                </td>

                <td className="p-4 max-w-xs truncate" title={sup.address}>
                   <div className="flex items-center gap-1 text-slate-600 text-xs">
                      <MapPin size={12} className="shrink-0"/> 
                      <span className="truncate">{sup.city || '---'}</span>
                   </div>
                </td>

                <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                        {sup.rating || '0.0'}
                    </div>
                    <div className="text-[10px] text-slate-400">{sup.total_bookings || 0} đơn</div>
                </td>

                <td className="p-4">
                    <StatusBadge level={statusConf.level} text={statusConf.text} />
                </td>

                <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => onEdit(sup)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(sup.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={18} /></button>
                    </div>
                </td>
                </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;