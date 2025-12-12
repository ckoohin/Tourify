import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, BedDouble, AlertTriangle, Phone, Mail, Search, Users, Plus, Check, Trash2, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import departureService from '../../services/api/departureService';
import customerService from '../../services/api/customerService';
import bookingService from '../../services/api/bookingService';
import RoomAssignmentModal from './RoomAssignmentModal';
import toast from 'react-hot-toast';
import dayjs from '../../utils/formatDate'

const GuestAdditionModal = ({ isOpen, onClose, departureId, onSuccess }) => {
    const [bookingId, setBookingId] = useState('');
    const [guestsData, setGuestsData] = useState([]);
    const [slots, setSlots] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const [availableBookings, setAvailableBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        if (isOpen && departureId) {
            setBookingId('');
            setGuestsData([]);
            setSlots(null);
            setError('');
            fetchRelevantBookings();
        }
    }, [isOpen, departureId]);

    const fetchRelevantBookings = async () => {
        setLoadingBookings(true);
        try {
            const departureRes = await departureService.getById(departureId);
            const departureData = departureRes.data?.departure || departureRes.data;

            if (!departureData) {
                toast.error("Không thể lấy thông tin chuyến đi.");
                return;
            }

            const currentTourVersionId = departureData.tour_version_id;
            const currentDepartureDate = dayjs(departureData.departure_date).format('YYYY-MM-DD');

            const bookingsRes = await bookingService.getAll({ 
                tour_version_id: currentTourVersionId,
                status: 'confirmed,paid,deposited' 
            });

            if (bookingsRes.success || bookingsRes.data) {
                let bookings = [];
                if (Array.isArray(bookingsRes.data)) bookings = bookingsRes.data;
                else if (Array.isArray(bookingsRes.data?.bookings)) bookings = bookingsRes.data.bookings;
                else if (Array.isArray(bookingsRes.data?.data)) bookings = bookingsRes.data.data;

                const validBookings = bookings.filter(b => {
                    const isSameVersion = b.tour_version_id == currentTourVersionId;
                    
                    const bookingDate = dayjs(b.departure_date).format('YYYY-MM-DD');
                    const isSameDate = bookingDate === currentDepartureDate;

                    const isValidStatus = ['confirmed', 'paid', 'deposited'].includes(b.status);

                    return isSameVersion && isSameDate && isValidStatus;
                });
                
                setAvailableBookings(validBookings);
                
                if (validBookings.length === 0) {
                    console.log("Không tìm thấy booking nào khớp ngày:", currentDepartureDate, "và version:", currentTourVersionId);
                }
            }
        } catch (e) {
            console.error("Lỗi khi tải danh sách booking gợi ý:", e);
            toast.error("Lỗi tải dữ liệu booking.");
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleCheckSlots = async (selectedId) => {
        const idToCheck = selectedId || bookingId;

        setError('');
        setSlots(null);
        
        if (!idToCheck || isNaN(parseInt(idToCheck))) {
            return;
        }

        setLoadingSlots(true);
        try {
            const res = await customerService.checkBookingSlots(parseInt(idToCheck));
            
            if (res.success || res.data) {
                setSlots(res.data); 
                setGuestsData([]); 
            } else {
                setError(res.message || "Không tìm thấy Booking hoặc lỗi kiểm tra.");
            }
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.message || "Lỗi kết nối khi kiểm tra slots.");
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBookingSelection = (e) => {
        const id = e.target.value;
        setBookingId(id);
        if (id) {
            handleCheckSlots(id);
        } else {
            setSlots(null);
        }
    };

    const handleAddGuestField = () => {
        setGuestsData(prev => [...prev, {
            guest_type: 'adult',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            is_primary_contact: false
        }]);
    };

    const handleGuestChange = (index, field, value) => {
        const newGuests = [...guestsData];
        newGuests[index][field] = value;
        if (field === 'first_name' || field === 'last_name') {
             newGuests[index].full_name = `${newGuests[index].first_name || ''} ${newGuests[index].last_name || ''}`.trim();
        }
        setGuestsData(newGuests);
    };

    const handleRemoveGuestInput = (index) => {
        setGuestsData(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitGuests = async () => {
        setError('');
        if (guestsData.length === 0) {
            setError("Vui lòng thêm ít nhất một khách.");
            return;
        }

        for (const guest of guestsData) {
            if (!guest.first_name || !guest.last_name) {
                setError("Vui lòng nhập đầy đủ Họ và Tên cho tất cả khách.");
                return;
            }
        }

        const payload = {
            booking_id: parseInt(bookingId),
            guests: guestsData.map(g => ({
                guest_type: g.guest_type,
                first_name: g.first_name.trim(),
                last_name: g.last_name.trim(),
                full_name: g.full_name,
                email: g.email || null,
                phone: g.phone || null,
                is_primary_contact: g.is_primary_contact ? 1 : 0,
                gender: g.gender || null,
                birthday: g.birthday || null,
                nationality: g.nationality || 'Vietnam'
            }))
        };
        
        setIsSubmitting(true);
        const toastId = toast.loading("Đang xử lý đồng bộ dữ liệu...");

        try {
            await customerService.createGuestsFromBooking(payload.booking_id, payload.guests);
            toast.success("Thêm khách thành công!", { id: toastId });
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            const msg = e.response?.data?.message || e.message || "Lỗi khi thêm khách.";
            if (e.response?.data?.errors?.requesting) {
                 const errDetail = e.response.data.errors;
                 toast.error(`Quá số lượng cho phép! (Còn trống: ${JSON.stringify(errDetail.available)})`, { id: toastId, duration: 5000 });
            } else {
                toast.error(msg, { id: toastId });
                setError(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const totalGuestsCount = guestsData.length;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Users size={20}/> Thêm Khách hàng từ Booking</h3>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-700">1. Chọn Booking (Khớp ngày & Tour)</h4>
                            <button onClick={fetchRelevantBookings} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Tải lại danh sách">
                                <RefreshCw size={14} className={loadingBookings ? "animate-spin" : ""} />
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-3">Chỉ hiển thị các Booking có cùng <b>Tour Version</b> và <b>Ngày Khởi Hành</b> với chuyến đi này.</p>
                        
                        <div className="flex gap-3 items-center">
                            {loadingBookings ? (
                                <div className="w-full py-2 px-3 border rounded-lg bg-slate-100 text-slate-500 text-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin"/> Đang lọc booking phù hợp...
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <select
                                        value={bookingId}
                                        onChange={handleBookingSelection}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer ${!bookingId ? 'text-slate-500' : 'text-slate-800 font-medium'}`}
                                        disabled={loadingSlots || isSubmitting}
                                    >
                                        <option value="">-- Chọn đơn Booking --</option>
                                        {availableBookings.length > 0 ? (
                                            availableBookings.map(bk => (
                                                <option key={bk.id} value={bk.id}>
                                                    {bk.booking_code} | {bk.customer_name || bk.full_name || 'Khách lẻ'} | {dayjs(bk.departure_date).format('DD/MM/YYYY')}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Không có booking nào khớp ngày & tour</option>
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                        <Search size={16} />
                                    </div>
                                </div>
                            )}
                        </div>
                        

                        <div className="mt-2 text-right">
                            <button 
                                onClick={() => {
                                    const id = prompt("Nhập Booking ID thủ công (Chỉ dùng khi cần xử lý ngoại lệ):");
                                    if(id) { setBookingId(id); handleCheckSlots(id); }
                                }}
                                className="text-xs text-blue-600 hover:underline italic"
                            >
                                Nhập ID thủ công (Ngoại lệ)
                            </button>
                        </div>

                        {loadingSlots && (
                            <div className="mt-3 text-center text-xs text-slate-500 py-2">
                                <Loader2 size={16} className="animate-spin inline mr-1"/> Đang kiểm tra dữ liệu...
                            </div>
                        )}

                        {slots && !loadingSlots && (
                            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg animate-in slide-in-from-top-2">
                                <h5 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-2">
                                    <CheckCircleIcon className="text-green-500" size={16}/> 
                                    Booking #{slots.booking_id} hợp lệ
                                </h5>
                                <div className="grid grid-cols-4 gap-2 text-xs mt-2 border-t pt-2">
                                    <div className="text-slate-500">Còn trống: <b className={slots.available.total < 1 ? 'text-red-600' : 'text-green-600'}>{slots.available.total}</b> / {slots.total_capacity.total}</div>
                                    <div className="text-slate-500">Người lớn: <b className={slots.available.adults < 1 ? 'text-red-600' : 'text-green-600'}>{slots.available.adults}</b></div>
                                    <div className="text-slate-500">Trẻ em: <b className={slots.available.children < 1 ? 'text-red-600' : 'text-green-600'}>{slots.available.children}</b></div>
                                    <div className="text-slate-500">Sơ sinh: <b className={slots.available.infants < 1 ? 'text-red-600' : 'text-green-600'}>{slots.available.infants}</b></div>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={14}/>{error}</p>}
                    </div>

                    {slots && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-700">2. Danh sách Khách ({totalGuestsCount})</h4>
                                <button onClick={handleAddGuestField} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
                                    <Plus size={16}/> Thêm dòng
                                </button>
                            </div>
                            
                            {guestsData.length === 0 ? (
                                <p className="text-slate-400 text-sm italic text-center py-5">Chưa có thông tin khách nào. Vui lòng nhấn "Thêm dòng".</p>
                            ) : (
                                <div className="space-y-4">
                                    {guestsData.map((guest, index) => (
                                        <div key={index} className="p-4 border rounded-lg bg-slate-50 grid grid-cols-12 gap-3 items-center relative group">
                                            <div className="absolute top-2 right-2 text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">#{index + 1}</div>
                                            
                                            {/* Loại khách */}
                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Loại khách <span className="text-red-500">*</span></label>
                                                <select value={guest.guest_type} onChange={(e) => handleGuestChange(index, 'guest_type', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none">
                                                    <option value="adult">Người lớn</option>
                                                    <option value="child">Trẻ em</option>
                                                    <option value="infant">Sơ sinh</option>
                                                </select>
                                            </div>
                                            
                                            {/* Tên */}
                                            <div className="col-span-4 md:col-span-3">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Họ <span className="text-red-500">*</span></label>
                                                <input type="text" placeholder="Nguyễn" value={guest.last_name} onChange={(e) => handleGuestChange(index, 'last_name', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none" />
                                            </div>
                                            <div className="col-span-4 md:col-span-3">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Tên <span className="text-red-500">*</span></label>
                                                <input type="text" placeholder="Văn A" value={guest.first_name} onChange={(e) => handleGuestChange(index, 'first_name', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none" />
                                            </div>

                                            {/* Contact */}
                                            <div className="col-span-6 md:col-span-4">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Email / SĐT</label>
                                                <input type="text" placeholder="Email hoặc SĐT" value={guest.email || guest.phone} onChange={(e) => {
                                                    const val = e.target.value;
                                                    if(val.includes('@')) handleGuestChange(index, 'email', val);
                                                    else handleGuestChange(index, 'phone', val);
                                                }} className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none" />
                                            </div>
                                            
                                            <div className="col-span-12 md:col-span-12 flex justify-between items-center mt-2 border-t pt-2 border-slate-200">
                                                 <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                                                    <input type="checkbox" checked={guest.is_primary_contact} onChange={(e) => handleGuestChange(index, 'is_primary_contact', e.target.checked)} className="w-4 h-4 text-blue-600 rounded"/>
                                                    Là người liên hệ chính
                                                </label>
                                                <button type="button" onClick={() => handleRemoveGuestInput(index)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                                                    <Trash2 size={14}/> Xóa dòng
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {slots && totalGuestsCount > slots.available.total && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2 animate-pulse">
                                    <AlertCircle size={18}/>
                                    <b>Cảnh báo:</b> Số lượng khách nhập vào ({totalGuestsCount}) đang vượt quá tổng slot còn trống ({slots.available.total}).
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* FOOTER */}
                <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 sticky bottom-0">
                    <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all">Đóng</button>
                    <button 
                        onClick={handleSubmitGuests} 
                        disabled={isSubmitting || totalGuestsCount === 0} 
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-200 transition-all"
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : <Check size={20}/>}
                        Xác nhận thêm
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

// --- MAIN COMPONENT: GUEST LIST ---
const GuestList = ({ departureId, isReadOnly = false, maxGuests }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await departureService.getGuests(departureId, { limit: 100 });
      if (res.success) {
        const dataList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setGuests(dataList);
      } else {
        setGuests([]);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách khách:", e);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureId) fetchGuests();
  }, [departureId]);

  const handleCheckIn = async (guestId, currentCheckedInStatus) => {
    if (currentCheckedInStatus) return; 
    if (!window.confirm('Xác nhận khách đã có mặt và làm thủ tục check-in?')) return;

    try {
        await departureService.checkInGuest(departureId, guestId);
        toast.success('Check-in thành công');
        fetchGuests();
    } catch (error) {
        toast.error('Lỗi check-in');
    }
  };

  const handleOpenRoomModal = (guest) => {
      setSelectedGuest(guest);
      setModalOpen(true);
  };

  const handleRemoveGuest = async (bookingGuestId) => {
      if (!window.confirm("CẢNH BÁO: Xóa khách này sẽ ảnh hưởng đến Booking và Danh sách điều hành. Bạn có chắc chắn?")) return;

      const toastId = toast.loading("Đang xóa khách...");
      try {
          await customerService.deleteGuestFromBooking(bookingGuestId);
          toast.success("Đã xóa khách thành công.", { id: toastId });
          fetchGuests();
      } catch (error) {
          const msg = error.response?.data?.message || "Lỗi xóa khách.";
          toast.error(msg, { id: toastId });
      }
  };

  const filteredGuests = Array.isArray(guests) ? guests.filter(g => 
    (g.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (g.phone || '').includes(searchTerm) ||
    (g.booking_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
              <input 
                type="text" 
                placeholder="Tìm khách (Tên, SĐT, Booking ID)..." 
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                  Tổng số khách: <b>{guests.length}</b>/{maxGuests || '∞'}
              </div>
              {!isReadOnly && (
                  <button 
                      onClick={() => setAddModalOpen(true)} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 shadow-md transition-all"
                  >
                      <Plus size={16}/> Thêm khách từ Booking
                  </button>
              )}
          </div>
      </div>

      {loading ? (
          <div className="text-center py-10 text-slate-500"><Loader2 size={24} className="animate-spin mx-auto mb-2"/> Đang tải danh sách khách...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                    <tr>
                        <th className="p-3 w-[120px]">Check-in</th>
                        <th className="p-3 w-[200px]">Họ và tên</th>
                        <th className="p-3 w-[200px]">Thông tin Booking</th>
                        <th className="p-3 w-[150px]">Phòng (Room)</th>
                        <th className="p-3 w-auto">Ghi chú đặc biệt</th>
                        <th className="p-3 w-[100px] text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredGuests.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                                {searchTerm ? "Không tìm thấy khách nào khớp với từ khóa." : "Chuyến đi chưa có khách đăng ký."}
                            </td>
                        </tr>
                    ) : (
                        filteredGuests.map(g => (
                            <tr key={g.departure_guest_id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3">
                                    <button 
                                        onClick={() => handleCheckIn(g.departure_guest_id, g.checked_in)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${g.checked_in ? 'text-green-700 bg-green-50 cursor-default' : 'text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-200 hover:bg-blue-50'}`}
                                        disabled={g.checked_in || isReadOnly}
                                    >
                                        {g.checked_in ? <CheckSquare size={18}/> : <Square size={18}/>}
                                        {g.checked_in ? 'Đã có mặt' : 'Chưa đến'}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <div className="font-medium text-slate-800">{g.full_name}</div>
                                    <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                                        <span className={`px-1 rounded ${g.guest_type === 'adult' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {g.guest_type === 'adult' ? 'NL' : (g.guest_type === 'child' ? 'TE' : 'SS')}
                                        </span>
                                        {g.birthday && (
                                            <>
                                                <span>•</span>
                                                <span>{new Date().getFullYear() - new Date(g.birthday).getFullYear()} tuổi</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded w-fit mb-1 text-slate-600 border border-slate-200">
                                        #{g.booking_code || 'N/A'}
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                        {g.phone && <span className="flex items-center gap-1"><Phone size={10}/> {g.phone}</span>}
                                        {g.email && <span className="flex items-center gap-1"><Mail size={10}/> {g.email}</span>}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        {g.room_number ? (
                                            <span className="font-bold text-blue-600">P.{g.room_number} ({g.room_type})</span>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">Chưa xếp</span>
                                        )}
                                        {!isReadOnly && (
                                            <button 
                                                onClick={() => handleOpenRoomModal(g)}
                                                className="p-1 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded text-xs transition-all bg-white shadow-sm"
                                            >
                                                <BedDouble size={14}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    {(g.special_requests || g.medical_notes) ? (
                                        <div className="text-amber-700 bg-amber-50 p-2 rounded text-xs border border-amber-100 max-w-[200px]">
                                            {g.special_requests && <div className="flex gap-1 mb-1"><AlertTriangle size={10} className="shrink-0 mt-0.5"/> {g.special_requests}</div>}
                                            {g.medical_notes && <div className="text-red-600 flex gap-1"><AlertCircle size={10} className="shrink-0 mt-0.5"/> Y tế: {g.medical_notes}</div>}
                                        </div>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    {!isReadOnly && (
                                        <button 
                                            onClick={() => handleRemoveGuest(g.booking_guest_id)}
                                            className="px-2 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-medium flex items-center gap-1 ml-auto transition-all bg-white"
                                            title="Xóa khách khỏi booking này"
                                        >
                                            <Trash2 size={14}/> Xóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      )}

      <RoomAssignmentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        departureId={departureId}
        guest={selectedGuest}
        allGuests={guests}
        onSuccess={fetchGuests}
      />

      <GuestAdditionModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          departureId={departureId}
          onSuccess={() => { setAddModalOpen(false); fetchGuests(); }}
      />
    </div>
  );
};

export default GuestList;