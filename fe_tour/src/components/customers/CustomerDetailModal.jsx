import React from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, FileText, Calendar, CreditCard, Shield, AlertTriangle } from 'lucide-react';

const DetailRow = ({ label, value, icon: Icon, className = "" }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors ${className}`}>
    {Icon && <Icon size={18} className="text-slate-400 mt-0.5 shrink-0" />}
    <div className="flex-1">
      <p className="text-xs font-medium text-slate-500 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium break-words">
        {value || <span className="text-slate-300 italic">Chưa cập nhật</span>}
      </p>
    </div>
  </div>
);

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const getGenderLabel = (gender) => {
    const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return map[gender] || gender;
  };

  const getTypeLabel = (type) => {
    const map = { 
        individual: 'Khách cá nhân', 
        company: 'Doanh nghiệp', 
        agent: 'Đại lý lữ hành' 
    };
    return map[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-start shrink-0">
            <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/30 shadow-inner">
                    <User size={28} />
                </div>
                <div className="text-white">
                    <h3 className="font-bold text-xl md:text-2xl">{customer.full_name}</h3>
                    <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                        <span className="font-mono bg-blue-800/50 px-2 py-0.5 rounded">{customer.customer_code || 'Chưa có mã'}</span>
                        <span>•</span>
                        <span>{getTypeLabel(customer.customer_type)}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
            >
                <X size={24} />
            </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            
            <div className="flex gap-3 mb-6">
                {String(customer.is_vip) === '1' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200 shadow-sm">
                        <Shield size={18} className="fill-yellow-500 text-yellow-600"/>
                        <span className="font-bold text-sm">Khách hàng VIP</span>
                    </div>
                )}
                {String(customer.is_blacklist) === '1' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200 shadow-sm">
                        <AlertTriangle size={18} className="text-red-600"/>
                        <span className="font-bold text-sm">Danh sách đen (Blacklist)</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. THÔNG TIN CÁ NHÂN */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                        <User size={16} className="text-blue-500"/> Thông tin cá nhân
                    </div>
                    <div className="p-3 grid grid-cols-1 gap-1">
                        <DetailRow label="Ngày sinh" value={formatDate(customer.birthday)} icon={Calendar} />
                        <DetailRow label="Giới tính" value={getGenderLabel(customer.gender)} icon={User} />
                        <DetailRow label="CMND/CCCD/Hộ chiếu" value={customer.id_number} icon={CreditCard} />
                        <DetailRow label="Quốc tịch" value={customer.nationality} icon={MapPin} />
                    </div>
                </div>

                {/* 2. THÔNG TIN LIÊN HỆ */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                        <Phone size={16} className="text-green-500"/> Thông tin liên hệ
                    </div>
                    <div className="p-3 grid grid-cols-1 gap-1">
                        <DetailRow label="Số điện thoại" value={customer.phone} icon={Phone} className="text-blue-600 font-bold" />
                        <DetailRow label="Email" value={customer.email} icon={Mail} />
                        <DetailRow 
                            label="Địa chỉ" 
                            value={[customer.address, customer.city, customer.country].filter(Boolean).join(', ')} 
                            icon={MapPin} 
                        />
                    </div>
                </div>

                {/* 3. THÔNG TIN DOANH NGHIỆP (Nếu có) */}
                {(customer.company_name || customer.tax_code) && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden md:col-span-2">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <Briefcase size={16} className="text-purple-500"/> Thông tin Doanh nghiệp / Đại lý
                        </div>
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1">
                            <DetailRow label="Tên công ty" value={customer.company_name} icon={Briefcase} />
                            <DetailRow label="Mã số thuế" value={customer.tax_code} icon={FileText} />
                        </div>
                    </div>
                )}

                {/* 4. GHI CHÚ & KHÁC */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden md:col-span-2">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                        <FileText size={16} className="text-orange-500"/> Ghi chú & Nguồn
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <DetailRow label="Nguồn khách hàng" value={customer.customer_source} />
                             <DetailRow label="Ngày tạo" value={formatDate(customer.created_at)} />
                        </div>
                        {customer.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-amber-900 text-sm">
                                <p className="font-bold mb-1 text-amber-700 uppercase text-xs">Ghi chú đặc biệt:</p>
                                {customer.notes}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
            <button 
                onClick={onClose} 
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;