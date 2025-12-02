import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import bookingService from '../../services/api/bookingService';
import BookingCard from '../../components/bookings/kanban/BookingCard';
import StatusUpdateModal from '../../components/bookings/kanban/StatusUpdateModal';
import BookingDetailModal from '../../components/bookings/kanban/BookingDetailModal';

const COLUMNS = [
  { id: 'pending', title: 'Chờ xử lý', color: 'border-t-yellow-400 bg-yellow-50' },
  { id: 'confirmed', title: 'Đã xác nhận', color: 'border-t-blue-400 bg-blue-50' },
  { id: 'deposited', title: 'Đã cọc', color: 'border-t-indigo-400 bg-indigo-50' },
  { id: 'paid', title: 'Đã thanh toán', color: 'border-t-green-400 bg-green-50' },
  { id: 'completed', title: 'Hoàn thành', color: 'border-t-slate-400 bg-slate-50' },
  { id: 'cancelled', title: 'Đã hủy', color: 'border-t-red-400 bg-red-50' },
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
        // [FIX QUAN TRỌNG] Lưu URL ảnh vào log thay vì chữ 'Có' để sau này parse ra hiển thị được
        const logEntry = `[${new Date().toLocaleString()}] Chuyển trạng thái: ${draggedBooking.status} -> ${modalInfo.targetStatus}. Ghi chú: ${notes}. Ảnh: ${image_url || 'Không'}`;
        
        const updatedNotes = (draggedBooking.internal_notes || '') + '\n' + logEntry;

        let formattedDate = draggedBooking.departure_date;
        if (draggedBooking.departure_date) {
            formattedDate = new Date(draggedBooking.departure_date).toISOString().split('T')[0];
        }

        const payload = {
            ...draggedBooking, 
            status: modalInfo.targetStatus, 
            internal_notes: updatedNotes,
            departure_date: formattedDate,
            customer_id: Number(draggedBooking.customer_id),
            tour_version_id: Number(draggedBooking.tour_version_id),
            created_by: draggedBooking.created_by || 1,
            total_amount: Number(draggedBooking.total_amount),
            unit_price: Number(draggedBooking.unit_price),
        };

        await bookingService.update(draggedBooking.id, payload);
        
        toast.success("Cập nhật thành công!");
        fetchBookings(); 

    } catch (error) {
        console.error(error);
        const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Lỗi server";
        toast.error("Cập nhật thất bại: " + errorMsg);
    } finally {
        toast.dismiss(toastId);
        setModalInfo({ open: false, targetStatus: null });
        setDraggedBooking(null);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] p-4 bg-slate-100 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Quản lý Tiến độ Booking</h1>
            <span className="text-xs bg-white px-2 py-1 rounded border text-slate-500">
                Tổng: {bookings.length} đơn
            </span>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchBookings} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"><RefreshCw size={16}/></button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-6 gap-3 min-h-0">
        {COLUMNS.map((col) => {
            const colBookings = bookings.filter(b => b.status === col.id);
            return (
                <div 
                    key={col.id}
                    className={`flex flex-col bg-slate-200/60 rounded-lg border-t-4 ${col.color} overflow-hidden h-full`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="px-3 py-2 bg-white/80 border-b border-slate-200 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-xs text-slate-700 uppercase truncate pr-1" title={col.title}>{col.title}</h3>
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {colBookings.length}
                        </span>
                    </div>

                    <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 transition-colors">
                        {colBookings.map(booking => (
                            <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onDragStart={handleDragStart}
                                // [MỚI] Bắt sự kiện click để mở modal chi tiết
                                onClick={(bk) => setDetailBooking(bk)}
                            />
                        ))}
                        {colBookings.length === 0 && (
                            <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                                Thả thẻ vào đây
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>

      {/* Modal Update (Kéo thả) */}
      <StatusUpdateModal 
        isOpen={modalInfo.open}
        onClose={() => setModalInfo({ ...modalInfo, open: false })}
        onConfirm={handleConfirmUpdate}
        booking={draggedBooking}
        newStatus={modalInfo.targetStatus}
      />

      {/* [MỚI] Modal Chi Tiết (Click) */}
      <BookingDetailModal 
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
        booking={detailBooking}
      />
    </div>
  );
};

export default BookingKanban;