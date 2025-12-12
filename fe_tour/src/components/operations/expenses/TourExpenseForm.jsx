import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import tourExpenseService from '../../../services/api/tourExpenseService';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload'; 

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'company_card', label: 'Thẻ công ty' },
    { value: 'credit_card', label: 'Thẻ tín dụng cá nhân' }
];

const TourExpenseForm = ({ isOpen, onClose, onSuccess, initialData, departureId, budgetCategories = [] }) => {
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expense_category: '',
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'VND',
    payment_method: 'cash',
    supplier_id: '',
    description: '',
    receipt_url: '' 
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                ...initialData,
                expense_date: initialData.expense_date ? initialData.expense_date.split('T')[0] : '',
                supplier_id: initialData.supplier_id || '',
                receipt_url: initialData.receipt_url || ''
            });
        } else {
            setFormData({
                expense_category: '',
                expense_date: new Date().toISOString().split('T')[0],
                amount: '',
                currency: 'VND',
                payment_method: 'cash',
                supplier_id: '',
                description: '',
                receipt_url: ''
            });
        }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const result = await uploadImage(file, 'expenses');
      
      if (result.success) {
          setFormData(prev => ({ ...prev, receipt_url: result.url }));
          toast.success("Đã tải ảnh lên thành công");
      } else {
          toast.error(result.error || "Lỗi khi tải ảnh");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        const payload = {
            ...formData,
            tour_departure_id: departureId,
            amount: parseFloat(formData.amount)
        };

        if (initialData) {
            await tourExpenseService.update(initialData.id, payload);
            toast.success("Cập nhật thành công");
        } else {
            await tourExpenseService.create(payload);
            toast.success("Thêm mới thành công");
        }
        onSuccess();
        onClose();
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi lưu chi phí");
    } finally {
        setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-bold text-lg text-slate-800">
                {initialData ? 'Sửa Khoản Chi' : 'Ghi Nhận Chi Phí Mới'}
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày chi <span className="text-red-500">*</span></label>
                    <input type="date" name="expense_date" required value={formData.expense_date} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input type="number" name="amount" required min="0" value={formData.amount} onChange={handleChange} className="w-full border rounded-lg pl-3 pr-12 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0"/>
                        <span className="absolute right-3 top-2 text-slate-500 text-sm font-bold">VND</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạng mục chi phí <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                        type="text" 
                        name="expense_category" 
                        list="categories" 
                        required 
                        value={formData.expense_category} 
                        onChange={handleChange} 
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="VD: Ăn uống, Vé tham quan..."
                    />
                    <datalist id="categories">
                        {budgetCategories.map((cat, idx) => (
                            <option key={idx} value={cat} />
                        ))}
                        <option value="Ăn uống" />
                        <option value="Vé tham quan" />
                        <option value="Khách sạn" />
                        <option value="Vận chuyển" />
                        <option value="Phát sinh khác" />
                    </datalist>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức thanh toán</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung chi tiết</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Chi tiết..."></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hóa đơn / Chứng từ</label>
                <div className="flex items-center gap-4">
                    {formData.receipt_url ? (
                        <div className="relative group w-24 h-24 border rounded-lg overflow-hidden bg-slate-50">
                            <img 
                                src={formData.receipt_url} 
                                alt="Receipt" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/400?text=Error";
                                }}
                            />
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, receipt_url: ''})} 
                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                    ) : (
                        <label className={`w-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin text-blue-500" size={24}/>
                                    <span className="text-xs mt-1 font-medium text-blue-600">Đang tải {progress}%</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={24}/>
                                    <span className="text-xs mt-1">Tải ảnh hóa đơn</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            </div>
        </form>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700">Hủy</button>
            <button onClick={handleSubmit} disabled={submitting || uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm disabled:opacity-50">
                {submitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Lưu Lại
            </button>
        </div>
      </div>
    </div>
  );
};

export default TourExpenseForm;