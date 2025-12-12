import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, RefreshCw, Filter, Calendar, 
  ArrowUpRight, ArrowDownLeft, FileText, User, Phone, 
  MoreVertical, Clock, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import debtService from '../../../services/api/debtService';
import DebtPaymentModal from './DebtPaymentModal';
import Pagination from '../../ui/Pagination';

const DebtList = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    debtType: 'receivable', 
    status: '',             
    dueFromDate: '',
    dueToDate: '',
    page: 1,
    limit: 9 
  });

  const [summary, setSummary] = useState({
    totalOriginal: 0,
    totalRemaining: 0,
    count: 0
  });
  
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getProgressColor = (percent, status) => {
    if (status === 'overdue') return 'bg-red-500';
    if (percent >= 100) return 'bg-emerald-500';
    if (percent > 50) return 'bg-blue-500';
    return 'bg-amber-400';
  };

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        debtType: filters.debtType,
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;
      if (filters.dueFromDate) params.dueFromDate = filters.dueFromDate;
      if (filters.dueToDate) params.dueToDate = filters.dueToDate;

      const res = await debtService.getAll(params);
      const data = res.data || res; 

      if (data.debts) {
        setDebts(data.debts);
        setTotalItems(data.total || 0);
      } else if (Array.isArray(data)) {
         setDebts(data);
         setTotalItems(data.length); 
      } else {
        setDebts([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error("Không thể tải dữ liệu công nợ");
      setDebts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await debtService.getgSummary({ debtType: filters.debtType });
      const data = res.data || res;
      
      if (Array.isArray(data)) {
        const totalOriginal = data.reduce((acc, curr) => acc + (parseFloat(curr.total_original) || 0), 0);
        const totalRemaining = data.reduce((acc, curr) => acc + (parseFloat(curr.total_remaining) || 0), 0);
        const count = data.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
        
        setSummary({ totalOriginal, totalRemaining, count });
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
  }, [filters.debtType]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // --- HANDLERS ---
  const handleTypeChange = (type) => {
    setFilters(prev => ({ ...prev, debtType: type, page: 1, status: '' }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 1. Header & Summary Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Wallet size={24} />
                    </div>
                    Quản Lý Công Nợ
                </h1>
                <p className="text-slate-500 mt-1 pl-12">Theo dõi dòng tiền và thanh toán</p>
            </div>
            <button 
                onClick={fetchDebts} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all text-sm font-medium"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Làm mới
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button 
                onClick={() => handleTypeChange('receivable')}
                className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left group ${
                filters.debtType === 'receivable' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 border-transparent' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowDownLeft size={100} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-3 rounded-xl ${filters.debtType === 'receivable' ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        <ArrowDownLeft size={24} />
                    </div>
                    {filters.debtType === 'receivable' && <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">Đang xem</div>}
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">Tổng Phải Thu</p>
                    <p className={`text-3xl font-bold ${filters.debtType === 'receivable' ? 'text-white' : 'text-slate-700'}`}>
                        {filters.debtType === 'receivable' ? formatCurrency(summary.totalRemaining) : '---'}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                        {filters.debtType === 'receivable' ? `${summary.count} khoản nợ khách hàng` : 'Bấm để xem chi tiết'}
                    </p>
                </div>
            </button>

            <button 
                onClick={() => handleTypeChange('payable')}
                className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left group ${
                filters.debtType === 'payable' 
                ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200 border-transparent' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-orange-300'
                }`}
            >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowUpRight size={100} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-3 rounded-xl ${filters.debtType === 'payable' ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        <ArrowUpRight size={24} />
                    </div>
                    {filters.debtType === 'payable' && <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">Đang xem</div>}
                </div>
                 <div className="relative z-10">
                    <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">Tổng Phải Trả</p>
                    <p className={`text-3xl font-bold ${filters.debtType === 'payable' ? 'text-white' : 'text-slate-700'}`}>
                        {filters.debtType === 'payable' ? formatCurrency(summary.totalRemaining) : '---'}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                        {filters.debtType === 'payable' ? `${summary.count} khoản nợ nhà cung cấp` : 'Bấm để xem chi tiết'}
                    </p>
                </div>
            </button>
        </div>
      </div>


      <div className="max-w-7xl mx-auto bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-2 z-30">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

          <div className="relative group min-w-[220px]">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-all cursor-pointer appearance-none"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ thanh toán</option>
              <option value="partial">🌗 Thanh toán 1 phần</option>
              <option value="overdue">⚠️ Quá hạn</option>
              <option value="paid">✅ Đã hoàn tất</option>
            </select>
          </div>


          <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
             <div className="relative group">
                <input 
                    type="date" 
                    className="pl-3 pr-2 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none focus:bg-white w-36 cursor-pointer"
                    value={filters.dueFromDate}
                    onChange={(e) => setFilters({...filters, dueFromDate: e.target.value, page: 1})}
                    placeholder="Từ ngày"
                />
             </div>
             <span className="text-slate-300 px-1">→</span>
             <div className="relative group">
                <input 
                    type="date" 
                    className="pl-2 pr-3 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none focus:bg-white w-36 cursor-pointer"
                    value={filters.dueToDate}
                    onChange={(e) => setFilters({...filters, dueToDate: e.target.value, page: 1})}
                    placeholder="Đến ngày"
                />
             </div>
          </div>
        </div>
        
        {!loading && totalItems > 0 && (
            <div className="text-sm text-slate-500 hidden xl:block">
                Hiển thị <b>{debts.length}</b> kết quả
            </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
            <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : debts.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <FileText size={48} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-600">Không tìm thấy dữ liệu</p>
            <p className="text-sm">Thử điều chỉnh bộ lọc hoặc chọn loại công nợ khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {debts.map((debt) => {
                const original = parseFloat(debt.original_amount) || 0;
                const paid = parseFloat(debt.paid_amount) || 0;
                const remaining = parseFloat(debt.remaining_amount) || 0;
                const percent = original > 0 ? (paid / original) * 100 : 0;
                const isOverdue = debt.status === 'overdue';
                const isPaid = debt.status === 'paid';
                
                const refCode = debt.booking_code 
                    ? { label: 'Booking', val: debt.booking_code } 
                    : (debt.invoice_number ? { label: 'Hóa đơn', val: debt.invoice_number } : null);

                return (
                    <div 
                        key={debt.id} 
                        className={`group bg-white rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden ${isOverdue ? 'ring-1 ring-red-100' : ''}`}
                    >
                        {/* Status Stripe */}
                        <div className={`h-1 w-full absolute top-0 left-0 ${isOverdue ? 'bg-red-500' : (isPaid ? 'bg-emerald-500' : 'bg-blue-500')}`}></div>
                        
                        {/* Header */}
                        <div className="p-5 pb-0 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                    debt.debtor_type === 'customer' 
                                    ? 'bg-gradient-to-br from-indigo-50 to-blue-100 text-blue-600' 
                                    : 'bg-gradient-to-br from-purple-50 to-fuchsia-100 text-purple-600'
                                }`}>
                                    <User size={20} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-800 text-base truncate" title={debt.debtor_name}>
                                        {debt.debtor_name || 'Không xác định'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                                            {debt.debtor_type === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}
                                        </span>
                                        {debt.debtor_phone && (
                                            <span className="flex items-center gap-1 truncate">
                                                <Phone size={10} /> {debt.debtor_phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Menu dots (Fake) */}
                            <button className="text-slate-300 hover:text-slate-500">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Body Info */}
                        <div className="p-5 space-y-4 flex-1">
                            {/* Reference Badge */}
                            {refCode && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-medium text-slate-600">
                                    <FileText size={12} />
                                    <span className="opacity-70">{refCode.label}:</span>
                                    <span className="font-bold text-slate-800">{refCode.val}</span>
                                </div>
                            )}

                            {/* Financials */}
                            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Tổng nợ gốc</span>
                                    <span className="font-bold text-slate-700">{formatCurrency(original)}</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-emerald-600 font-medium">Đã trả: {formatCurrency(paid)}</span>
                                        <span className="text-slate-400">{Math.round(percent)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(percent, debt.status)}`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1 border-t border-slate-100 border-dashed">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Còn lại</span>
                                    <span className={`text-lg font-bold leading-none ${remaining > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                        {formatCurrency(remaining)}
                                    </span>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 bg-red-50 p-2 rounded-lg' : 'text-slate-500'}`}>
                                {isOverdue ? <AlertCircle size={16} /> : <Calendar size={16} />}
                                <span className={isOverdue ? 'font-bold' : 'font-medium'}>
                                    {isOverdue ? 'Quá hạn: ' : 'Hạn: '} 
                                    {formatDate(debt.due_date)}
                                </span>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between gap-3">
                            {/* Status Badge */}
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide
                                ${debt.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                  debt.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-amber-100 text-amber-700 border-amber-200'}
                            `}>
                                {debt.status === 'paid' ? <CheckCircle2 size={12} /> : 
                                 debt.status === 'overdue' ? <AlertCircle size={12} /> : 
                                 <Clock size={12} />}
                                {debt.status === 'overdue' ? 'Quá hạn' : debt.status === 'paid' ? 'Hoàn tất' : 'Chờ TT'}
                            </div>

                            {/* Action Button */}
                            {remaining > 0 ? (
                                <button 
                                    onClick={() => openPaymentModal(debt)}
                                    className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Wallet size={14} /> Thanh toán
                                </button>
                            ) : (
                                <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 opacity-80">
                                    <CheckCircle2 size={14} /> Đã xong
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        )}

        <div className="mt-8 mb-12">
            <Pagination 
                currentPage={filters.page}
                totalItems={totalItems}
                itemsPerPage={filters.limit}
                onPageChange={handlePageChange}
                siblingCount={1}
            />
        </div>
      </div>

      <DebtPaymentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        debt={selectedDebt} 
        onSuccess={() => {
          fetchDebts();
          fetchSummary();
        }} 
      />
    </div>
  );
};

export default DebtList;