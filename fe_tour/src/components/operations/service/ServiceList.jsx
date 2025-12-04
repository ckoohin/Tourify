import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, Calendar, FileText, CheckCircle, Clock, XCircle, 
  Edit, Trash2, Check, Plus, X, Save, Building, 
  Users, DollarSign, Hash, AlertCircle 
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
  const [editingBooking, setEditingBooking] = useState(null); // null = mode create, object = mode edit
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
    confirmation_number: ''
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
      if (res.data) {
        setServices(res.data.data || res.data || []);
      }
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
    if (code === null) return; // Người dùng ấn hủy
    
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

  // Mở modal để tạo mới
  const openCreateModal = () => {
    setEditingBooking(null);
    setFormData({ ...initialFormState, tour_departure_id: departureId });
    setFormErrors({});
    setIsModalOpen(true);
    fetchSuppliers();
  };

  // Mở modal để edit
  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      service_date: booking.service_date ? booking.service_date.split('T')[0] : '',
      supplier_id: booking.supplier_id, // Đảm bảo mapping đúng ID
    });
    setFormErrors({});
    setIsModalOpen(true);
    fetchSuppliers();
  };

  // Lấy danh sách nhà cung cấp cho dropdown
  const fetchSuppliers = async () => {
    if (suppliers.length > 0) return; // Đã tải rồi thì thôi
    try {
      const res = await supplierService.getAll({ status: 'active', limit: 100 });
      // Xử lý tùy theo cấu trúc trả về của API supplier
      const list = res.data?.suppliers || res.data || [];
      setSuppliers(list);
    } catch (error) {
      console.error("Lỗi tải suppliers", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear lỗi khi user nhập lại
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
      };

      if (editingBooking) {
        await serviceBookingService.update(editingBooking.id, payload);
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

  // Tính tổng tiền realtime trong form
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
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${item.color}`}>
        <Icon size={10}/> {item.label}
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
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 transition-colors"
        >
          <Plus size={16}/> Thêm dịch vụ
        </button>
      </div>

      {/* BODY: TABLE LIST */}
      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
            <Bus size={48} className="mb-2 opacity-20"/>
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
                      <div className="text-[10px] text-slate-500 uppercase">{item.supplier_type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium">{item.service_name || 'Dịch vụ lẻ'}</div>
                      {item.confirmation_number && (
                        <div className="text-xs text-blue-600 font-mono mt-0.5 flex items-center gap-1">
                          <Hash size={10}/> {item.confirmation_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{formatDate(item.service_date)}</div>
                      {item.service_time && <div className="text-xs text-slate-400">{item.service_time.slice(0,5)}</div>}
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
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'pending' && (
                          <button onClick={() => handleQuickConfirm(item.id)} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded border border-green-200" title="Xác nhận nhanh">
                            <Check size={14}/>
                          </button>
                        )}
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200" title="Sửa">
                          <Edit size={14}/>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200" title="Xóa">
                          <Trash2 size={14}/>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center rounded-t-xl">
              <h3 className="font-bold text-lg text-slate-800">
                {editingBooking ? 'Cập nhật Dịch vụ' : 'Đặt Dịch vụ Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <select 
                    name="supplier_id" 
                    value={formData.supplier_id} 
                    onChange={handleFormChange}
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.supplier_id ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    <option value="">-- Chọn Nhà cung cấp --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name} ({s.type})</option>
                    ))}
                  </select>
                </div>
                {formErrors.supplier_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.supplier_id}</p>}
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sử dụng <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="date" 
                      name="service_date" 
                      value={formData.service_date} 
                      onChange={handleFormChange} 
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.service_date ? 'border-red-500' : 'border-slate-300'}`}
                    />
                  </div>
                  {formErrors.service_date && <p className="text-red-500 text-xs mt-1">{formErrors.service_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giờ đón (Tùy chọn)</label>
                  <input 
                    type="time" 
                    name="service_time" 
                    value={formData.service_time} 
                    onChange={handleFormChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Quantity & Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="number" 
                      name="quantity" 
                      min="1" 
                      value={formData.quantity} 
                      onChange={handleFormChange} 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá (VND)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="number" 
                      name="unit_price" 
                      min="0" 
                      value={formData.unit_price} 
                      onChange={handleFormChange} 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount Preview */}
              <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
                <span className="text-sm text-blue-800 font-medium">Thành tiền dự kiến:</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatMoney(estimatedTotal)}
                </span>
              </div>

              {/* Confirmation Number (Chỉ hiển thị khi Edit hoặc nếu muốn nhập luôn lúc tạo) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã xác nhận (Supplier Ref)</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <input 
                    type="text" 
                    name="confirmation_number" 
                    value={formData.confirmation_number || ''} 
                    onChange={handleFormChange} 
                    placeholder="VD: RES-888-999"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Nhập nếu nhà cung cấp đã gửi mã xác nhận.</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nội bộ</label>
                <textarea 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleFormChange} 
                  rows={3} 
                  placeholder="Ghi chú về thực đơn, yêu cầu đặc biệt, điểm đón..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSubmitting} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <>Đang lưu...</> 
                ) : (
                  <><Save size={16}/> {editingBooking ? 'Cập nhật' : 'Tạo Booking'}</>
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