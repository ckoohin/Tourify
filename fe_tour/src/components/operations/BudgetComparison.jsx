import React, { useEffect, useState } from 'react';
import { PieChart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import tourExpenseService from '../../services/api/tourExpenseService'; // Giả sử bạn sẽ tạo service này

const BudgetComparison = ({ departureId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await tourExpenseService.compareBudget(departureId);
        if (res.success) setData(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu so sánh", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [departureId]);

  if (loading) return <div>Đang tính toán số liệu...</div>;
  if (!data) return <div>Chưa có dữ liệu dự toán hoặc chi phí.</div>;

  const { summary, details } = data;
  const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Tổng Dự toán</div>
            <div className="text-2xl font-bold text-blue-600">{formatMoney(summary.total_estimated)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Tổng Chi thực tế</div>
            <div className={`text-2xl font-bold ${summary.total_actual > summary.total_estimated ? 'text-red-600' : 'text-green-600'}`}>
                {formatMoney(summary.total_actual)}
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Chênh lệch</div>
            <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${summary.total_difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {summary.total_difference > 0 ? '+' : ''}{formatMoney(summary.total_difference)}
                </span>
                {summary.total_difference > 0 && <AlertTriangle size={20} className="text-red-500"/>}
            </div>
        </div>
      </div>

      {/* 2. Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                    <th className="p-4">Hạng mục</th>
                    <th className="p-4 text-right">Dự toán</th>
                    <th className="p-4 text-right">Thực tế</th>
                    <th className="p-4 w-1/3">Tiến độ chi</th>
                    <th className="p-4 text-right">Chênh lệch</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {details.map((item, idx) => {
                    const percent = Math.min((item.actual_amount / item.estimated_amount) * 100, 100) || 0;
                    const isOver = item.status === 'over';

                    return (
                        <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-4 font-medium">{item.category}</td>
                            <td className="p-4 text-right text-slate-600">{formatMoney(item.estimated_amount)}</td>
                            <td className="p-4 text-right font-bold text-slate-800">{formatMoney(item.actual_amount)}</td>
                            <td className="p-4">
                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                                    <div 
                                        className={`h-2.5 rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-500">{item.percent_difference}% so với dự toán</span>
                            </td>
                            <td className={`p-4 text-right font-bold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                                {item.difference > 0 ? '+' : ''}{formatMoney(item.difference)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetComparison;