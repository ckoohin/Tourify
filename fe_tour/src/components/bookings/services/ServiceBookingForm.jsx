import React, { useState, useEffect } from 'react';
import { X, Save, Building, Calendar, DollarSign, FileText, Users, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import serviceBookingService from '../../../services/api/serviceBookingService';
import supplierService from '../../../services/api/supplierService'; 
import { validateServiceBooking } from '../../../utils/validators/serviceBookingRules';

const ServiceBookingForm = ({ isOpen, onClose, onSuccess, initialData, departureId }) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tour_departure_id: departureId,
    supplier_id: '',
    service_date: '',
    service_time: '',
    quantity: 1,
    unit_price: 0,
    currency: 'VND',
    notes: '',
    confirmation_number: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchSuppliers = async () => {
        try {
            const res = await supplierService.getAll({ status: 'active', limit: 100 });
            if (res.success) {
                setSuppliers(res.data.suppliers || res.data || []);
            }
        } catch (e) { console.error(e); }
      };
      fetchSuppliers();

      if (initialData) {
        setFormData({
            ...initialData,
            service_date: initialData.service_date ? initialData.service_date.split('T')[0] : '',
            supplier_id: initialData.supplier_id || '',
        });
      } else {
        setFormData({
            tour_departure_id: departureId,
            supplier_id: '',
            service_date: new Date().toISOString().split('T')[0],
            service_time: '',
            quantity: 1,
            unit_price: 0,
            currency: 'VND',
            notes: '',
            confirmation_number: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, departureId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateServiceBooking(formData);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setLoading(true);
    try {
        const payload = {
            ...formData,
            quantity: Number(formData.quantity),
            unit_price: Number(formData.unit_price),
        };

        if (initialData) {
            await serviceBookingService.update(initialData.id, payload);
            toast.success("Cập nhật dịch vụ thành công");
        } else {
            await serviceBookingService.create(payload);
            toast.success("Đặt dịch vụ thành công");
        }
        onSuccess();
        onClose();
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi xử lý");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = Number(formData.quantity) * Number(formData.unit_price);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-lg text-slate-800">
                {initialData ? 'Cập nhật Booking Dịch vụ' : 'Đặt Dịch vụ Mới'}
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* Supplier */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Building size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <select 
                        name="supplier_id" 
                        value={formData.supplier_id} 
                        onChange={handleChange} 
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white appearance-none ${errors.supplier_id ? 'border-red-500' : 'border-slate-300'}`}
                    >
                        <option value="">-- Chọn Nhà cung cấp --</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.company_name} ({s.type})</option>
                        ))}
                    </select>
                </div>
                {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sử dụng <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                    </div>
                    {errors.service_date && <p className="text-red-500 text-xs mt-1">{errors.service_date}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giờ (Tùy chọn)</label>
                    <input type="time" name="service_time" value={formData.service_time} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Users size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá ({formData.currency})</label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="number" name="unit_price" min="0" value={formData.unit_price} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                    </div>
                </div>
            </div>

            {/* Total Readonly */}
            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                <span className="text-sm text-blue-800 font-medium">Thành tiền dự kiến:</span>
                <span className="text-lg font-bold text-blue-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
            </div>

            {initialData && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã xác nhận (Supplier Ref)</label>
                    <div className="relative">
                        <Hash size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="text" name="confirmation_number" value={formData.confirmation_number || ''} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg" placeholder="VD: RES-123456"/>
                    </div>
                </div>
            )}

            {/* Note */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Yêu cầu đặc biệt..."></textarea>
            </div>

        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 text-sm font-medium text-slate-700">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                <Save size={16}/> {loading ? 'Đang lưu...' : 'Lưu Booking'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingForm;