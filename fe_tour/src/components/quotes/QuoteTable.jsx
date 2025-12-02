import React from 'react';
import { Eye, FileText, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

const QuoteTable = ({ quotes, onView, onUpdateStatus }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const styles = {
        draft: 'bg-slate-100 text-slate-600',
        sent: 'bg-blue-100 text-blue-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        expired: 'bg-orange-100 text-orange-800'
    };
    const labels = {
        draft: 'Bản nháp',
        sent: 'Đã gửi',
        accepted: 'Đã chốt',
        rejected: 'Từ chối',
        expired: 'Hết hạn'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
                <th className="px-4 py-3">Mã BG</th>
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
                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-blue-600 font-bold">
                            {quote.quote_number}
                        </td>
                        <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{quote.customer_name}</div>
                            <div className="text-xs text-slate-500">{quote.customer_email}</div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="text-slate-700 line-clamp-1" title={quote.tour_name}>{quote.tour_code}</div>
                            <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                {quote.version_name || 'Standard'}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            {formatCurrency(quote.final_amount)}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500 text-xs">
                            {formatDate(quote.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                            {getStatusBadge(quote.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                                {quote.status === 'draft' && (
                                    <button 
                                        onClick={() => onUpdateStatus(quote.id, 'sent')}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                                        title="Đánh dấu đã gửi"
                                    >
                                        <Send size={16}/>
                                    </button>
                                )}
                                <button 
                                    onClick={() => onView(quote)}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={16}/>
                                </button>
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

export default QuoteTable;