import React from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, FileText, Calendar, CreditCard, Bus, Star, Award, HeartPulse } from 'lucide-react';
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

const StaffDetailModal = ({ isOpen, onClose, staff, stats }) => {
  if (!isOpen || !staff) return null;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderLabel = (gender) => {
    const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return map[gender] || gender;
  };

  const getRoleLabel = (type) => {
    const map = {
        tour_guide: 'Hướng dẫn viên',
        tour_leader: 'Trưởng đoàn',
        driver: 'Tài xế',
        coordinator: 'Điều hành',
        other: 'Khác'
    };
    return map[type] || type;
  };

  const parseArray = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      try {
          return JSON.parse(data);
      } catch (e) {
          return data.split(',').map(i => i.trim());
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-5 flex justify-between items-start shrink-0">
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-700 border-4 border-white/20 shadow-inner font-bold text-2xl">
                    {staff.full_name?.charAt(0)}
                </div>
                <div className="text-white">
                    <h3 className="font-bold text-2xl">{staff.full_name}</h3>
                    <div className="flex items-center gap-3 text-blue-100 text-sm mt-1">
                        <span className="font-mono bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/30">#{staff.staff_code}</span>
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {getRoleLabel(staff.staff_type)}</span>
                        <span>•</span>
                        <StatusBadge level={staff.status === 'active' ? 'success' : staff.status === 'on_leave' ? 'warning' : 'danger'} text={staff.status === 'active' ? 'Đang làm việc' : staff.status === 'on_leave' ? 'Nghỉ phép' : 'Đã nghỉ'} />
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
            
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20}/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Tổng Tour</p>
                            <p className="text-lg font-bold text-slate-800">{stats.total_tours || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={20}/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Đánh giá</p>
                            <p className="text-lg font-bold text-slate-800">{stats.avg_rating ? Math.ceil(Number(stats.avg_rating)) : 0}/5</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & LIÊN HỆ */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <User size={16} className="text-blue-500"/> Thông tin cá nhân
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailRow label="Ngày sinh" value={formatDate(staff.birthday)} icon={Calendar} />
                            <DetailRow label="Giới tính" value={getGenderLabel(staff.gender)} icon={User} />
                            <DetailRow label="CCCD/CMND" value={staff.id_number} icon={CreditCard} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <Phone size={16} className="text-green-500"/> Liên hệ
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailRow label="Điện thoại" value={staff.phone} icon={Phone} className="font-bold text-blue-600"/>
                            <DetailRow label="Email" value={staff.email} icon={Mail} />
                            <DetailRow label="Địa chỉ" value={staff.address} icon={MapPin} />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHUYÊN MÔN & KỸ NĂNG */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-700 flex items-center gap-2">
                            <Award size={16} className="text-purple-500"/> Hồ sơ chuyên môn
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <DetailRow label="Kinh nghiệm" value={`${staff.experience_years || 0} năm`} icon={Star} />
                            <DetailRow label="Tình trạng sức khỏe" value={staff.health_status} icon={HeartPulse} />
                            
                            {/* HIỂN THỊ RIÊNG CHO TÀI XẾ */}
                            {staff.staff_type === 'driver' && (
                                <>
                                    <div className="md:col-span-2 border-t border-slate-100 my-2 pt-2"></div>
                                    <DetailRow label="Hạng bằng lái" value={staff.driver_license_class} icon={CreditCard} />
                                    <DetailRow label="Số bằng lái" value={staff.driver_license_number} icon={FileText} />
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase mb-1 ml-3 mt-2">Loại xe điều khiển</p>
                                        <div className="flex flex-wrap gap-2 ml-3">
                                            {parseArray(staff.vehicle_types).length > 0 ? (
                                                parseArray(staff.vehicle_types).map((v, i) => (
                                                    <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded text-sm flex items-center gap-1">
                                                        <Bus size={12}/> {v}
                                                    </span>
                                                ))
                                            ) : <span className="text-slate-300 text-sm italic">Chưa cập nhật</span>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {['tour_guide', 'tour_leader', 'coordinator'].includes(staff.staff_type) && (
                                <>
                                    <div className="md:col-span-2 border-t border-slate-100 my-2 pt-2"></div>
                                    <div className="md:col-span-2 mb-3">
                                        <p className="text-xs font-medium text-slate-500 uppercase mb-1 ml-3">Ngoại ngữ</p>
                                        <div className="flex flex-wrap gap-2 ml-3">
                                            {parseArray(staff.languages).length > 0 ? (
                                                parseArray(staff.languages).map((l, i) => (
                                                    <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded text-sm font-medium">{l}</span>
                                                ))
                                            ) : <span className="text-slate-300 text-sm italic">Không có</span>}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase mb-1 ml-3">Chứng chỉ / Thẻ hành nghề</p>
                                        <div className="ml-3 text-sm text-slate-700">
                                            {parseArray(staff.certifications).length > 0 
                                                ? parseArray(staff.certifications).join(', ') 
                                                : <span className="text-slate-300 italic">Chưa cập nhật</span>}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2 border-t border-slate-100 my-2 pt-2"></div>
                            <div className="md:col-span-2">
                                 <DetailRow label="Thế mạnh / Chuyên môn" value={parseArray(staff.specializations).join(', ')} icon={Award} />
                            </div>
                        </div>
                    </div>

                    {staff.notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1"><FileText size={14}/> Ghi chú nội bộ</h4>
                            <p className="text-sm text-amber-900 whitespace-pre-line">{staff.notes}</p>
                        </div>
                    )}
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

export default StaffDetailModal;