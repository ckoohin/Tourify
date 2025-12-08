import React, { useState, useEffect } from 'react';
import { X, Save, Bus, Plane, Clock, DollarSign, FileText, User } from 'lucide-react';
import transportService from '../../../services/api/transportService';
import toast from 'react-hot-toast';

const TransportFormModal = ({ isOpen, onClose, initialData, departureId, onSuccess, drivers = [] }) => {
    const [formData, setFormData] = useState({
        transport_type: 'bus',
        transport_provider: '',
        route_from: '',
        route_to: '',
        departure_datetime: '',
        arrival_datetime: '', // [New]
        total_seats: 45,
        vehicle_number: '',
        flight_number: '',
        seat_class: '', // [New] (Economy, Business...)
        driver_id: '', // [New]
        unit_price: 0, // [New]
        currency: 'VND', // [New]
        booking_status: 'pending', // [New]
        booking_reference: '', // [New] (PNR/Code)
        notes: '' // [New]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                departure_datetime: initialData.departure_datetime ? initialData.departure_datetime.slice(0, 16) : '',
                arrival_datetime: initialData.arrival_datetime ? initialData.arrival_datetime.slice(0, 16) : '',
                driver_id: initialData.driver_id || '',
                // Đảm bảo các trường số không bị null
                unit_price: initialData.unit_price || 0,
                total_seats: initialData.total_seats || 45
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData, tour_departure_id: departureId };
            // Xử lý dữ liệu rỗng trước khi gửi
            if (!payload.arrival_datetime) delete payload.arrival_datetime;
            if (!payload.driver_id) delete payload.driver_id;

            if (initialData) {
                await transportService.update(initialData.id, payload);
                toast.success("Cập nhật phương tiện thành công");
            } else {
                await transportService.create(payload);
                toast.success("Thêm phương tiện thành công");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
        } finally {
            setIsSubmitting(false);
        }
    };

    if(!isOpen) return null;

    const isFlight = formData.transport_type === 'flight';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">{initialData ? 'Cập nhật Phương tiện' : 'Thêm Phương tiện Di chuyển'}</h3>
                        <p className="text-xs text-slate-500">Khai báo thông tin xe, chuyến bay, tàu hỏa...</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} className="text-slate-500"/></button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* 1. Loại & Nhà cung cấp */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại phương tiện <span className="text-red-500">*</span></label>
                            <select name="transport_type" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.transport_type} onChange={handleChange}>
                                <option value="bus">Xe du lịch (Bus)</option>
                                <option value="flight">Máy bay (Flight)</option>
                                <option value="train">Tàu hỏa (Train)</option>
                                <option value="boat">Tàu thủy (Boat)</option>
                                <option value="car">Xe riêng (Car)</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hãng / Nhà cung cấp <span className="text-red-500">*</span></label>
                            <input type="text" name="transport_provider" placeholder={isFlight ? "VD: Vietnam Airlines" : "VD: Nhà xe Minh Ngọc"} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.transport_provider} onChange={handleChange} required/>
                        </div>
                    </div>

                    {/* 2. Lộ trình & Thời gian */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
                            <Clock size={16}/> Lộ trình & Thời gian
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Điểm đi <span className="text-red-500">*</span></label>
                                <input type="text" name="route_from" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.route_from} onChange={handleChange} required/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Điểm đến <span className="text-red-500">*</span></label>
                                <input type="text" name="route_to" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.route_to} onChange={handleChange} required/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giờ khởi hành <span className="text-red-500">*</span></label>
                                <input type="datetime-local" name="departure_datetime" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.departure_datetime} onChange={handleChange} required/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giờ đến (Dự kiến)</label>
                                <input type="datetime-local" name="arrival_datetime" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.arrival_datetime} onChange={handleChange}/>
                            </div>
                        </div>
                    </div>

                    {/* 3. Chi tiết Phương tiện (Thay đổi theo loại) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                {isFlight ? "Số hiệu chuyến bay" : "Biển số xe / Số hiệu"}
                            </label>
                            <input 
                                type="text" 
                                name={isFlight ? "flight_number" : "vehicle_number"} 
                                placeholder={isFlight ? "VN123" : "29B-12345"}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={isFlight ? formData.flight_number : formData.vehicle_number} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tổng số ghế <span className="text-red-500">*</span></label>
                            <input type="number" name="total_seats" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.total_seats} onChange={handleChange} required min="1"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                {isFlight ? "Hạng vé" : "Loại ghế/xe"}
                            </label>
                            <input type="text" name="seat_class" placeholder={isFlight ? "Economy" : "Giường nằm"} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.seat_class} onChange={handleChange}/>
                        </div>
                    </div>

                    {/* 4. Tài xế & Booking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã đặt chỗ (PNR/Reference)</label>
                            <input type="text" name="booking_reference" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" placeholder="ABCXYZ" value={formData.booking_reference} onChange={handleChange}/>
                        </div>
                    </div>

                    {/* 5. Chi phí & Ghi chú */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                <DollarSign size={14}/> Giá đơn vị (Dự kiến)
                            </label>
                            <div className="relative">
                                <input type="number" name="unit_price" className="w-full border rounded-lg pl-3 pr-12 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.unit_price} onChange={handleChange} min="0"/>
                                <span className="absolute right-3 top-2 text-xs text-slate-500 font-bold">{formData.currency}</span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                <FileText size={14}/> Ghi chú nội bộ
                            </label>
                            <input type="text" name="notes" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Lưu ý về điểm đón, hành lý..." value={formData.notes} onChange={handleChange}/>
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 sticky bottom-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white font-bold text-sm transition-all">Hủy</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-70">
                        {isSubmitting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={18}/>}
                        {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransportFormModal;