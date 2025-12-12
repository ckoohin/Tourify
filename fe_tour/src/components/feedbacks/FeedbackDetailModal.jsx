import React, { useState } from 'react';
import { 
  X, Clock, CheckCircle2, User, Building, MapPin, 
  AlertTriangle, MoreVertical, Send, Briefcase 
} from 'lucide-react';
import feedbackService from '../../services/api/feedbackService';
import toast from 'react-hot-toast';

const STATUS_OPTS = [
  { value: 'open', label: 'Chờ xử lý', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  { value: 'in_progress', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: Clock },
  { value: 'resolved', label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  { value: 'closed', label: 'Đóng', color: 'bg-slate-100 text-slate-600', icon: X }
];

const FeedbackDetailModal = ({ isOpen, onClose, feedback, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
        await feedbackService.updateStatus(feedback.id, newStatus);
        toast.success("Cập nhật trạng thái thành công");
        onUpdate(); 
        onClose();
    } catch (error) {
        toast.error("Lỗi cập nhật trạng thái");
    } finally {
        setUpdating(false);
    }
  };

  if (!isOpen || !feedback) return null;

  const statusConfig = STATUS_OPTS.find(s => s.value === feedback.status) || STATUS_OPTS[0];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Slide-in Panel */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-start bg-slate-50">
            <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mb-2 ${statusConfig.color}`}>
                    <StatusIcon size={12} /> {statusConfig.label}
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{feedback.subject}</h2>
                <p className="text-xs text-slate-500 mt-1">ID: #{feedback.id} • {new Date(feedback.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Nội dung phản hồi</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {feedback.content}
                </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Mức độ ưu tiên</span>
                    <span className={`text-sm font-bold uppercase ${feedback.priority === 'high' ? 'text-red-600' : feedback.priority === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>
                        {feedback.priority === 'high' ? 'Cao' : feedback.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Loại phản hồi</span>
                    <span className="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        {feedback.feedback_type === 'tour' && <MapPin size={14}/>}
                        {feedback.feedback_type === 'supplier' && <Building size={14}/>}
                        {feedback.feedback_type === 'staff' && <User size={14}/>}
                        {feedback.feedback_type}
                    </span>
                </div>
            </div>

            {(feedback.tour_code || feedback.supplier_name || feedback.staff_name) && (
                <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Thông tin liên quan</h4>
                    <div className="space-y-3">
                        {feedback.tour_code && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={16}/></div>
                                <div>
                                    <p className="text-slate-500 text-xs">Tour</p>
                                    <p className="font-bold text-slate-800">{feedback.tour_name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{feedback.tour_code}</p>
                                </div>
                            </div>
                        )}
                        {feedback.supplier_name && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Building size={16}/></div>
                                <div>
                                    <p className="text-slate-500 text-xs">Nhà cung cấp</p>
                                    <p className="font-bold text-slate-800">{feedback.supplier_name}</p>
                                </div>
                            </div>
                        )}
                        {feedback.staff_name && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={16}/></div>
                                <div>
                                    <p className="text-slate-500 text-xs">Nhân viên liên quan</p>
                                    <p className="font-bold text-slate-800">{feedback.staff_name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* People Involved */}
            <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Người tham gia</h4>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {feedback.submitted_by_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{feedback.submitted_by_name}</p>
                        <p className="text-xs text-slate-400">Người gửi • {feedback.submitted_by_email}</p>
                    </div>
                </div>
                {feedback.resolved_by_name && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                            <CheckCircle2 size={14}/>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{feedback.resolved_by_name}</p>
                            <p className="text-xs text-slate-400">Người giải quyết • {new Date(feedback.resolved_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                )}
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cập nhật trạng thái</label>
            <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        disabled={updating || feedback.status === opt.value}
                        className={`
                            px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all
                            ${feedback.status === opt.value 
                                ? 'bg-slate-800 text-white border-slate-800 opacity-50 cursor-default' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'}
                        `}
                    >
                        <opt.icon size={14} /> {opt.label}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default FeedbackDetailModal;