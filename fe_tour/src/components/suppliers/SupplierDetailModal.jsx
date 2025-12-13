import React from 'react';
import { X, Building2, MapPin, Wallet, User, Phone, Mail, Globe, FileText, Star, ShieldCheck, Bus, Hotel, Utensils, Map as MapIcon } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const DetailRow = ({ label, value, icon: Icon, className = "" }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors ${className}`}>
    {Icon && <Icon size={18} className="text-slate-400 mt-0.5 shrink-0" />}
    <div className="flex-1">
      <p className="text-xs font-medium text-slate-500 uppercase mb-0.5">{label}</p>
      <div className="text-sm text-slate-800 font-medium break-words">
        {value || <span className="text-slate-300 italic">Chưa cập nhật</span>}
      </div>
    </div>
  </div>
);

const SupplierDetailModal = ({ isOpen, onClose, supplier }) => {
  if (!isOpen || !supplier) return null;

  const getTypeInfo = (type) => {
    switch(type) {
        case 'hotel': return { label: 'Khách sạn', icon: Hotel, color: 'text-blue-600' };
        case 'restaurant': return { label: 'Nhà hàng', icon: Utensils, color: 'text-orange-600' };
        case 'transport': return { label: 'Vận chuyển', icon: Bus, color: 'text-purple-600' };
        case 'attraction': return { label: 'Tham quan', icon: MapIcon, color: 'text-green-600' };
        case 'insurance': return { label: 'Bảo hiểm', icon: ShieldCheck, color: 'text-red-600' };
        case 'visa': return { label: 'Visa / Giấy tờ', icon: FileText, color: 'text-indigo-600' };
        default: return { label: 'Khác', icon: Building2, color: 'text-slate-600' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const typeInfo = getTypeInfo(supplier.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex justify-between items-start shrink-0">
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                    <Building2 size={32} />
                </div>
                <div className="text-white">
                    <h3 className="font-bold text-xl md:text-2xl">{supplier.company_name}</h3>
                    <div className="flex items-center gap-3 text-slate-300 text-sm mt-1">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{supplier.code}</span>
                        <span className="flex items-center gap-1 text-white"><TypeIcon size={14}/> {typeInfo.label}</span>
                        <span>•</span>
                        <StatusBadge level={supplier.status === 'active' ? 'success' : supplier.status === 'blacklist' ? 'danger' : 'warning'} text={supplier.status === 'active' ? 'Đang hoạt động' : supplier.status === 'blacklist' ? 'Blacklist' : 'Tạm ngưng'} />
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
            
            {/* THỐNG KÊ NHANH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FileText size={24}/></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Tổng đơn hàng</p>
                        <p className="text-xl font-bold text-slate-800">{supplier.total_bookings || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Star size={24}/></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Đánh giá</p>
                        <p className="text-xl font-bold text-slate-800">{supplier.rating || 0}/5</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full"><Wallet size={24}/></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Hạn mức tín dụng</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(supplier.credit_limit)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ & PHÁP LÝ */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <MapPin size={16} className="text-red-500"/> Liên hệ & Địa chỉ
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailRow label="Người liên hệ" value={supplier.contact_person} icon={User} className="font-bold text-slate-800"/>
                            <DetailRow label="Điện thoại" value={supplier.phone} icon={Phone} className="text-blue-600"/>
                            <DetailRow label="Email" value={supplier.email} icon={Mail} />
                            <DetailRow label="Website" value={supplier.website ? <a href={supplier.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{supplier.website}</a> : null} icon={Globe} />
                            <DetailRow label="Địa chỉ" value={[supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ')} icon={MapPin} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <Building2 size={16} className="text-slate-500"/> Pháp lý
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailRow label="Tên công ty" value={supplier.company_name} icon={Building2} />
                            <DetailRow label="Mã số thuế" value={supplier.tax_code} icon={FileText} />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TÀI CHÍNH & GHI CHÚ */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <Wallet size={16} className="text-green-600"/> Tài chính & Thanh toán
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailRow label="Điều khoản thanh toán" value={supplier.payment_terms} icon={FileText} className="font-medium text-slate-700"/>
                            <DetailRow label="Hạn mức nợ" value={formatCurrency(supplier.credit_limit)} icon={Wallet} />
                        </div>
                    </div>

                    {/* GHI CHÚ */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <FileText size={16} className="text-orange-500"/> Ghi chú nội bộ
                        </div>
                        <div className="p-4">
                            {supplier.notes ? (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900 whitespace-pre-line leading-relaxed">
                                    {supplier.notes}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic text-sm text-center py-4">Không có ghi chú nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;