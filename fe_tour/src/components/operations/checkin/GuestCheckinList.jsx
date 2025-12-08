import React, { useState, useMemo } from 'react';
import { 
  Search, Check, X, Clock, MapPin, MoreHorizontal, UserCheck, 
  Filter, User, Users, AlertCircle 
} from 'lucide-react';
import checkinService from '../../../services/api/checkinService';
import toast from 'react-hot-toast';
import CheckinActionButtons from './CheckinActionButtons';

const GuestCheckinList = ({ activity, departureId, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [selectedGuests, setSelectedGuests] = useState([]); 
    const [processing, setProcessing] = useState(false);

    // --- FILTER LOGIC ---
    const filteredGuests = useMemo(() => {
        if (!activity?.checkins) return [];
        
        return activity.checkins.filter(g => {
            // 1. Filter by Search Text
            const matchesSearch = g.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (g.phone && g.phone.includes(searchTerm));
            
            // 2. Filter by Status Tab
            const matchesStatus = filterStatus === 'all' 
                ? true 
                : (filterStatus === 'checked_in' 
                    ? ['checked_in', 'auto_checked'].includes(g.check_in_status)
                    : g.check_in_status === filterStatus);

            return matchesSearch && matchesStatus;
        });
    }, [activity, searchTerm, filterStatus]);

    // --- BULK ACTIONS ---
    const handleBulkCheckin = async () => {
        if (selectedGuests.length === 0) return;
        
        if (!window.confirm(`Xác nhận check-in cho ${selectedGuests.length} khách đã chọn?`)) return;

        setProcessing(true);
        try {
            const guestIds = activity.checkins
                .filter(c => selectedGuests.includes(c.id))
                .map(c => c.tour_departure_guest_id);

            await checkinService.bulkCheckIn(departureId, activity.activity_id, guestIds);
            toast.success(`Đã check-in ${guestIds.length} khách thành công!`);
            setSelectedGuests([]);
            onUpdate(); // Refresh data
        } catch (error) {
            toast.error("Lỗi check-in hàng loạt");
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedGuests(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            // Chỉ chọn những người chưa check-in (pending) trong danh sách đang hiển thị
            const pendingIds = filteredGuests
                .filter(g => g.check_in_status === 'pending')
                .map(g => g.id);
            setSelectedGuests(pendingIds);
        } else {
            setSelectedGuests([]);
        }
    };

    // --- RENDER HELPERS ---
    const FILTER_TABS = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chưa điểm danh', color: 'text-orange-600 bg-orange-50' },
        { id: 'checked_in', label: 'Đã có mặt', color: 'text-green-600 bg-green-50' },
        { id: 'missed', label: 'Vắng / Phép', color: 'text-red-600 bg-red-50' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            
            {/* 1. Toolbar Section */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-4">
                {/* Search & Bulk Action Row */}
                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Tìm tên khách hoặc số điện thoại..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {selectedGuests.length > 0 && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <span className="text-sm font-medium text-slate-600">
                                Đã chọn <strong className="text-blue-600">{selectedGuests.length}</strong> khách
                            </span>
                            <button 
                                onClick={handleBulkCheckin}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <UserCheck size={18}/>}
                                Check-in Nhanh
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Tabs Row */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {FILTER_TABS.map(tab => {
                        const isActive = filterStatus === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setFilterStatus(tab.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                                    isActive 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Table Section */}
            <div className="flex-1 overflow-y-auto relative">
                {filteredGuests.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <Filter size={40} className="mb-3 text-slate-200"/>
                        <p className="text-sm font-medium">Không tìm thấy khách hàng nào</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 w-14 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        onChange={toggleSelectAll}
                                        checked={selectedGuests.length > 0 && selectedGuests.length === filteredGuests.filter(g => g.check_in_status === 'pending').length}
                                        disabled={filteredGuests.every(g => g.check_in_status !== 'pending')}
                                    />
                                </th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4 hidden sm:table-cell">Thông tin</th>
                                <th className="p-4 text-center">Giờ check-in</th>
                                <th className="p-4 text-right">Trạng thái / Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {filteredGuests.map(guest => (
                                <tr key={guest.id} className={`group transition-colors ${selectedGuests.includes(guest.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4 text-center">
                                        {guest.check_in_status === 'pending' && (
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedGuests.includes(guest.id)}
                                                onChange={() => toggleSelect(guest.id)}
                                            />
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                {guest.guest_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{guest.guest_name}</div>
                                                <div className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                                    <User size={10} /> {guest.guest_type === 'adult' ? 'Người lớn' : 'Trẻ em'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <div className="text-xs text-slate-500 space-y-1">
                                            {guest.phone && <div>📞 {guest.phone}</div>}
                                            {guest.room_number && <div className="text-purple-600 font-medium">🏠 Phòng: {guest.room_number}</div>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {guest.check_in_time ? (
                                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                {new Date(guest.check_in_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end">
                                            <CheckinActionButtons 
                                                checkinId={guest.id}
                                                currentStatus={guest.check_in_status}
                                                onSuccess={onUpdate}
                                            />
                                        </div>
                                        {guest.excuse_reason && (
                                            <div className="text-[10px] text-orange-500 italic mt-1 max-w-[150px] ml-auto truncate" title={guest.excuse_reason}>
                                                Lý do: {guest.excuse_reason}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* 3. Footer Stats (Optional - Quick view) */}
            <div className="bg-slate-50 border-t border-slate-200 p-2 px-4 text-xs text-slate-500 flex justify-between items-center">
                <span>Hiển thị {filteredGuests.length} / {activity?.checkins?.length || 0} khách</span>
                {selectedGuests.length > 0 && <span className="text-blue-600 font-medium">Đang chọn {selectedGuests.length} khách</span>}
            </div>
        </div>
    );
};

export default GuestCheckinList;