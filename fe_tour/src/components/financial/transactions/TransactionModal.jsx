import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import transactionService from '../../../services/api/transactionService';
import toast from 'react-hot-toast';

const TransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'income', // income | expense
    category: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    description: '',
    // booking_id, tour_departure_id, supplier_id (cần thêm logic select nếu muốn liên kết)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionService.create(formData);
      toast.success('Tạo giao dịch thành công');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Lỗi tạo giao dịch');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg">Tạo Giao Dịch Mới</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" className="peer hidden" checked={formData.type === 'income'} onChange={() => setFormData({...formData, type: 'income'})}/>
              <div className="py-2 text-center border rounded-lg peer-checked:bg-green-100 peer-checked:text-green-700 peer-checked:border-green-200 transition-all font-medium">
                Phiếu Thu
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" className="peer hidden" checked={formData.type === 'expense'} onChange={() => setFormData({...formData, type: 'expense'})}/>
              <div className="py-2 text-center border rounded-lg peer-checked:bg-red-100 peer-checked:text-red-700 peer-checked:border-red-200 transition-all font-medium">
                Phiếu Chi
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hạng mục</label>
            <input type="text" required className="w-full border rounded-lg px-3 py-2" placeholder="VD: Tiền cọc khách A..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Số tiền</label>
              <input type="number" required min="0" className="w-full border rounded-lg px-3 py-2 font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày GD</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phương thức TT</label>
            <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="credit_card">Thẻ tín dụng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea className="w-full border rounded-lg px-3 py-2 h-20 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Save size={16}/> Lưu Giao Dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;