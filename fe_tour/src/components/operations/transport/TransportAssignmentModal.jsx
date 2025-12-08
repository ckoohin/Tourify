import React, { useState, useEffect } from 'react';
import { 
    X, User, Check, AlertCircle, Armchair, Ticket, 
    Briefcase, Utensils, Save, Trash2, Edit, Users, Layers, LogOut 
} from 'lucide-react';
import transportService from '../../../services/api/transportService';
import departureService from '../../../services/api/departureService';
import toast from 'react-hot-toast';

const TransportAssignmentModal = ({ isOpen, onClose, transport, departureId }) => {
    const [assignments, setAssignments] = useState([]);
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- STATE QUẢN LÝ ---
    const [detailFormOpen, setDetailFormOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);

    // Chế độ Single (Cũ)
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [selectedGuestId, setSelectedGuestId] = useState(null);

    // Chế độ Multi (Mới)
    const [isMultiMode, setIsMultiMode] = useState(false);
    const [multiSelectedSeats, setMultiSelectedSeats] = useState([]); // Ghế TRỐNG được chọn để XẾP
    const [multiSelectedGuests, setMultiSelectedGuests] = useState([]); // Khách được chọn để XẾP
    const [multiSelectedAssignments, setMultiSelectedAssignments] = useState([]); // [NEW] Ghế CÓ NGƯỜI được chọn để HỦY

    // Form data (Dùng chung cho cả Single và Bulk)
    const [assignmentData, setAssignmentData] = useState({
        ticket_number: '',
        baggage_allowance: '20kg',
        special_meal: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen && transport) {
            fetchData();
        }
    }, [isOpen, transport, departureId]);

    // Reset state khi chuyển chế độ
    useEffect(() => {
        setSelectedSeat(null);
        setSelectedGuestId(null);
        setMultiSelectedSeats([]);
        setMultiSelectedGuests([]);
        setMultiSelectedAssignments([]); // Reset danh sách hủy
    }, [isMultiMode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignRes, guestRes] = await Promise.all([
                transportService.getAssignmentsByTransport(transport.id),
                departureService.getGuests(departureId, { limit: 100 })
            ]);

            // Xử lý Assignments
            let loadedAssignments = [];
            if (assignRes.data && Array.isArray(assignRes.data.assignments)) {
                loadedAssignments = assignRes.data.assignments;
            } else if (Array.isArray(assignRes.data)) {
                loadedAssignments = assignRes.data;
            } else if (assignRes.data && Array.isArray(assignRes.data.data)) {
                loadedAssignments = assignRes.data.data;
            }

            // Chuẩn hóa seat_number về int để render đúng
            loadedAssignments = loadedAssignments.map(a => ({
                ...a,
                seat_number_int: parseInt(a.seat_number, 10)
            }));

            // Xử lý Guests
            let loadedGuests = [];
            if (Array.isArray(guestRes.data)) {
                loadedGuests = guestRes.data;
            } else if (guestRes.data && Array.isArray(guestRes.data.data)) {
                loadedGuests = guestRes.data.data;
            } else if (guestRes.data && Array.isArray(guestRes.data.guests)) {
                loadedGuests = guestRes.data.guests;
            }

            setAssignments(loadedAssignments);
            setGuests(loadedGuests);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Lỗi tải dữ liệu xếp chỗ");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC XỬ LÝ CLICK ---

    const handleSeatClick = (seatNumStr) => {
        const seatNumInt = parseInt(seatNumStr, 10);
        const assignment = assignments.find(a => a.seat_number_int === seatNumInt);

        // --- TRƯỜNG HỢP GHẾ ĐÃ CÓ NGƯỜI ---
        if (assignment) {
            if (isMultiMode) {
                // Chế độ Multi: Chọn để HỦY CHỖ
                
                // Nếu đang chọn ghế trống để xếp -> Clear hết để chuyển sang mode hủy
                if (multiSelectedSeats.length > 0) {
                    setMultiSelectedSeats([]);
                    setMultiSelectedGuests([]);
                }

                setMultiSelectedAssignments(prev => {
                    if (prev.includes(assignment.id)) return prev.filter(id => id !== assignment.id);
                    return [...prev, assignment.id];
                });
            } else {
                // Chế độ Single: Sửa thông tin
                handleEdit(assignment);
            }
            return;
        }

        // --- TRƯỜNG HỢP GHẾ TRỐNG ---
        if (isMultiMode) {
            // Chế độ Multi: Chọn để XẾP CHỖ
            
            // Nếu đang chọn ghế hủy -> Clear hết để chuyển sang mode xếp
            if (multiSelectedAssignments.length > 0) {
                setMultiSelectedAssignments([]);
            }

            setMultiSelectedSeats(prev => {
                if (prev.includes(seatNumStr)) return prev.filter(s => s !== seatNumStr);
                return [...prev, seatNumStr];
            });
        } else {
            // Chế độ Single
            setSelectedSeat(seatNumStr);
            if (selectedGuestId) openDetailForm();
        }
    };

    const handleGuestClick = (guestId) => {
        // Khi click khách -> Chắc chắn là muốn XẾP CHỖ -> Clear danh sách hủy
        if (multiSelectedAssignments.length > 0) setMultiSelectedAssignments([]);

        if (isMultiMode) {
            // Multi Mode: Toggle chọn khách
            setMultiSelectedGuests(prev => {
                if (prev.includes(guestId)) return prev.filter(id => id !== guestId);
                return [...prev, guestId];
            });
        } else {
            // Single Mode
            setSelectedGuestId(guestId);
            if (selectedSeat) openDetailForm();
        }
    };

    // --- FORM ACTIONS ---

    const openDetailForm = () => {
        setEditingAssignment(null);
        // Reset form data mặc định
        setAssignmentData({
            ticket_number: '',
            baggage_allowance: transport.transport_type === 'flight' ? '23kg' : '20kg',
            special_meal: '',
            notes: ''
        });
        setDetailFormOpen(true);
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setSelectedSeat(assignment.seat_number);
        setSelectedGuestId(assignment.tour_departure_guest_id);
        setAssignmentData({
            ticket_number: assignment.ticket_number || '',
            baggage_allowance: assignment.baggage_allowance || '',
            special_meal: assignment.special_meal || '',
            notes: assignment.notes || ''
        });
        setDetailFormOpen(true);
    };

    // --- BULK UNASSIGN (HỦY HÀNG LOẠT) ---
    const handleBulkUnassign = async () => {
        if (multiSelectedAssignments.length === 0) return;
        
        if (!window.confirm(`Xác nhận hủy chỗ của ${multiSelectedAssignments.length} khách đã chọn?`)) return;

        setLoading(true);
        try {
            // Gọi API delete cho từng assignment (hoặc bulk delete nếu BE hỗ trợ)
            await Promise.all(multiSelectedAssignments.map(id => transportService.unassignGuest(id)));
            
            toast.success(`Đã hủy thành công ${multiSelectedAssignments.length} chỗ ngồi`);
            
            // Reset state
            setMultiSelectedAssignments([]);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi hủy chỗ");
            setLoading(false);
        }
    };

    const handleSaveAssignment = async () => {
        try {
            if (isMultiMode) {
                // --- LOGIC LƯU BULK ASSIGN ---
                if (multiSelectedGuests.length !== multiSelectedSeats.length) {
                    toast.error("Số lượng khách và số ghế không khớp nhau!");
                    return;
                }

                const sortedSeats = [...multiSelectedSeats].sort((a, b) => parseInt(a) - parseInt(b));
                
                const bulkPayload = multiSelectedGuests.map((guestId, index) => ({
                    tour_transport_id: transport.id,
                    tour_departure_guest_id: guestId,
                    seat_number: sortedSeats[index],
                    ...assignmentData
                }));

                await transportService.bulkAssign(bulkPayload);
                toast.success(`Đã xếp thành công ${bulkPayload.length} khách`);

            } else {
                // --- LOGIC LƯU SINGLE ---
                const payload = {
                    tour_transport_id: transport.id,
                    tour_departure_guest_id: selectedGuestId,
                    seat_number: selectedSeat,
                    ...assignmentData
                };

                if (editingAssignment) {
                    await transportService.updateAssignment(editingAssignment.id, payload);
                    toast.success("Cập nhật thành công");
                } else {
                    await transportService.assignGuest(payload);
                    toast.success(`Đã xếp ghế ${selectedSeat}`);
                }
            }

            // Reset
            setDetailFormOpen(false);
            setEditingAssignment(null);
            setSelectedSeat(null); setSelectedGuestId(null);
            setMultiSelectedGuests([]); setMultiSelectedSeats([]);
            fetchData();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
        }
    };

    const handleUnassign = async (assignmentId) => {
        if (!window.confirm("Bỏ khách này khỏi ghế?")) return;
        try {
            await transportService.unassignGuest(assignmentId);
            toast.success("Đã hủy chỗ");
            setDetailFormOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Lỗi hủy chỗ");
        }
    };

    // Helpers
    const assignedGuestIds = assignments.map(a => a.tour_departure_guest_id);
    const unassignedGuests = guests.filter(g => !assignedGuestIds.includes(g.id));
    
    // Tên khách hàng đang chọn (cho phần hiển thị Summary)
    const getSelectedGuestsName = () => {
        if (isMultiMode) return `${multiSelectedGuests.length} khách đã chọn`;
        const g = guests.find(i => i.id == selectedGuestId);
        return g ? g.full_name : '---';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            {transport.transport_type === 'flight' ? <Ticket size={20}/> : <Armchair size={20}/>}
                            Sơ đồ: {transport.route_from} ➝ {transport.route_to}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {transport.transport_provider} • {transport.total_seats} chỗ
                        </p>
                    </div>
                    
                    {/* [NEW] Mode Switcher */}
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button 
                                onClick={() => setIsMultiMode(false)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${!isMultiMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <User size={14}/> Chọn lẻ
                            </button>
                            <button 
                                onClick={() => setIsMultiMode(true)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${isMultiMode ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Layers size={14}/> Chọn nhiều
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Seat Map */}
                    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto border-r border-slate-200 relative">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-slate-400">Đang tải sơ đồ...</div>
                        ) : (
                            <div className="max-w-2xl mx-auto pb-20">
                                {/* Legend */}
                                <div className="mb-6 flex justify-center gap-6 text-xs text-slate-500 sticky top-0 bg-slate-50/95 backdrop-blur py-2 z-10">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-white"></div> Trống</div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border-blue-300 text-blue-600"></div> Đã xếp</div>
                                    {isMultiMode && (
                                        <>
                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-600"></div> Chọn xếp</div>
                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div> Chọn hủy</div>
                                        </>
                                    )}
                                    {!isMultiMode && (
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-800"></div> Đang chọn</div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {Array.from({ length: transport.total_seats }).map((_, i) => {
                                        const seatNumInt = i + 1;
                                        const seatNumStr = seatNumInt.toString();
                                        
                                        const assignment = assignments.find(a => a.seat_number_int === seatNumInt);
                                        
                                        // Logic active
                                        let isSelected = false;
                                        let isUnassignSelected = false;

                                        if (isMultiMode) {
                                            isSelected = multiSelectedSeats.includes(seatNumStr);
                                            // Check nếu assignment này được chọn để hủy
                                            if (assignment && multiSelectedAssignments.includes(assignment.id)) {
                                                isUnassignSelected = true;
                                            }
                                        } else {
                                            isSelected = selectedSeat == seatNumStr; 
                                        }

                                        return (
                                            <div 
                                                key={seatNumInt}
                                                onClick={() => handleSeatClick(seatNumStr)}
                                                className={`
                                                    relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                                                    ${assignment 
                                                        ? (isUnassignSelected 
                                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-md scale-105' // Đang chọn hủy
                                                            : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 cursor-default opacity-90') 
                                                        : isSelected 
                                                            ? (isMultiMode ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-800 text-white shadow-lg scale-105') 
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <div className="absolute top-1 left-2 text-[10px] font-bold opacity-60">{seatNumInt}</div>
                                                {assignment ? (
                                                    <>
                                                        <User size={20} className={`mb-1 ${isUnassignSelected ? 'text-red-500' : 'text-blue-600 opacity-80'}`}/>
                                                        <span className="text-[10px] font-bold text-center px-1 truncate w-full leading-tight">
                                                            {assignment.last_name || assignment.full_name || '---'} 
                                                        </span>
                                                    </>
                                                ) : (
                                                    <Armchair size={22} strokeWidth={1.5} />
                                                )}
                                                
                                                {/* Badge số thứ tự chọn trong Multi Mode (Xếp) */}
                                                {isMultiMode && isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-white text-purple-600 border border-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                        {multiSelectedSeats.indexOf(seatNumStr) + 1}
                                                    </div>
                                                )}

                                                {/* Badge Checkmark cho Hủy */}
                                                {isMultiMode && isUnassignSelected && (
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                                        <Trash2 size={10} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* BULK ACTION BAR (Floating) */}
                        {isMultiMode && (
                            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl border border-slate-200 flex items-center gap-6 animate-in slide-in-from-bottom-4 z-20 transition-all ${multiSelectedAssignments.length > 0 ? 'ring-2 ring-red-100' : ''}`}>
                                
                                {multiSelectedAssignments.length > 0 ? (
                                    // Giao diện HỦY CHỖ
                                    <>
                                        <div className="flex gap-4 text-sm font-medium text-red-700 items-center">
                                            <AlertCircle size={18}/>
                                            <div>Đã chọn <b>{multiSelectedAssignments.length}</b> ghế để hủy</div>
                                        </div>
                                        <button 
                                            onClick={handleBulkUnassign}
                                            className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200 flex items-center gap-1"
                                        >
                                            <LogOut size={14}/> Hủy chỗ ngay
                                        </button>
                                    </>
                                ) : (
                                    // Giao diện XẾP CHỖ
                                    <>
                                        <div className="flex gap-4 text-sm font-medium">
                                            <div className={multiSelectedGuests.length > 0 ? "text-purple-700" : "text-slate-400"}>
                                                Đã chọn <b>{multiSelectedGuests.length}</b> khách
                                            </div>
                                            <div className="w-[1px] h-5 bg-slate-200"></div>
                                            <div className={multiSelectedSeats.length > 0 ? "text-purple-700" : "text-slate-400"}>
                                                Đã chọn <b>{multiSelectedSeats.length}</b> ghế
                                            </div>
                                        </div>
                                        <button 
                                            disabled={multiSelectedGuests.length === 0 || multiSelectedGuests.length !== multiSelectedSeats.length}
                                            onClick={openDetailForm}
                                            className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-200"
                                        >
                                            Xếp chỗ ngay
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: List & Action Panel */}
                    <div className="w-96 bg-white flex flex-col border-l border-slate-200 shrink-0">
                        {/* Status Bar */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h4 className="font-bold text-slate-700 text-sm mb-1">Danh sách khách chờ ({unassignedGuests.length})</h4>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1">
                                <div 
                                    className="bg-blue-600 h-full transition-all" 
                                    style={{ width: `${(assignments.length / transport.total_seats) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                {isMultiMode 
                                    ? (multiSelectedAssignments.length > 0 
                                        ? "⚠️ Đang chọn ghế để HỦY. Bỏ chọn ghế để quay lại xếp chỗ."
                                        : "💡 Chọn nhiều khách, sau đó chọn số ghế tương ứng bên trái.")
                                    : "💡 Chọn 1 khách để xếp vào ghế đang chọn."}
                            </p>
                        </div>

                        {/* Guest List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {unassignedGuests.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">Tất cả khách đã được xếp chỗ.</div>
                            ) : (
                                unassignedGuests.map(guest => {
                                    // Logic active guest
                                    const isGuestSelected = isMultiMode 
                                        ? multiSelectedGuests.includes(guest.id)
                                        : selectedGuestId == guest.id;
                                    
                                    // Disable chọn khách khi đang ở mode Hủy
                                    const isDisabled = isMultiMode && multiSelectedAssignments.length > 0;

                                    return (
                                        <div 
                                            key={guest.id}
                                            onClick={() => !isDisabled && handleGuestClick(guest.id)}
                                            className={`
                                                group p-3 rounded-lg border flex items-center justify-between transition-all select-none
                                                ${isDisabled ? 'opacity-40 cursor-not-allowed border-slate-100' : 'cursor-pointer'}
                                                ${!isDisabled && isGuestSelected
                                                    ? (isMultiMode ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-slate-800 border-slate-800 text-white shadow-md')
                                                    : !isDisabled && 'border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                                                }
                                            `}
                                        >
                                            <div>
                                                <div className={`font-bold text-sm ${!isDisabled && isGuestSelected && !isMultiMode ? 'text-white' : 'text-slate-700'}`}>{guest.full_name}</div>
                                                <div className={`text-xs flex gap-2 ${!isDisabled && isGuestSelected && !isMultiMode ? 'text-slate-300' : 'text-slate-400'}`}>
                                                    <span>{guest.guest_type === 'adult' ? 'Người lớn' : 'Trẻ em'}</span>
                                                    {guest.booking_code && <span className={`font-mono px-1 rounded ${!isDisabled && isGuestSelected && !isMultiMode ? 'bg-slate-700' : 'bg-slate-100'}`}>{guest.booking_code}</span>}
                                                </div>
                                            </div>
                                            
                                            {/* Checkbox for Multi Mode */}
                                            {isMultiMode && (
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isGuestSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                                    {isGuestSelected && <Check size={12} className="text-white"/>}
                                                </div>
                                            )}
                                            
                                            {/* Indicator for Single Mode */}
                                            {!isMultiMode && isGuestSelected && <Check size={16} className="text-white"/>}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAL CON: NHẬP CHI TIẾT VÉ / HÀNH LÝ */}
                {detailFormOpen && (
                    <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                            <div className="px-5 py-3 border-b bg-slate-50 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    {isMultiMode ? <Layers size={18} className="text-purple-600"/> : <Edit size={18} className="text-blue-600"/>}
                                    {isMultiMode ? `Xếp chỗ cho ${multiSelectedGuests.length} khách` : (editingAssignment ? 'Cập nhật vé' : 'Xác nhận xếp chỗ')}
                                </h4>
                                <button onClick={() => setDetailFormOpen(false)}><X size={18} className="text-slate-400 hover:text-red-500"/></button>
                            </div>
                            
                            <div className="p-5 space-y-4">
                                {/* Summary Info */}
                                {!isMultiMode && (
                                    <div className="flex gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="text-center min-w-[60px]">
                                            <div className="text-xs text-blue-500 font-bold uppercase">Ghế</div>
                                            <div className="text-2xl font-black text-blue-700">{selectedSeat}</div>
                                        </div>
                                        <div className="border-l border-blue-200 pl-4 flex-1">
                                            <div className="text-xs text-blue-500 font-bold uppercase">Khách hàng</div>
                                            <div className="font-bold text-slate-800">
                                                {editingAssignment ? (editingAssignment.first_name + ' ' + editingAssignment.last_name) : getSelectedGuestsName()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bulk Info */}
                                {isMultiMode && (
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-800">
                                        Đang xếp <b>{multiSelectedGuests.length} khách</b> vào các ghế: <b>{multiSelectedSeats.sort((a,b)=>a-b).join(', ')}</b>.
                                        <div className="mt-1 text-xs opacity-70">Thông tin vé và hành lý dưới đây sẽ áp dụng cho tất cả khách được chọn.</div>
                                    </div>
                                )}

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1"><Ticket size={12}/> Số vé / Ticket Number</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="VD: VN12345678 (Nếu có)" value={assignmentData.ticket_number} onChange={e => setAssignmentData({...assignmentData, ticket_number: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1"><Briefcase size={12}/> Hành lý ký gửi</label>
                                            <input type="text" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="20kg" value={assignmentData.baggage_allowance} onChange={e => setAssignmentData({...assignmentData, baggage_allowance: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1"><Utensils size={12}/> Suất ăn</label>
                                            <input type="text" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Thường / Chay..." value={assignmentData.special_meal} onChange={e => setAssignmentData({...assignmentData, special_meal: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                                        <textarea className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none h-20" placeholder="Lưu ý đặc biệt..." value={assignmentData.notes} onChange={e => setAssignmentData({...assignmentData, notes: e.target.value})}></textarea>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-2">
                                    {editingAssignment && !isMultiMode && (
                                        <button onClick={() => handleUnassign(editingAssignment.id)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-1 mr-auto">
                                            <Trash2 size={16}/> Hủy chỗ
                                        </button>
                                    )}
                                    <button onClick={() => setDetailFormOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50">Đóng</button>
                                    <button onClick={handleSaveAssignment} className={`px-6 py-2 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${isMultiMode ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                                        <Save size={16}/> {isMultiMode ? 'Xếp hàng loạt' : 'Lưu thông tin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransportAssignmentModal;