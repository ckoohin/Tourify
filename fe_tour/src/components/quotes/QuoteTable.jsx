import React from 'react';
import { Eye, ChevronDown } from 'lucide-react';

const QuoteTable = ({ quotes, onView, onUpdateStatus }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const STATUS_CONFIG = {
    draft: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    sent: { label: 'Đã gửi', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted: { label: 'Đã chốt', className: 'bg-green-100 text-green-700 border-green-200' },
    rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700 border-red-200' },
    expired: { label: 'Hết hạn', className: 'bg-orange-100 text-orange-800 border-orange-200' }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Mã BG</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Tour & Phiên bản</th>
                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                    <th className="px-4 py-3 text-center">Ngày tạo</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {quotes.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-slate-500">Chưa có báo giá nào.</td></tr>
                ) : (
                    quotes.map(quote => (
                        <tr key={quote.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 font-mono text-blue-600 font-bold whitespace-nowrap">
                                {quote.quote_number}
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium text-slate-800 line-clamp-1">{quote.customer_name}</div>
                                <div className="text-xs text-slate-500">{quote.customer_email}</div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-slate-700 line-clamp-1 max-w-[200px]" title={quote.tour_name}>{quote.tour_code}</div>
                                <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                    {quote.version_name || 'Standard'}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                                {formatCurrency(quote.final_amount)}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 text-xs whitespace-nowrap">
                                {formatDate(quote.created_at)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="relative inline-block w-full max-w-[110px]">
                                    <select
                                        value={quote.status}
                                        onChange={(e) => onUpdateStatus && onUpdateStatus(quote.id, e.target.value)}
                                        className={`
                                            w-full appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase border 
                                            cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                            transition-all hover:brightness-95 text-center
                                            ${STATUS_CONFIG[quote.status]?.className || 'bg-gray-100 text-gray-600'}
                                        `}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key} className="bg-white text-slate-700 font-medium py-1">
                                                {config.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <ChevronDown size={12} className={quote.status === 'sent' || quote.status === 'accepted' || quote.status === 'rejected' ? 'text-current' : 'text-slate-500'} />
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => onView(quote)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteTable;