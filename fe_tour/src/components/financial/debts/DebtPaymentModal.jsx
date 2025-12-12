import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import debtService from '../../../services/api/debtService';
import toast from 'react-hot-toast';

const DebtPaymentModal = ({ isOpen, onClose, debt, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payAmount = parseFloat(amount);
    const remaining = parseFloat(debt?.remaining_amount || 0);

    if (!amount || payAmount <= 0) {
      return toast.error('Số tiền phải lớn hơn 0');
    }
    
    if (payAmount > remaining) {
      return toast.error(`Không thể trả quá số tiền còn lại (${formatCurrency(remaining)})`);
    }
    
    setSubmitting(true);
    try {
      await debtService.pay(debt.id, payAmount);
      toast.success('Thanh toán thành công');
      onSuccess(); 
      onClose();
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !debt) return null;

  const remaining = parseFloat(debt.remaining_amount);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Thanh toán Nợ</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-2">
            <div className="flex justify-between">
                <span className="text-slate-500">Đối tượng:</span>
                <span className="font-bold text-slate-800">{debt.debtor_name}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Còn nợ:</span>
                <span className="font-bold text-red-600 text-base">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Số tiền thanh toán</label>
            <div className="relative">
                <input 
                type="number" 
                required 
                min="1" 
                max={remaining}
                className="w-full border border-slate-300 rounded-lg pl-3 pr-12 py-2.5 font-bold text-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                />
                <span className="absolute right-3 top-3 text-slate-400 text-xs font-bold">VND</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Nhập số tiền bạn thực thu/chi.</p>
          </div>

          <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Hủy
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70">
                  {submitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtPaymentModal;