import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Check, X, MessageSquare, Trash2, Edit, User, Calendar } from 'lucide-react';
import guestRequestService from '../../../services/api/guestRequestService';
import { REQUEST_TYPES, PRIORITIES, STATUSES } from './GuestRequestConfig';
import GuestRequestFormModal from './GuestRequestFormModal';
import toast from 'react-hot-toast';
import departureService from '../../../services/api/departureService'; 

const GuestRequestManager = ({ departureId }) => {
    const [requests, setRequests] = useState([]);
    const [guests, setGuests] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null); 

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, guestRes] = await Promise.all([
                guestRequestService.getByDeparture(departureId),
                departureService.getGuests(departureId, { limit: 100 }) 
            ]);
            
            // Xử lý Requests
            const reqList = reqRes.data?.requests || reqRes.data?.data || reqRes.data || [];
            setRequests(Array.isArray(reqList) ? reqList : []);
            
            // Xử lý Guests (Logic an toàn như cũ)
            let guestList = [];
            if (Array.isArray(guestRes.data)) {
                guestList = guestRes.data;
            } else if (guestRes.data && Array.isArray(guestRes.data.data)) {
                guestList = guestRes.data.data;
            } else if (guestRes.data && Array.isArray(guestRes.data.guests)) {
                guestList = guestRes.data.guests;
            }
            
            setGuests(guestList);

        } catch (error) {
            console.error(error);
            toast.error("Không tải được dữ liệu yêu cầu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(departureId) fetchData();
    }, [departureId]);

    // Handle Update Status
    const handleUpdateStatus = async (id, newStatus) => {
        const notes = newStatus === 'fulfilled' ? 'Đã xử lý xong' : 
                      newStatus === 'cannot_fulfill' ? prompt("Nhập lý do không thể đáp ứng:") : null;
        
        if (newStatus === 'cannot_fulfill' && !notes) return; 

        setStatusUpdating(id);
        try {
            await guestRequestService.updateStatus(id, newStatus, notes);
            toast.success("Đã cập nhật trạng thái");
            fetchData();
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        } finally {
            setStatusUpdating(null);
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa yêu cầu này?")) return;
        try {
            await guestRequestService.delete(id);
            toast.success("Đã xóa yêu cầu");
            fetchData();
        } catch (e) { toast.error("Lỗi xóa"); }
    };

    // Render Card Item
    const RequestCard = ({ req }) => {
        const TypeConfig = REQUEST_TYPES[req.request_type] || REQUEST_TYPES.other;
        const PriorityConfig = PRIORITIES[req.priority] || PRIORITIES.medium;
        const StatusConfig = STATUSES[req.status] || STATUSES.pending;
        const TypeIcon = TypeConfig.icon;
        const PriorityIcon = PriorityConfig.icon;

        return (
            <div className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md flex flex-col h-full ${req.priority === 'critical' ? 'border-red-300 shadow-red-50' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${TypeConfig.color}`}>
                            <TypeIcon size={18}/>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate pr-2" title={req.title}>{req.title}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <User size={12} />
                                <span className="font-medium text-slate-700 truncate max-w-[100px]" title={req.full_name}>{req.full_name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 border ${PriorityConfig.color}`}>
                        <PriorityIcon size={10}/> {PriorityConfig.label}
                    </div>
                </div>

                <div className="flex-1">
                    {req.description ? (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg mb-3 italic leading-relaxed">
                            "{req.description}"
                        </p>
                    ) : (
                        <p className="text-sm text-slate-400 italic mb-3">Không có mô tả chi tiết.</p>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${StatusConfig.color}`}>
                        <StatusConfig.icon size={12}/> {StatusConfig.label}
                    </div>

                    <div className="flex items-center gap-1">
                        {req.status === 'pending' && (
                            <button onClick={() => handleUpdateStatus(req.id, 'acknowledged')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Tiếp nhận">
                                <Check size={16}/>
                            </button>
                        )}
                        {['pending', 'acknowledged'].includes(req.status) && (
                            <>
                                <button onClick={() => handleUpdateStatus(req.id, 'fulfilled')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Hoàn thành">
                                    <Check size={16}/>
                                </button>
                                <button onClick={() => handleUpdateStatus(req.id, 'cannot_fulfill')} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Không thể đáp ứng">
                                    <X size={16}/>
                                </button>
                            </>
                        )}
                        
                        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                        
                        <button onClick={() => { setEditingRequest(req); setIsFormOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(req.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
                    </div>
                </div>

                {req.notes && (
                    <div className="mt-3 text-[11px] text-slate-500 border-t border-dashed border-slate-200 pt-2">
                        <span className="font-bold flex items-center gap-1 mb-0.5"><MessageSquare size={10}/> Ghi chú xử lý:</span>
                        <div className="whitespace-pre-wrap pl-3.5 border-l-2 border-slate-200">{req.notes}</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        // [UPDATE] Xóa h-full để content tự giãn
        <div className="flex flex-col bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MessageSquare size={20}/></div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-none">Yêu cầu đặc biệt</h3>
                        <p className="text-xs text-slate-500 mt-1">Quản lý các yêu cầu ăn uống, y tế, hỗ trợ...</p>
                    </div>
                    <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{requests.length}</span>
                </div>
                <button 
                    onClick={() => { setEditingRequest(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={18}/> Thêm yêu cầu
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                    <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></span>
                    <span>Đang tải dữ liệu...</span>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 shadow-sm text-slate-300">
                        <Filter size={28}/>
                    </div>
                    <p className="text-slate-500 font-medium">Chưa có yêu cầu đặc biệt nào.</p>
                    <p className="text-slate-400 text-sm mt-1">Nhấn "Thêm yêu cầu" để tạo mới.</p>
                </div>
            ) : (
                // [UPDATE] Xóa overflow-y-auto, maxHeight và custom-scrollbar
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {requests.map(req => <RequestCard key={req.id} req={req} />)}
                </div>
            )}

            {/* Modal */}
            <GuestRequestFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchData}
                initialData={editingRequest}
                guests={guests} 
            />
        </div>
    );
};

export default GuestRequestManager;