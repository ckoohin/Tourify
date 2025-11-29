import React from 'react';
import { Phone, Mail, Eye, MoreHorizontal, FileText, Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const CustomerTable = ({ customers, loading, onViewNote, onEdit, onDelete }) => {
  
  const getTypeConfig = (type) => {
    const map = {
      individual: { level: 'primary', label: 'Cá nhân' },   
      company: { level: 'purple', label: 'Doanh nghiệp' },  
      agent: { level: 'orange', label: 'Đại lý' }           
    };
    return map[type] || { level: 'info', label: type };
  };

  return (
    <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="p-4 border-b border-gray-200">Mã KH</th>
              <th className="p-4 border-b border-gray-200">Thông tin khách hàng</th>
              <th className="p-4 border-b border-gray-200">Liên hệ</th>
              <th className="p-4 border-b border-gray-200">Loại</th>
              <th className="p-4 border-b border-gray-200 text-center">Ghi chú</th>
              <th className="p-4 border-b border-gray-200 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy dữ liệu phù hợp</td></tr>
            ) : (
              customers.map((cust) => {
                const typeConfig = getTypeConfig(cust.customer_type);
                
                return (
                  <tr key={cust.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-mono text-gray-500 font-medium">{cust.customer_code || `#${cust.id}`}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{cust.full_name}</div>
                      {cust.company_name && (
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">🏢 {cust.company_name}</div>
                      )}
                      {cust.is_vip === 1 && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded border border-yellow-200">VIP</span>}
                      {cust.is_blacklist === 1 && <span className="ml-2 text-[10px] bg-red-100 text-red-800 px-1.5 rounded border border-red-200">Blacklist</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={14} className="text-gray-400" /> <span>{cust.phone}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Mail size={14} className="text-gray-400" /> <span>{cust.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge level={typeConfig.level} text={typeConfig.label} />
                    </td>
                    <td className="p-4 text-center">
                      {cust.notes ? (
                        <button 
                          onClick={() => onViewNote(cust)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 rounded-md text-xs font-medium transition-all border border-amber-200/50"
                          title="Xem ghi chú đặc biệt"
                        >
                          <FileText size={14} /> 
                          <span>Chi tiết</span>
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Nút Sửa */}
                        <button 
                          onClick={() => onEdit(cust)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                          title="Sửa thông tin"
                        >
                          <Edit size={18} />
                        </button>
                        {/* Nút Xóa */}
                        <button 
                          onClick={() => onDelete(cust.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                          title="Xóa khách hàng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;