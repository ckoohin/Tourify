import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, BedDouble, AlertTriangle, Phone, Mail, Search } from 'lucide-react';
import departureService from '../../services/api/departureService';
import RoomAssignmentModal from './RoomAssignmentModal';
import toast from 'react-hot-toast';

const GuestList = ({ departureId }) => {
  // Khởi tạo là mảng rỗng []
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await departureService.getGuests(departureId, { limit: 100 });
      if (res.success) {
        // FIX: Xử lý an toàn để tránh guests bị undefined
        // Kiểm tra xem dữ liệu nằm ở res.data hay res.data.data (do phân trang)
        const dataList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setGuests(dataList);
      } else {
        setGuests([]);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách khách:", e);
      setGuests([]); // Fallback về mảng rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureId) fetchGuests();
  }, [departureId]);

  const handleCheckIn = async (guestId, currentStatus) => {
    if (currentStatus) return; 
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

  // FIX: Thêm toán tử ?. hoặc kiểm tra Array.isArray để đảm bảo không crash
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
                placeholder="Tìm khách..." 
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="text-sm text-slate-500">
              Tổng số: <b>{guests.length}</b> khách
          </div>
      </div>

      {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải danh sách khách...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                    <tr>
                        <th className="p-3">Check-in</th>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Thông tin Booking</th>
                        <th className="p-3">Phòng (Room)</th>
                        <th className="p-3">Ghi chú đặc biệt</th>
                        <th className="p-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredGuests.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                                Không tìm thấy khách nào.
                            </td>
                        </tr>
                    ) : (
                        filteredGuests.map(g => (
                            <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3">
                                    <button 
                                        onClick={() => handleCheckIn(g.id, g.checked_in)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${g.checked_in ? 'text-green-700 bg-green-50 cursor-default' : 'text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-200 hover:bg-blue-50'}`}
                                    >
                                        {g.checked_in ? <CheckSquare size={18}/> : <Square size={18}/>}
                                        {g.checked_in ? 'Đã có mặt' : 'Chưa đến'}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <div className="font-medium text-slate-800">{g.full_name}</div>
                                    <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                                        <span>{g.gender === 'male' ? 'Nam' : (g.gender === 'female' ? 'Nữ' : '-')}</span>
                                        {g.birthday && (
                                            <>
                                                <span>|</span>
                                                <span>{new Date().getFullYear() - new Date(g.birthday).getFullYear()} tuổi</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded w-fit mb-1 text-slate-600">{g.booking_code}</div>
                                    <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                        {g.phone && <span className="flex items-center gap-1"><Phone size={10}/> {g.phone}</span>}
                                        {g.email && <span className="flex items-center gap-1"><Mail size={10}/> {g.email}</span>}
                                    </div>
                                </td>
                                <td className="p-3">
                                    {g.room_number ? (
                                        <div>
                                            <div className="font-bold text-blue-600">P.{g.room_number}</div>
                                            <div className="text-xs text-slate-500">{g.room_type}</div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">Chưa xếp</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {(g.special_requests || g.medical_notes) ? (
                                        <div className="text-amber-700 bg-amber-50 p-2 rounded text-xs border border-amber-100 max-w-[200px]">
                                            {g.special_requests && <div className="flex gap-1"><AlertTriangle size={10} className="shrink-0 mt-0.5"/> {g.special_requests}</div>}
                                            {g.medical_notes && <div className="mt-1 text-red-600">• Y tế: {g.medical_notes}</div>}
                                        </div>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => handleOpenRoomModal(g)}
                                        className="px-3 py-1.5 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded text-xs font-medium flex items-center gap-1 ml-auto transition-all bg-white"
                                    >
                                        <BedDouble size={14}/> Xếp phòng
                                    </button>
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
    </div>
  );
};

export default GuestList;