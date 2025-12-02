import React from 'react';
import { X, Calendar, User, DollarSign, MapPin, FileText, Clock, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge'; // Đảm bảo bạn đã có component này hoặc xóa dòng này nếu không dùng

const BookingDetailModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hàm phân tích cú pháp internal_notes để lấy lịch sử và ảnh
  const parseHistory = (notes) => {
    if (!notes) return [];
    // Chỉ lấy các dòng bắt đầu bằng dấu [ (Format do mình quy định khi lưu log)
    return notes.split('\n')
        .filter(line => line.trim().startsWith('['))
        .map(line => {
            // Regex để tách URL ảnh: tìm chuỗi bắt đầu bằng http/https sau từ khóa "Ảnh: "
            const imgMatch = line.match(/Ảnh: (https?:\/\/[^\s]+)/);
            const imgUrl = imgMatch ? imgMatch[1] : null;
            
            // Làm sạch text hiển thị: Xóa phần URL ảnh đi cho gọn
            let text = line;
            if (imgUrl) {
                text = text.replace(`Ảnh: ${imgUrl}`, '').trim();
            } else {
                text = text.replace('Ảnh: Không', '').trim();
            }
            
            // Xóa dấu chấm hoặc khoảng trắng thừa ở cuối
            if (text.endsWith('.')) text = text.slice(0, -1);

            return { text, imgUrl };
        })
        .reverse(); // Đảo ngược để đưa lịch sử mới nhất lên đầu
  };

  const histories = parseHistory(booking.internal_notes);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-800">Chi tiết Booking</h2>
                <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {booking.booking_code}
                </span>
            </div>
            <div className="flex gap-2 text-xs text-slate-500">
                <span>Ngày tạo: {formatDate(booking.created_at)}</span>
                <span>•</span>
                <span>Trạng thái: <b className="uppercase">{booking.status}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body - Có thanh cuộn */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* 1. Thông tin chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <User size={16} className="text-blue-500"/> Thông tin Khách hàng
                    </h3>
                    <div className="text-sm space-y-1.5 text-slate-600">
                        <p className="flex justify-between"><span className="text-slate-400">Tên:</span> <span className="font-medium text-slate-800">{booking.customer_name || `ID: ${booking.customer_id}`}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Số khách:</span> <span className="font-medium">{booking.total_guests} người</span></p>
                        <div className="text-xs text-slate-400 text-right">({booking.total_adults} Lớn, {booking.total_children} Trẻ em)</div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <MapPin size={16} className="text-red-500"/> Thông tin Tour
                    </h3>
                    <div className="text-sm space-y-1.5 text-slate-600">
                        <p className="flex justify-between"><span className="text-slate-400">Phiên bản Tour:</span> <span className="font-medium">{booking.tour_version_id}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Ngày đi:</span> <span className="font-medium">{formatDate(booking.departure_date)}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Tổng tiền:</span> <span className="font-bold text-emerald-600">{formatCurrency(booking.total_amount)}</span></p>
                    </div>
                </div>
            </div>

            {/* 2. Timeline Lịch sử & Ảnh */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Clock size={18} className="text-blue-600"/> Lịch sử xử lý & Minh chứng
                </h3>
                
                {histories.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed">
                        Chưa có lịch sử cập nhật nào được ghi lại.
                    </div>
                ) : (
                    <div className="space-y-6 pl-2">
                        {histories.map((item, idx) => (
                            <div key={idx} className="relative pl-6 border-l-2 border-slate-200 pb-2 last:border-0 last:pb-0">
                                {/* Dot */}
                                <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-400 ring-2 ring-blue-50"></div>
                                
                                <div className="text-sm">
                                    {/* Nội dung text */}
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
                                        {item.text}
                                    </div>
                                    
                                    {/* Hiển thị ảnh nếu có */}
                                    {item.imgUrl && (
                                        <div className="mt-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                                <ImageIcon size={12}/> Ảnh minh chứng
                                            </div>
                                            <a 
                                                href={item.imgUrl} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-block group relative overflow-hidden rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all"
                                            >
                                                <img 
                                                    src={item.imgUrl} 
                                                    alt="Proof" 
                                                    className="h-40 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
                onClick={onClose} 
                className="px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 text-slate-700 transition-colors"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;