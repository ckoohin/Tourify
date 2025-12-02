import React, { useState, useEffect } from 'react';
import { X, UploadCloud, ArrowRight, Save, Loader2 } from 'lucide-react';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload';
import toast from 'react-hot-toast';

const StatusUpdateModal = ({ isOpen, onClose, onConfirm, booking, newStatus }) => {
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  
  const { uploadImage, uploading } = useCloudinaryUpload();

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
        setNotes('');
        setImage(null);
        setPreview('');
    }
  }, [isOpen, booking]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImage(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
      let uploadedUrl = '';

      // 1. Upload ảnh nếu có
      if (image) {
          const res = await uploadImage(image, 'booking-history');
          if (res.success) {
              uploadedUrl = res.url;
          } else {
              toast.error('Lỗi upload ảnh');
              return;
          }
      }

      // 2. Gọi callback xác nhận
      onConfirm({
          notes,
          image_url: uploadedUrl
      });
  };

  if (!isOpen || !booking) return null;

  const statusLabels = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      deposited: 'Đã cọc',
      paid: 'Thanh toán',
      completed: 'Hoàn thành',
      cancelled: 'Hủy'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Cập nhật Trạng thái</h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <div className="p-6 space-y-5">
            {/* Status Change Info */}
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase">Hiện tại</div>
                    <div className="font-bold text-slate-700">{statusLabels[booking.status] || booking.status}</div>
                </div>
                <ArrowRight className="text-blue-500" />
                <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase">Mới</div>
                    <div className="font-bold text-blue-700">{statusLabels[newStatus] || newStatus}</div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú / Lý do</label>
                <textarea 
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Nhập ghi chú cho lần thay đổi này..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hình ảnh minh chứng (Optional)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition relative">
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="h-32 mx-auto rounded object-cover"/>
                            <button onClick={() => {setImage(null); setPreview('')}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                        </div>
                    ) : (
                        <>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                            <UploadCloud className="mx-auto text-slate-400 mb-2"/>
                            <span className="text-xs text-slate-500">Click để tải ảnh bill/xác nhận</span>
                        </>
                    )}
                </div>
            </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 text-slate-700 text-sm font-medium">Hủy</button>
            <button 
                onClick={handleSubmit} 
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium disabled:opacity-70"
            >
                {uploading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                Xác nhận
            </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;