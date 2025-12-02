import React, { useState, useEffect, useCallback } from 'react';
import { X, Calculator, User, Calendar, DollarSign, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce'; 

import quoteService from '../../services/api/quoteService';
import tourService from '../../services/api/tourService';
import customerService from '../../services/api/customerService'; 

const QuickQuoteModal = ({ isOpen, onClose, onSuccess, currentUserId }) => {
  const [customers, setCustomers] = useState([]);
  const [tours, setTours] = useState([]);
  const [versions, setVersions] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    tour_id: '', 
    tour_version_id: '',
    departure_date: new Date().toISOString().split('T')[0],
    adult_count: 1,
    child_count: 0,
    infant_count: 0,
    senior_count: 0,
    discount_amount: 0,
    valid_days: 7,
    terms: 'Báo giá có hiệu lực trong 7 ngày. Giá chưa bao gồm VAT.',
    created_by: currentUserId
  });

  // --- CALCULATION STATES ---
  const [pricePreview, setPricePreview] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load Initial Data
  useEffect(() => {
    if (isOpen) {
        const initData = async () => {
            try {
                const [custRes, tourRes] = await Promise.all([
                    customerService.getAll(), 
                    tourService.getTours()
                ]);
                if (custRes.success) setCustomers(custRes.data.customers || []);
                if (tourRes.success) setTours(tourRes.data.tours || []);
            } catch (e) { console.error(e); }
        };
        initData();
    }
  }, [isOpen]);

  // 2. Load Versions khi chọn Tour
  useEffect(() => {
    if (formData.tour_id) {
        const loadVersions = async () => {
            try {
                const res = await tourService.getVersions(formData.tour_id);
                if (res.success) setVersions(res.data.tourVersions || []);
            } catch (e) { console.error(e); }
        };
        loadVersions();
    } else {
        setVersions([]);
    }
  }, [formData.tour_id]);

  // 3. Hàm tính giá (Debounce để tránh spam API)
  const calculatePrice = useCallback(debounce(async (data) => {
    if (!data.tour_version_id || !data.departure_date) return;
    
    setIsCalculating(true);
    try {
        const payload = {
            tour_version_id: Number(data.tour_version_id),
            departure_date: data.departure_date,
            adult_count: Number(data.adult_count),
            child_count: Number(data.child_count),
            infant_count: Number(data.infant_count),
            senior_count: Number(data.senior_count)
        };

        const res = await quoteService.calculatePrice(payload);
        if (res.success) {
            setPricePreview(res.data);
        }
    } catch (error) {
        setPricePreview(null);
        // Không toast lỗi ở đây để tránh khó chịu khi đang nhập
        console.warn("Chưa tính được giá (có thể do chưa cấu hình price)"); 
    } finally {
        setIsCalculating(false);
    }
  }, 500), []);

  // Trigger tính giá khi input thay đổi
  useEffect(() => {
    calculatePrice(formData);
  }, [
      formData.tour_version_id, 
      formData.departure_date, 
      formData.adult_count, 
      formData.child_count, 
      formData.infant_count, 
      formData.senior_count
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pricePreview) {
        toast.error("Không thể tạo báo giá vì chưa tính được chi phí. Vui lòng kiểm tra cấu hình giá của Tour.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const payload = {
            ...formData,
            customer_id: Number(formData.customer_id),
            tour_version_id: Number(formData.tour_version_id),
            adult_count: Number(formData.adult_count),
            child_count: Number(formData.child_count),
            infant_count: Number(formData.infant_count),
            senior_count: Number(formData.senior_count),
            discount_amount: Number(formData.discount_amount),
            valid_days: Number(formData.valid_days)
        };

        const res = await quoteService.create(payload);
        if (res.success) {
            toast.success("Tạo báo giá thành công!");
            onSuccess(res.data.quote);
            onClose();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi tạo báo giá");
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b bg-indigo-50 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-xl text-indigo-800 flex items-center gap-2">
                <Calculator size={24}/> Tạo Báo Giá Nhanh
            </h3>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
            <form id="quoteForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: INPUT DATA */}
                <div className="space-y-5">
                    <h4 className="font-bold text-slate-700 border-b pb-2">1. Thông tin chung</h4>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Khách hàng</label>
                        <select name="customer_id" value={formData.customer_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                            <option value="">-- Chọn khách hàng --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Tour</label>
                            <select name="tour_id" value={formData.tour_id} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                                <option value="">-- Chọn Tour --</option>
                                {tours.map(t => (<option key={t.id} value={t.id}>{t.code} - {t.name}</option>))}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Phiên bản</label>
                             <select name="tour_version_id" value={formData.tour_version_id} onChange={handleChange} required disabled={!formData.tour_id} className="w-full px-3 py-2 border rounded-lg disabled:bg-slate-100">
                                <option value="">-- Chọn Version --</option>
                                {versions.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến đi</label>
                        <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
                    </div>

                    <h4 className="font-bold text-slate-700 border-b pb-2 mt-6">2. Số lượng khách</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Người lớn</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                                <input type="number" name="adult_count" min="1" value={formData.adult_count} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded-lg"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Trẻ em</label>
                            <input type="number" name="child_count" min="0" value={formData.child_count} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Em bé</label>
                            <input type="number" name="infant_count" min="0" value={formData.infant_count} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Cao tuổi</label>
                            <input type="number" name="senior_count" min="0" value={formData.senior_count} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PREVIEW & SETTINGS */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                    <h4 className="font-bold text-slate-700 border-b pb-2 mb-4 flex justify-between">
                        <span>Chi tiết báo giá</span>
                        {isCalculating && <span className="text-xs text-indigo-600 font-normal animate-pulse">Đang tính toán...</span>}
                    </h4>

                    {/* Bảng phân tích giá */}
                    <div className="flex-1 overflow-y-auto mb-4">
                        {!pricePreview ? (
                            <div className="text-center text-slate-400 py-10 italic text-sm">
                                Chọn tour và nhập số lượng để xem giá dự kiến.
                            </div>
                        ) : (
                            <div className="space-y-3 text-sm">
                                {pricePreview.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0">
                                        <div>
                                            <span className="font-medium text-slate-700">{item.label}</span>
                                            <span className="text-xs text-slate-500 ml-2">x {item.quantity}</span>
                                        </div>
                                        <div className="text-slate-700">
                                            {formatCurrency(item.amount)}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="flex justify-between items-center pt-2 text-slate-500">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(pricePreview.subtotal)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Giảm giá & Tổng */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700">Giảm giá trực tiếp</label>
                            <div className="relative w-40">
                                <input 
                                    type="number" name="discount_amount" value={formData.discount_amount} onChange={handleChange} 
                                    className="w-full px-2 py-1 text-right border rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-300">
                            <span className="font-bold text-slate-800 text-lg">Thành tiền:</span>
                            <span className="font-bold text-indigo-600 text-xl">
                                {pricePreview 
                                    ? formatCurrency(pricePreview.subtotal - Number(formData.discount_amount)) 
                                    : '---'}
                            </span>
                        </div>
                    </div>

                    {/* Điều khoản */}
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Điều khoản & Ghi chú</label>
                        <textarea name="terms" value={formData.terms} onChange={handleChange} rows={2} className="w-full px-3 py-2 text-xs border rounded-lg bg-white"></textarea>
                    </div>
                </div>
            </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium">Hủy bỏ</button>
            <button 
                type="submit" 
                form="quoteForm" 
                disabled={isSubmitting || !pricePreview}
                className={`px-6 py-2 text-white rounded-lg font-medium shadow-md flex items-center gap-2 ${
                    isSubmitting || !pricePreview 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                <FileText size={18}/> {isSubmitting ? 'Đang tạo...' : 'Tạo Báo Giá'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default QuickQuoteModal;