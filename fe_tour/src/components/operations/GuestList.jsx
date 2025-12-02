import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserCheck, BedDouble, Download, 
  CheckCircle, XCircle, AlertCircle, Phone, MoreHorizontal, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import departureService from '../../services/api/departureService';

const GuestList = ({ departureId }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' }); // status: confirmed, checked_in
  
  // State chỉnh sửa nhanh (Inline Edit) cho xếp phòng
  const [editingId, setEditingId] = useState(null);
  const [roomData, setRoomData] = useState({ room_number: '', room_type: '' });

  // 1. Fetch Data
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await departureService.getGuests(departureId, { limit: 100 }); // Lấy hết hoặc phân trang lớn
      if (res.success) {
        setGuests(res.data.data || []); // Lưu ý cấu trúc pagination trả về
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách khách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureId) fetchGuests();
  }, [departureId]);

  // 2. Handle Check-in
  const handleCheckIn = async (guest) => {
    if (guest.checked_in) return; // Đã check-in rồi thì thôi
    
    if (!window.confirm(`Xác nhận Check-in cho khách ${guest.full_name}?`)) return;

    try {
      await departureService.checkInGuest(departureId, guest.id);
      toast.success(`Đã check-in: ${guest.full_name}`);
      
      // Cập nhật UI local để đỡ phải fetch lại
      setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, checked_in: 1, attendance_status: 'checked_in' } : g));
    } catch (error) {
      toast.error("Lỗi check-in");
    }
  };

  // 3. Handle Room Assignment
  const startEditRoom = (guest) => {
    setEditingId(guest.id);
    setRoomData({ 
        room_number: guest.room_number || '', 
        room_type: guest.room_type || 'Twin' 
    });
  };

  const saveRoom = async (guestId) => {
      try {
          // Gọi API update (Cần bổ sung hàm này trong service nếu chưa có)
          // Giả sử departureService.assignRoom(departureId, guestId, roomData)
          // Ở đây ta dùng tạm log
          console.log("Saving room:", guestId, roomData);
          
          // Optimistic update
          setGuests(prev => prev.map(g => g.id === guestId ? { ...g, ...roomData } : g));
          setEditingId(null);
          toast.success("Đã lưu thông tin phòng");
      } catch (error) {
          toast.error("Lỗi lưu phòng");
      }
  };

  // 4. Filter logic (Client-side cho nhanh với list nhỏ)
  const filteredGuests = guests.filter(g => {
      const matchSearch = g.full_name.toLowerCase().includes(filters.search.toLowerCase()) || 
                          g.booking_code.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus = filters.status === 'checked_in' ? g.checked_in === 1 :
                          filters.status === 'not_checked_in' ? g.checked_in === 0 : true;
      return matchSearch && matchStatus;
  });

  // Thống kê nhanh
  const stats = {
      total: guests.length,
      checked_in: guests.filter(g => g.checked_in).length,
      adults: guests.filter(g => g.guest_type === 'adult').length,
      children: guests.filter(g => g.guest_type !== 'adult').length,
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải danh sách hành khách...</div>;

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
                <span className="font-bold block text-lg">{stats.checked_in}/{stats.total}</span>
                <span className="text-xs uppercase">Đã Check-in</span>
            </div>
            <div className="bg-slate-50 text-slate-600 px-3 py-2 rounded-lg border border-slate-200">
                <span className="font-bold block text-lg">{stats.adults}L + {stats.children}TE</span>
                <span className="text-xs uppercase">Cơ cấu đoàn</span>
            </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    type="text" placeholder="Tìm tên, mã booking..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.search}
                    onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
                />
            </div>
            <select 
                className="border rounded-lg px-3 py-2 text-sm bg-white"
                value={filters.status}
                onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="checked_in">Đã Check-in</option>
                <option value="not_checked_in">Chưa đến</option>
            </select>
            <button className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600" title="Xuất danh sách">
                <Download size={20}/>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 w-10">#</th>
                        <th className="px-4 py-3">Hành khách</th>
                        <th className="px-4 py-3">Thông tin liên hệ</th>
                        <th className="px-4 py-3">Ghi chú</th>
                        <th className="px-4 py-3 w-48">Xếp phòng (Số/Loại)</th>
                        <th className="px-4 py-3 text-center">Check-in</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredGuests.length === 0 ? (
                        <tr><td colSpan="7" className="p-8 text-center text-slate-400">Không tìm thấy hành khách nào.</td></tr>
                    ) : (
                        filteredGuests.map((guest, idx) => (
                            <tr key={guest.id} className={`hover:bg-slate-50 transition-colors ${guest.checked_in ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                
                                {/* Cột Khách */}
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-800">{guest.full_name}</div>
                                    <div className="flex items-center gap-2 text-xs mt-1">
                                        <span className={`px-1.5 py-0.5 rounded border ${
                                            guest.guest_type === 'adult' ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {guest.guest_type === 'adult' ? 'Người lớn' : 'Trẻ em'}
                                        </span>
                                        <span className="text-slate-400">{guest.booking_code}</span>
                                    </div>
                                </td>

                                {/* Cột Liên hệ */}
                                <td className="px-4 py-3">
                                    {guest.phone ? (
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Phone size={12}/> {guest.phone}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">Đi theo đoàn</span>
                                    )}
                                    {guest.is_primary_contact === 1 && (
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded ml-1">Liên hệ chính</span>
                                    )}
                                </td>

                                {/* Cột Ghi chú (Dietary/Medical) */}
                                <td className="px-4 py-3">
                                    {guest.special_requests ? (
                                        <div className="flex items-start gap-1 text-orange-600 bg-orange-50 p-1.5 rounded border border-orange-100 text-xs max-w-[150px]">
                                            <AlertCircle size={12} className="shrink-0 mt-0.5"/>
                                            <span>{guest.special_requests}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300">--</span>
                                    )}
                                </td>

                                {/* Cột Xếp Phòng (Editable) */}
                                <td className="px-4 py-3">
                                    {editingId === guest.id ? (
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text" 
                                                className="w-12 border rounded px-1 py-1 text-center text-xs focus:ring-1 focus:ring-blue-500"
                                                placeholder="P.101"
                                                value={roomData.room_number}
                                                onChange={e => setRoomData({...roomData, room_number: e.target.value})}
                                                autoFocus
                                            />
                                            <input 
                                                type="text" 
                                                className="w-14 border rounded px-1 py-1 text-center text-xs"
                                                placeholder="Twin"
                                                value={roomData.room_type}
                                                onChange={e => setRoomData({...roomData, room_type: e.target.value})}
                                            />
                                            <button onClick={() => saveRoom(guest.id)} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"><Save size={12}/></button>
                                        </div>
                                    ) : (
                                        <div 
                                            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 group"
                                            onClick={() => startEditRoom(guest)}
                                        >
                                            <BedDouble size={14} className="text-slate-400 group-hover:text-blue-500"/>
                                            {guest.room_number ? (
                                                <span className="font-medium text-slate-700">{guest.room_number} <span className="text-slate-400 font-normal">({guest.room_type})</span></span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic border-b border-dashed border-slate-300">Xếp phòng</span>
                                            )}
                                        </div>
                                    )}
                                </td>

                                {/* Cột Check-in Status */}
                                <td className="px-4 py-3 text-center">
                                    {guest.checked_in ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-100">
                                            <CheckCircle size={12}/> Có mặt
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleCheckIn(guest)}
                                            className="inline-flex items-center gap-1 text-slate-500 bg-white border border-slate-300 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                        >
                                            <UserCheck size={12}/> Check-in
                                        </button>
                                    )}
                                </td>

                                {/* Cột Thao tác */}
                                <td className="px-4 py-3 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 p-1">
                                        <MoreHorizontal size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default GuestList;