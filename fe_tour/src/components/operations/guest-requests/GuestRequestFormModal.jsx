import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, MessageSquare, User, Info, BedDouble } from 'lucide-react';
import { REQUEST_TYPES, PRIORITIES } from './GuestRequestConfig';
import guestRequestService from '../../../services/api/guestRequestService';
import toast from 'react-hot-toast';

const GuestRequestFormModal = ({ isOpen, onClose, onSuccess, initialData, guests = [] }) => {
    const [formData, setFormData] = useState({
        booking_guest_id: '',
        request_type: 'dietary',
        priority: 'medium',
        title: '',
        description: '',
        notes: '', 
        status: 'pending' 
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState({ title: 0, description: 0, notes: 0 });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Mode: Edit
                setFormData({
                    booking_guest_id: initialData.booking_guest_id,
                    request_type: initialData.request_type,
                    priority: initialData.priority,
                    title: initialData.title,
                    description: initialData.description || '',
                    notes: initialData.notes || '',
                    status: initialData.status
                });
            } else {
                // Mode: Create
                // [LOGIC KHỚP VỚI GUEST LIST]
                // Ưu tiên lấy booking_guest_id vì bảng guest_special_requests quan hệ với bảng booking_guests
                // Trong danh sách tour_departure_guests, id thường là id của bảng trung gian, còn booking_guest_id mới là id khách
                const firstGuest = guests.length > 0 ? guests[0] : null;
                const firstGuestId = firstGuest ? (firstGuest.booking_guest_id || firstGuest.id) : '';

                setFormData({
                    booking_guest_id: firstGuestId,
                    request_type: 'dietary',
                    priority: 'medium',
                    title: '',
                    description: '',
                    notes: '',
                    status: 'pending'
                });
            }
        }
    }, [isOpen, initialData, guests]);

    // Cập nhật bộ đếm ký tự
    useEffect(() => {
        setCharCount({
            title: formData.title.length,
            description: (formData.description || '').length,
            notes: (formData.notes || '').length
        });
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.booking_guest_id) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            if (initialData) {
                await guestRequestService.update(initialData.id, formData);
                toast.success("Cập nhật yêu cầu thành công");
            } else {
                await guestRequestService.create(formData);
                toast.success("Tạo yêu cầu thành công");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || "Lỗi lưu dữ liệu";
            const details = error.response?.data?.errors?.[0]?.msg;
            toast.error(details ? `${message}: ${details}` : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper: Tìm tên khách hàng để hiển thị (cho mode Edit hoặc hiển thị trong dropdown)
    const getGuestLabel = (guest) => {
        if (!guest) return "";
        // [LOGIC DISPLAY KHỚP VỚI GUEST LIST]
        // Hiển thị: Tên - Booking Code - Số phòng (nếu có)
        const roomInfo = guest.room_number ? ` - P.${guest.room_number}` : '';
        const bookingInfo = guest.booking_code ? ` (${guest.booking_code})` : '';
        return `${guest.full_name}${bookingInfo}${roomInfo}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all scale-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">
                            {initialData ? 'Cập nhật yêu cầu' : 'Thêm yêu cầu đặc biệt'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Điền đầy đủ thông tin để bộ phận điều hành xử lý</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                </div>

                {/* Body - Scrollable */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Chọn Khách */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                            <User size={16} className="text-blue-600"/> Khách hàng <span className="text-red-500">*</span>
                        </label>
                        {initialData ? (
                            // Read-only khi Edit
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 font-medium flex justify-between items-center">
                                <span>
                                    {guests.find(g => (g.booking_guest_id == formData.booking_guest_id || g.id == formData.booking_guest_id))?.full_name || 'Khách hàng'}
                                </span>
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-500">Read-only</span>
                            </div>
                        ) : (
                            guests.length > 0 ? (
                                <div className="relative">
                                    <select 
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer appearance-none truncate pr-8"
                                        value={formData.booking_guest_id}
                                        onChange={e => setFormData({...formData, booking_guest_id: e.target.value})}
                                        required
                                    >
                                        {guests.map(g => (
                                            // [LOGIC ID] Sử dụng booking_guest_id nếu có (chuẩn), fallback về id
                                            <option key={g.id} value={g.booking_guest_id || g.id}>
                                                {getGuestLabel(g)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                    <AlertTriangle size={16}/> Không tìm thấy danh sách khách.
                                </div>
                            )
                        )}
                    </div>

                    {/* Loại yêu cầu & Mức độ ưu tiên */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại yêu cầu</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.request_type}
                                onChange={e => setFormData({...formData, request_type: e.target.value})}
                            >
                                {Object.entries(REQUEST_TYPES).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mức độ ưu tiên</label>
                            <select 
                                className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${
                                    formData.priority === 'critical' ? 'text-red-600 bg-red-50 border-red-200' : 
                                    formData.priority === 'high' ? 'text-orange-600' : 'text-slate-700 bg-white'
                                }`}
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                            >
                                {Object.entries(PRIORITIES).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tiêu đề */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-slate-700">Tiêu đề yêu cầu <span className="text-red-500">*</span></label>
                            <span className={`text-[10px] ${charCount.title > 255 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {charCount.title}/255
                            </span>
                        </div>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                            placeholder="VD: Dị ứng đậu phộng, Cần xe lăn, Phòng tầng thấp..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                            maxLength={255} 
                        />
                    </div>

                    {/* Mô tả chi tiết */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-slate-700">Chi tiết yêu cầu</label>
                            <span className={`text-[10px] ${charCount.description > 2000 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {charCount.description}/2000
                            </span>
                        </div>
                        <textarea 
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-400"
                            placeholder="Mô tả cụ thể về tình trạng khách, mức độ nghiêm trọng..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            maxLength={2000} 
                        />
                    </div>

                    {/* Ghi chú nội bộ */}
                    <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-yellow-600"/> 
                                Ghi chú nội bộ
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-normal border border-yellow-200">Staff Only</span>
                            </label>
                            <span className={`text-[10px] ${charCount.notes > 1000 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {charCount.notes}/1000
                            </span>
                        </div>
                        <textarea 
                            rows={2}
                            className="w-full border border-yellow-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none placeholder:text-slate-400 bg-white"
                            placeholder="Ghi chú xử lý cho bộ phận điều hành (VD: Đã báo nhà hàng, Khách VIP cần lưu ý...)"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            maxLength={1000}
                        />
                        <div className="flex gap-2 mt-2 text-[11px] text-slate-500">
                            <Info size={12} className="shrink-0 mt-0.5"/>
                            <span>Thông tin này chỉ hiển thị với nhân viên, khách hàng sẽ không nhìn thấy trên voucher hay ứng dụng.</span>
                        </div>
                    </div>

                    {/* Cảnh báo Priority */}
                    {formData.priority === 'critical' && (
                        <div className="flex gap-3 p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 items-start animate-pulse">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-600"/>
                            <span className="leading-snug">
                                <strong>Lưu ý quan trọng:</strong> Yêu cầu KHẨN CẤP sẽ được đánh dấu đỏ và đưa lên đầu danh sách. Chỉ sử dụng cho các trường hợp ảnh hưởng trực tiếp đến sức khỏe hoặc an toàn.
                            </span>
                        </div>
                    )}
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm text-sm font-bold transition-all">
                        Hủy
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={isSubmitting} 
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={18}/>} 
                        {initialData ? 'Lưu thay đổi' : 'Tạo yêu cầu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestRequestFormModal;