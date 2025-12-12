import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import feedbackService from '../../services/api/feedbackService'; 

const FeedbackFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    feedback_type: 'tour', 
    priority: 'medium',    
    status: 'open',        
    tour_departure_id: '',
    supplier_id: '',
    staff_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject || '',
        content: initialData.content || '',
        feedback_type: initialData.feedback_type || 'tour',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'open',
        tour_departure_id: initialData.tour_departure_id || '',
        supplier_id: initialData.supplier_id || '',
        staff_id: initialData.staff_id || ''
      });
    } else {
        setFormData({
            subject: '', content: '', feedback_type: 'tour', priority: 'medium', status: 'open',
            tour_departure_id: '', supplier_id: '', staff_id: ''
        });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.content) {
        toast.error("Vui lòng nhập tiêu đề và nội dung");
        return;
    }

    setIsSubmitting(true);
    try {
        const payload = {
            ...formData,
            tour_departure_id: formData.tour_departure_id ? parseInt(formData.tour_departure_id) : null,
            supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
            staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
        };

        if (isEditMode) {
            await feedbackService.update(initialData.id, {
                subject: payload.subject,
                content: payload.content,
                priority: payload.priority,
                status: payload.status 
            });
            toast.success("Cập nhật phản hồi thành công");
        } else {
            await feedbackService.create(payload);
            toast.success("Gửi phản hồi thành công");
        }
        onSuccess();
        onClose();
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {isEditMode ? <MessageSquare size={20} className="text-blue-600"/> : <Plus size={20} className="text-green-600"/>}
                {isEditMode ? 'Cập nhật phản hồi' : 'Gửi phản hồi mới'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Warning Edit Mode */}
            {isEditMode && (
                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                    <span>Bạn chỉ có thể chỉnh sửa nội dung và trạng thái. Loại phản hồi và liên kết không thể thay đổi sau khi tạo.</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tóm tắt vấn đề..."
                    maxLength={255}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Loại phản hồi</label>
                    <select 
                        name="feedback_type" 
                        value={formData.feedback_type} 
                        onChange={handleChange}
                        disabled={isEditMode} 
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                    >
                        <option value="tour">Tour</option>
                        <option value="service">Dịch vụ</option>
                        <option value="supplier">Nhà cung cấp</option>
                        <option value="staff">Nhân sự</option>
                        <option value="system">Hệ thống</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                    <select 
                        name="priority" 
                        value={formData.priority} 
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold ${
                            formData.priority === 'high' ? 'text-red-600' : formData.priority === 'medium' ? 'text-orange-600' : 'text-green-600'
                        }`}
                    >
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                </div>
            </div>

            {isEditMode && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái xử lý</label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="open">Chờ xử lý</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="closed">Đóng</option>
                    </select>
                </div>
            )}

            {formData.feedback_type === 'tour' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID Tour Departure (Nếu có)</label>
                    <input 
                        type="number" 
                        name="tour_departure_id" 
                        value={formData.tour_departure_id} 
                        onChange={handleChange} 
                        disabled={isEditMode}
                        placeholder="Nhập ID lịch khởi hành..."
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${isEditMode ? 'bg-slate-100 text-slate-500' : ''}`}
                    />
                </div>
            )}
             {formData.feedback_type === 'supplier' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID Nhà cung cấp (Nếu có)</label>
                    <input 
                        type="number" 
                        name="supplier_id" 
                        value={formData.supplier_id} 
                        onChange={handleChange} 
                        disabled={isEditMode}
                        placeholder="Nhập ID nhà cung cấp..."
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${isEditMode ? 'bg-slate-100 text-slate-500' : ''}`}
                    />
                </div>
            )}
            {formData.feedback_type === 'staff' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID Nhân viên (Nếu có)</label>
                    <input 
                        type="number" 
                        name="staff_id" 
                        value={formData.staff_id} 
                        onChange={handleChange} 
                        disabled={isEditMode}
                        placeholder="Nhập ID nhân viên..."
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${isEditMode ? 'bg-slate-100 text-slate-500' : ''}`}
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange}
                    rows={5}
                    maxLength={5000}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Mô tả chi tiết vấn đề, sự cố hoặc góp ý..."
                ></textarea>
                <div className="text-xs text-slate-400 text-right mt-1">
                    {formData.content.length}/5000 ký tự
                </div>
            </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">Hủy</button>
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
                {isSubmitting ? 'Đang gửi...' : <><Save size={18}/> {isEditMode ? 'Cập nhật' : 'Gửi phản hồi'}</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormModal;