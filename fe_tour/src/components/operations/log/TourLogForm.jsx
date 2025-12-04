import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Cloud, Camera, AlertTriangle, MessageSquare, FileText, Activity, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import tourLogService from '../../../services/api/tourLogService';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload';

const TourLogForm = ({ isOpen, onClose, onSuccess, initialData, departureId }) => {
  const { uploadMultipleImages, uploading, progress } = useCloudinaryUpload();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tour_departure_id: departureId,
    log_date: new Date().toISOString().split('T')[0],
    log_time: new Date().toTimeString().slice(0, 5),
    log_type: 'activity',
    title: '',
    content: '',
    location: '',
    weather: '',
    images: []
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                ...initialData,
                tour_departure_id: departureId,
                log_date: initialData.log_date ? initialData.log_date.split('T')[0] : '',
                log_time: initialData.log_time ? initialData.log_time.slice(0, 5) : '',
                images: Array.isArray(initialData.images) ? initialData.images : []
            });
        } else {
            setFormData({
                tour_departure_id: departureId,
                log_date: new Date().toISOString().split('T')[0],
                log_time: new Date().toTimeString().slice(0, 5),
                log_type: 'activity',
                title: '',
                content: '',
                location: '',
                weather: '',
                images: []
            });
        }
    }
  }, [isOpen, initialData, departureId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Sử dụng hook để upload nhiều ảnh
      const urls = await uploadMultipleImages(files, 'tour_logs');
      if (urls.length > 0) {
          setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
          toast.success("Đã tải ảnh lên");
      } else {
          toast.error("Lỗi tải ảnh");
      }
  };

  const removeImage = (index) => {
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        if (initialData) {
            await tourLogService.update(initialData.id, formData);
            toast.success("Cập nhật nhật ký thành công");
        } else {
            await tourLogService.create(formData);
            toast.success("Thêm nhật ký thành công");
        }
        onSuccess();
        onClose();
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi lưu nhật ký");
    } finally {
        setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
      switch(type) {
          case 'incident': return <AlertTriangle size={18} className="text-red-500"/>;
          case 'feedback': return <MessageSquare size={18} className="text-purple-500"/>;
          case 'photo': return <Camera size={18} className="text-blue-500"/>;
          case 'note': return <FileText size={18} className="text-gray-500"/>;
          default: return <Activity size={18} className="text-green-500"/>;
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-bold text-lg text-slate-800">
                {initialData ? 'Chỉnh sửa Nhật ký' : 'Viết Nhật ký Tour'}
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-5 gap-2">
                {['activity', 'incident', 'feedback', 'note', 'photo'].map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, log_type: type }))}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                            formData.log_type === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                    >
                        {getTypeIcon(type)}
                        <span className="text-[10px] uppercase font-bold mt-1">{type}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                    <input type="date" name="log_date" value={formData.log_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giờ</label>
                    <input type="time" name="log_time" value={formData.log_time} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề (Tùy chọn)</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="VD: Sự cố xe hỏng..."/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded-lg" required placeholder="Mô tả chi tiết sự việc..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg" placeholder="Địa điểm"/>
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <Cloud size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input type="text" name="weather" value={formData.weather} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg" placeholder="Thời tiết"/>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh đính kèm</label>
                <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border">
                            <img src={url} alt="Log" className="w-full h-full object-cover"/>
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><Trash2 size={12}/></button>
                        </div>
                    ))}
                    <label className={`aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-blue-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? <span className="text-xs font-bold">{progress}%</span> : <Camera size={20}/>}
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading}/>
                    </label>
                </div>
            </div>

        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-slate-100 font-medium text-slate-700">Hủy</button>
            <button onClick={handleSubmit} disabled={submitting || uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-medium">
                {submitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Lưu Nhật Ký
            </button>
        </div>
      </div>
    </div>
  );
};

export default TourLogForm;