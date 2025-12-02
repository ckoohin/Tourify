import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, TrendingUp, AlertTriangle, 
  CheckCircle, FileText, PieChart 
} from 'lucide-react';
import toast from 'react-hot-toast';
import tourExpenseService from '../../services/api/tourExpenseService';
import departureService from '../../services/api/departureService'; 

const TourExpensePage = () => {
  const { departureId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [depRes, budgetRes] = await Promise.all([
            departureService.getById(departureId),
            tourExpenseService.compareBudget(departureId)
        ]);

        if (depRes.success) setDeparture(depRes.data);
        if (budgetRes.success) setBudgetData(budgetRes.data);

      } catch (error) {
        console.error(error);
        toast.error("Lỗi tải dữ liệu chi phí");
      } finally {
        setLoading(false);
      }
    };

    if (departureId) loadData();
  }, [departureId]);

  // Helper format tiền
  const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-500">Đang tổng hợp số liệu...</div>;
  if (!departure || !budgetData) return <div className="text-center p-10">Không tìm thấy dữ liệu.</div>;

  const { summary, details } = budgetData;
  
  // Tính toán màu sắc dựa trên lãi/lỗ
  const isOverBudget = summary.total_actual > summary.total_estimated;
  const profitColor = isOverBudget ? 'text-red-600' : 'text-emerald-600';
  const profitBg = isOverBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200';

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* 1. Header & Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-slate-500 hover:text-blue-600 mb-2 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} className="mr-1"/> Quay lại Chi tiết Tour
            </button>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600"/> Quyết Toán Chi Phí Tour
            </h1>
            <div className="text-slate-500 text-sm mt-1">
                Tour: <span className="font-semibold text-slate-700">{departure.tour_name}</span> 
                <span className="mx-2">•</span> 
                Mã: <span className="font-mono bg-slate-200 px-1 rounded text-slate-800">{departure.departure_code}</span>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2">
                <PieChart size={18}/> Xuất Báo Cáo
            </button>
        </div>
      </div>

      {/* 2. Dashboard Cards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Thẻ Dự Toán */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileText size={24}/></div>
                <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">Ngân sách</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{formatMoney(summary.total_estimated)}</div>
            <p className="text-sm text-slate-500">Tổng chi phí dự kiến ban đầu</p>
        </div>

        {/* Thẻ Thực Chi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><DollarSign size={24}/></div>
                <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">Thực tế</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{formatMoney(summary.total_actual)}</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min((summary.total_actual/summary.total_estimated)*100, 100)}%` }}
                ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Đã giải ngân {summary.total_percent_difference}% so với dự toán</p>
        </div>

        {/* Thẻ Chênh Lệch */}
        <div className={`p-6 rounded-2xl border shadow-sm ${profitBg}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isOverBudget ? <AlertTriangle size={24}/> : <TrendingUp size={24}/>}
                </div>
                <span className="text-xs font-bold uppercase text-slate-500 bg-white/50 px-2 py-1 rounded">Hiệu quả</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${profitColor}`}>
                {summary.total_difference > 0 ? '+' : ''}{formatMoney(summary.total_difference)}
            </div>
            <p className={`text-sm font-medium ${profitColor}`}>
                {isOverBudget ? 'Vượt ngân sách cho phép' : 'Tiết kiệm chi phí vận hành'}
            </p>
        </div>
      </div>

      {/* 3. Bảng Chi Tiết So Sánh */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800">Chi tiết từng hạng mục</h3>
        </div>
        
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                    <th className="px-6 py-4">Hạng mục chi phí</th>
                    <th className="px-6 py-4 text-right">Dự toán (Budget)</th>
                    <th className="px-6 py-4 text-right">Thực tế (Actual)</th>
                    <th className="px-6 py-4 w-1/4">Tiến độ giải ngân</th>
                    <th className="px-6 py-4 text-right">Chênh lệch</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {details.map((item, idx) => {
                    const percent = Math.min((item.actual_amount / item.estimated_amount) * 100, 100) || 0;
                    const isOver = item.status === 'over';
                    const rowColor = isOver ? 'text-red-600' : 'text-emerald-600';

                    return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800">{item.category}</td>
                            <td className="px-6 py-4 text-right text-slate-500">{formatMoney(item.estimated_amount)}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-700">{formatMoney(item.actual_amount)}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 w-10 text-right">{Math.round(percent)}%</span>
                                </div>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold ${rowColor}`}>
                                {item.difference > 0 ? '+' : ''}{formatMoney(item.difference)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {isOver ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                        <AlertTriangle size={12}/> Vượt
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        <CheckCircle size={12}/> Ổn
                                    </span>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            {/* Footer Tổng kết */}
            <tfoot className="bg-slate-50 font-bold text-slate-800">
                <tr>
                    <td className="px-6 py-4 uppercase text-xs text-slate-500">Tổng cộng</td>
                    <td className="px-6 py-4 text-right">{formatMoney(summary.total_estimated)}</td>
                    <td className="px-6 py-4 text-right">{formatMoney(summary.total_actual)}</td>
                    <td className="px-6 py-4"></td>
                    <td className={`px-6 py-4 text-right ${profitColor}`}>
                        {summary.total_difference > 0 ? '+' : ''}{formatMoney(summary.total_difference)}
                    </td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TourExpensePage;