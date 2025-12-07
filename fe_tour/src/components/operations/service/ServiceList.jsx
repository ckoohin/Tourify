import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, Calendar, CheckCircle, Clock, XCircle, 
  Edit, Trash2, Check, Plus, X, Save, Building, 
  Users, DollarSign, Hash, AlertCircle, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import serviceBookingService from '../../../services/api/serviceBookingService';
import supplierService from '../../../services/api/supplierService';

const ServiceBookingManager = ({ departureId }) => {
  // --- STATE QUẢN LÝ DANH SÁCH ---
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE QUẢN LÝ MODAL FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  
  // --- STATE FORM DATA ---
  const initialFormState = {
    tour_departure_id: departureId,
    supplier_id: '',
    service_date: new Date().toISOString().split('T')[0],
    service_time: '',
    quantity: 1,
    unit_price: 0,
    currency: 'VND',
    notes: '',
    confirmation_number: '',
    status: 'pending' // [NEW] Thêm trạng thái mặc định
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 1. LOGIC XỬ LÝ DANH SÁCH (LIST VIEW)
  // ==========================================

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceBookingService.getByDepartureId(departureId);
      // Xử lý linh hoạt cấu trúc response
      const data = res.data?.data || res.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureId) fetchServices();
  }, [departureId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) return;
    try {
      await serviceBookingService.delete(id);
      toast.success("Đã xóa dịch vụ");
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleQuickConfirm = async (id) => {
    const code = prompt("Nhập mã xác nhận (Booking Ref) từ nhà cung cấp:");
    if (code === null) return; 
    
    try {
      await serviceBookingService.updateStatus(id, 'confirmed', code);
      toast.success("Đã xác nhận dịch vụ");
      fetchServices();
    } catch (error) {
      toast.error("Lỗi khi xác nhận");
    }
  };

  const formatMoney = (amount, currency) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // ==========================================
  // 2. LOGIC XỬ LÝ FORM (MODAL)
  // ==========================================

  const openCreateModal = () => {
    setEditingBooking(null);
    setFormData({ ...initialFormState, tour_departure_id: departureId });
    setFormErrors({});
    setIsModalOpen(true);
    fetchSuppliers();
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      service_date: booking.service_date ? booking.service_date.split('T')[0] : '',
      supplier_id: booking.supplier_id,
      status: booking.status || 'pending' // [NEW] Load trạng thái hiện tại
    });
    setFormErrors({});
    setIsModalOpen(true);
    fetchSuppliers();
  };

  const fetchSuppliers = async () => {
    if (suppliers.length > 0) return;
    try {
      const res = await supplierService.getAll({ status: 'active', limit: 100 });
      const list = res.data?.suppliers || res.data || [];
      setSuppliers(list);
    } catch (error) {
      console.error("Lỗi tải suppliers", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.supplier_id) errors.supplier_id = "Vui lòng chọn nhà cung cấp";
    if (!formData.service_date) errors.service_date = "Vui lòng chọn ngày";
    if (formData.quantity < 1) errors.quantity = "Số lượng phải lớn hơn 0";
    if (formData.unit_price < 0) errors.unit_price = "Đơn giá không hợp lệ";
    return errors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
        // status đã có trong formData
      };

      if (editingBooking) {
        // 1. Cập nhật thông tin cơ bản
        await serviceBookingService.update(editingBooking.id, payload);
        
        // 2. [FIX] Gọi thêm API updateStatus nếu trạng thái thay đổi
        // Vì API update thường không cho phép đổi status
        if (formData.status !== editingBooking.status) {
           await serviceBookingService.updateStatus(editingBooking.id, formData.status, formData.confirmation_number);
        }

        toast.success("Cập nhật thành công");
      } else {
        await serviceBookingService.create(payload);
        toast.success("Đặt dịch vụ mới thành công");
      }
      
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedTotal = useMemo(() => {
    return (Number(formData.quantity) || 0) * (Number(formData.unit_price) || 0);
  }, [formData.quantity, formData.unit_price]);

  // ==========================================
  // 3. RENDER UI
  // ==========================================

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Chờ xác nhận' },
      confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Đã xác nhận' },
      completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Đã hủy' }
    };
    const item = config[status] || config.pending;
    const Icon = item.icon;
    return (
      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${item.color}`}>
        <Icon size={12}/> {item.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Bus className="text-blue-600" size={20}/> 
          Quản lý Dịch vụ & Nhà cung cấp
        </h3>
        <button 
          onClick={openCreateModal}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={16}/> Thêm dịch vụ
        </button>
      </div>

      {/* BODY: TABLE LIST */}
      <div className="p-0">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-blue-500" size={24}/>
            Đang tải dữ liệu...
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <Bus size={48} className="mb-3 opacity-20"/>
            <p>Chưa có dịch vụ nào được đặt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nhà cung cấp</th>
                  <th className="px-4 py-3">Dịch vụ / Ref</th>
                  <th className="px-4 py-3">Ngày sử dụng</th>
                  <th className="px-4 py-3 text-center">SL</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-700">{item.supplier_name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-medium bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">{item.supplier_type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium">{item.service_name || 'Dịch vụ lẻ'}</div>
                      {item.confirmation_number && (
                        <div className="text-xs text-blue-600 font-mono mt-0.5 flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                          <Hash size={10}/> {item.confirmation_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium">{formatDate(item.service_date)}</div>
                      {item.service_time && <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10}/> {item.service_time.slice(0,5)}</div>}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatMoney(item.total_amount, item.currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {item.status === 'pending' && (
                          <button onClick={() => handleQuickConfirm(item.id)} className="p-1.5 text-green-600 bg-white border border-slate-200 hover:bg-green-50 hover:border-green-200 rounded-lg transition-all" title="Xác nhận nhanh">
                            <Check size={16}/>
                          </button>
                        )}
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 rounded-lg transition-all" title="Sửa">
                          <Edit size={16}/>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all" title="Xóa">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL OVERLAY (FORM) 
         ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {editingBooking ? <Edit size={18} className="text-blue-600"/> : <Plus size={18} className="text-blue-600"/>}
                {editingBooking ? 'Cập nhật Dịch vụ' : 'Đặt Dịch vụ Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-3 text-slate-400"/>
                  <select 
                    name="supplier_id" 
                    value={formData.supplier_id} 
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formErrors.supplier_id ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'}`}
                  >
                    <option value="">-- Chọn Nhà cung cấp --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name} ({s.type})</option>
                    ))}
                  </select>
                </div>
                {formErrors.supplier_id && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={12}/> {formErrors.supplier_id}</p>}
              </div>

              {/* Status Selection [NEW] */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Trạng thái
                </label>
                <div className="flex gap-2">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <label key={status} className={`
                            flex-1 cursor-pointer text-center py-2 rounded-lg text-xs font-bold border-2 transition-all select-none
                            ${formData.status === status 
                                ? (status === 'cancelled' ? 'border-red-500 bg-red-50 text-red-700' : status === 'confirmed' ? 'border-blue-500 bg-blue-50 text-blue-700' : status === 'completed' ? 'border-green-500 bg-green-50 text-green-700' : 'border-yellow-500 bg-yellow-50 text-yellow-700')
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }
                        `}>
                            <input 
                                type="radio" 
                                name="status" 
                                value={status} 
                                checked={formData.status === status} 
                                onChange={handleFormChange} 
                                className="hidden" 
                            />
                            {status === 'pending' ? 'Chờ xác nhận' : status === 'confirmed' ? 'Đã xác nhận' : status === 'completed' ? 'Hoàn thành' : 'Hủy'}
                        </label>
                    ))}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày sử dụng <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="date" 
                      name="service_date" 
                      value={formData.service_date} 
                      onChange={handleFormChange} 
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formErrors.service_date ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'}`}
                    />
                  </div>
                  {formErrors.service_date && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.service_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Giờ đón</label>
                  <input 
                    type="time" 
                    name="service_time" 
                    value={formData.service_time} 
                    onChange={handleFormChange} 
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quantity & Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Số lượng <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="number" 
                      name="quantity" 
                      min="1" 
                      value={formData.quantity} 
                      onChange={handleFormChange} 
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Đơn giá (VND)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="number" 
                      name="unit_price" 
                      min="0" 
                      value={formData.unit_price} 
                      onChange={handleFormChange} 
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount Preview */}
              <div className="bg-blue-50/50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
                <span className="text-sm text-blue-800 font-medium">Thành tiền dự kiến:</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatMoney(estimatedTotal)}
                </span>
              </div>

              {/* Confirmation Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã xác nhận (Supplier Ref)</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-3 text-slate-400"/>
                  <input 
                    type="text" 
                    name="confirmation_number" 
                    value={formData.confirmation_number || ''} 
                    onChange={handleFormChange} 
                    placeholder="VD: RES-888-999"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú nội bộ</label>
                <textarea 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleFormChange} 
                  rows={3} 
                  placeholder="Ghi chú về thực đơn, yêu cầu đặc biệt, điểm đón..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-sm font-bold text-slate-700 transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSubmitting} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={16}/> Đang lưu...
                  </span>
                ) : (
                  <><Save size={18}/> {editingBooking ? 'Cập nhật' : 'Tạo Dịch Vụ'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceBookingManager;