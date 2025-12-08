import React, { useState, useEffect } from 'react';
import { 
  Bus, Plane, Train, Ship, Plus, Edit2, Trash2, Users, 
  MapPin, Clock, Ticket, AlertCircle, CheckCircle2 
} from 'lucide-react';
import transportService from '../../../services/api/transportService';
import toast from 'react-hot-toast';
import TransportAssignmentModal from './TransportAssignmentModal';
import TransportFormModal from './TransportFormModal'; 

const TRANSPORT_CONFIG = {
    bus: { label: 'Xe du lịch', icon: Bus, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    flight: { label: 'Máy bay', icon: Plane, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    train: { label: 'Tàu hỏa', icon: Train, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    boat: { label: 'Tàu thủy', icon: Ship, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    other: { label: 'Khác', icon: MapPin, color: 'text-slate-600 bg-slate-50 border-slate-200' }
};

const TourTransportManager = ({ departureId }) => {
    const [transports, setTransports] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransport, setEditingTransport] = useState(null);
    const [assignmentModalData, setAssignmentModalData] = useState(null); // Lưu transport đang mở xếp chỗ

    const fetchTransports = async () => {
        setLoading(true);
        try {
            const res = await transportService.getByDeparture(departureId);
            setTransports(res.data?.transports || []);
        } catch (error) {
            toast.error("Lỗi tải danh sách vận chuyển");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (departureId) fetchTransports();
    }, [departureId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa phương tiện này?")) return;
        try {
            await transportService.delete(id);
            toast.success("Đã xóa phương tiện");
            fetchTransports();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa");
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Bus size={20} className="text-blue-600"/> Quản lý Vận chuyển
                </h3>
                <button 
                    onClick={() => { setEditingTransport(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
                >
                    <Plus size={18}/> Thêm phương tiện
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pb-10">
                {transports.map(item => {
                    const Config = TRANSPORT_CONFIG[item.transport_type] || TRANSPORT_CONFIG.other;
                    const Icon = Config.icon;
                    const percent = Math.round((item.assigned_guests / item.total_seats) * 100) || 0;

                    return (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative group">
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingTransport(item); setIsFormOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${Config.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${Config.color.replace('bg-', 'bg-opacity-20 ')}`}>
                                            {Config.label}
                                        </span>
                                        {item.booking_status === 'ticketed' && <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 size={12}/> Đã xuất vé</span>}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg truncate">
                                        {item.route_from} <span className="text-slate-400">➝</span> {item.route_to}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(item.departure_datetime).toLocaleString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                                        {item.transport_provider && <span className="flex items-center gap-1"><Ticket size={14}/> {item.transport_provider} ({item.vehicle_number || item.flight_number})</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Capacity Bar */}
                            <div className="mt-5">
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className="text-slate-500">Sức chứa: {item.total_seats} chỗ</span>
                                    <span className={percent >= 100 ? 'text-red-600' : 'text-blue-600'}>
                                        Đã xếp: {item.assigned_guests} ({percent}%)
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${Math.min(percent, 100)}%` }} className={`h-full rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setAssignmentModalData(item)}
                                className="mt-4 w-full py-2.5 rounded-lg border border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Users size={16}/> Quản lý xếp chỗ / Sơ đồ ghế
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {isFormOpen && (
                <TransportFormModal 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    initialData={editingTransport}
                    departureId={departureId}
                    onSuccess={fetchTransports}
                />
            )}

            {assignmentModalData && (
                <TransportAssignmentModal 
                    isOpen={!!assignmentModalData}
                    onClose={() => { setAssignmentModalData(null); fetchTransports(); }} 
                    transport={assignmentModalData}
                    departureId={departureId}
                />
            )}
        </div>
    );
};

export default TourTransportManager;