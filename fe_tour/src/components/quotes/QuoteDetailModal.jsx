import React from 'react';
import { X, Printer, Share2 } from 'lucide-react';
import QuoteQR from '../common/QuoteQR';

const QuoteDetailModal = ({ isOpen, onClose, quote }) => {
  if (!isOpen || !quote) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

  const publicQuoteUrl = `${window.location.origin}/quotes/${quote.quote_number}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
            <div>
                <h3 className="font-bold text-lg text-slate-800">Chi tiết Báo Giá: {quote.quote_number}</h3>
                <p className="text-xs text-slate-500">Ngày tạo: {formatDate(quote.created_at)}</p>
            </div>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col md:flex-row gap-8">
                
                <div className="flex-1 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase">Khách hàng</h4>
                        <p className="font-medium text-slate-700">{quote.customer_name}</p>
                        <p className="text-sm text-slate-600">{quote.customer_phone} - {quote.customer_email}</p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase border-b pb-1">Thông tin Tour</h4>
                        <p className="font-medium text-slate-800">{quote.tour_name}</p>
                        <p className="text-sm text-slate-500">Mã: {quote.tour_code} | Phiên bản: {quote.version_name}</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase border-b pb-1">Chi phí</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Tổng giá trị:</span>
                            <span>{formatCurrency(quote.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1 text-green-600">
                            <span>Giảm giá:</span>
                            <span>-{formatCurrency(quote.discount_amount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-indigo-600 mt-2 pt-2 border-t border-dashed">
                            <span>Thành tiền:</span>
                            <span>{formatCurrency(quote.final_amount)}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-64 flex flex-col items-center space-y-6">
                    
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-2">Quét mã để xem online</p>
                        <QuoteQR 
                            value={publicQuoteUrl} 
                            size={180} 
                            fileName={`Quote-${quote.quote_number}`} 
                        />
                    </div>

                    <div className="w-full space-y-2 pt-4 border-t border-slate-100">
                        <button className="w-full py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50">
                            <Printer size={16}/> In Báo Giá
                        </button>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(publicQuoteUrl);
                                alert("Đã sao chép link báo giá!");
                            }}
                            className="w-full py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50"
                        >
                            <Share2 size={16}/> Copy Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Terms */}
            {quote.terms && (
                <div className="mt-8 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-xs text-slate-400 uppercase mb-2">Điều khoản & Ghi chú</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg">{quote.terms}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailModal;