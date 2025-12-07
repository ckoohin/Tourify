import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import bookingService from '../../services/api/bookingService';
import BookingCard from '../../components/bookings/kanban/BookingCard';
import StatusUpdateModal from '../../components/bookings/kanban/StatusUpdateModal';
import BookingDetailModal from '../../components/bookings/kanban/BookingDetailModal';

const COLUMNS = [
  { id: 'pending', title: 'Chờ xử lý', color: 'border-t-yellow-500 bg-yellow-50', headerInfo: 'bg-yellow-200 text-yellow-800' },
  { id: 'confirmed', title: 'Đã xác nhận', color: 'border-t-blue-500 bg-blue-50', headerInfo: 'bg-blue-200 text-blue-800' },
  { id: 'deposited', title: 'Đã cọc', color: 'border-t-purple-500 bg-purple-50', headerInfo: 'bg-purple-200 text-purple-800' },
  { id: 'paid', title: 'Đã thanh toán', color: 'border-t-green-500 bg-green-50', headerInfo: 'bg-green-200 text-green-800' },
  { id: 'completed', title: 'Hoàn thành', color: 'border-t-slate-500 bg-slate-50', headerInfo: 'bg-slate-200 text-slate-800' },
  { id: 'cancelled', title: 'Đã hủy', color: 'border-t-red-500 bg-red-50', headerInfo: 'bg-red-200 text-red-800' },
];

const BookingKanban = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Drag & Drop
  const [draggedBooking, setDraggedBooking] = useState(null);
  
  // State Modal Update
  const [modalInfo, setModalInfo] = useState({ open: false, targetStatus: null });

  // [MỚI] State Modal Detail
  const [detailBooking, setDetailBooking] = useState(null);

  // --- 1. Fetch Data ---
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAll(); 
      if (res.success) {
         setBookings(res.data.bookings || []);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. Drag & Drop Handlers ---
  const handleDragStart = (e, booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(booking));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    if (!draggedBooking || draggedBooking.status === statusId) return;
    setModalInfo({ open: true, targetStatus: statusId });
  };

  // --- 3. Update Handler ---
  const handleConfirmUpdate = async ({ notes, image_url }) => {
    if (!draggedBooking || !modalInfo.targetStatus) return;

    const toastId = toast.loading("Đang cập nhật...");
    try {
        const logEntry = `[${new Date().toLocaleString()}] Chuyển trạng thái: ${draggedBooking.status} -> ${modalInfo.targetStatus}. Ghi chú: ${notes}. Ảnh: ${image_url || 'Không'}`;
        
        const updatedNotes = (draggedBooking.internal_notes || '') + '\n' + logEntry;

        let formattedDate = draggedBooking.departure_date;
        if (draggedBooking.departure_date) {
            formattedDate = new Date(draggedBooking.departure_date).toISOString().split('T')[0];
        }

        // [FIX ERROR 500 & 400] Chuẩn bị payload sạch sẽ và đầy đủ
        const payload = {
            booking_code: draggedBooking.booking_code, 
            customer_id: Number(draggedBooking.customer_id),
            tour_version_id: Number(draggedBooking.tour_version_id),
            departure_date: formattedDate,
            total_adults: Number(draggedBooking.total_adults || 0),
            total_children: Number(draggedBooking.total_children || 0),
            total_infants: Number(draggedBooking.total_infants || 0),
            unit_price: Number(draggedBooking.unit_price || 0),
            total_amount: Number(draggedBooking.total_amount || 0),
            discount_amount: Number(draggedBooking.discount_amount || 0),
            paid_amount: Number(draggedBooking.paid_amount || 0),
            currency: draggedBooking.currency || 'VND',
            status: modalInfo.targetStatus, 
            special_requests: draggedBooking.special_requests,
            internal_notes: updatedNotes,
            cancel_reason: draggedBooking.cancel_reason,
            sales_person_id: draggedBooking.sales_person_id ? Number(draggedBooking.sales_person_id) : null,
            created_by: draggedBooking.created_by ? Number(draggedBooking.created_by) : 1, 
            booking_type: draggedBooking.booking_type,
        };

        await bookingService.update(draggedBooking.id, payload);
        
        toast.success("Cập nhật thành công!");
        fetchBookings(); 

    } catch (error) {
        console.error(error);
        // Hiển thị chi tiết lỗi validation từ backend nếu có
        let errorMsg = "Lỗi server";
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            errorMsg = error.response.data.errors.map(e => e.msg).join(", ");
        } else {
            errorMsg = error.response?.data?.message || "Lỗi server";
        }
        toast.error("Cập nhật thất bại: " + errorMsg);
    } finally {
        toast.dismiss(toastId);
        setModalInfo({ open: false, targetStatus: null });
        setDraggedBooking(null);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] p-4 bg-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Quản lý Tiến độ Booking</h1>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded border text-slate-500">
                Tổng: {bookings.length} đơn
            </span>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchBookings} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"><RefreshCw size={16}/></button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-6 gap-4 min-h-0">
        {COLUMNS.map((col) => {
            const colBookings = bookings.filter(b => b.status === col.id);
            return (
                <div 
                    key={col.id}
                    className={`flex flex-col rounded-xl border-t-4 ${col.color} overflow-hidden h-full shadow-sm border-x border-b border-slate-100`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="px-4 py-3 bg-white/50 border-b border-black/5 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-xs text-slate-700 uppercase truncate pr-2" title={col.title}>{col.title}</h3>
                        <span className={`${col.headerInfo} text-[10px] px-2 py-0.5 rounded-full font-bold`}>
                            {colBookings.length}
                        </span>
                    </div>

                    <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 transition-colors">
                        {colBookings.map(booking => (
                            <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onDragStart={handleDragStart}
                                onClick={(bk) => setDetailBooking(bk)}
                            />
                        ))}
                        {colBookings.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic opacity-60">
                                <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg mb-2"></div>
                                Trống
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>

      <StatusUpdateModal 
        isOpen={modalInfo.open}
        onClose={() => setModalInfo({ ...modalInfo, open: false })}
        onConfirm={handleConfirmUpdate}
        booking={draggedBooking}
        newStatus={modalInfo.targetStatus}
      />

      <BookingDetailModal 
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
        booking={detailBooking}
      />
    </div>
  );
};

export default BookingKanban;