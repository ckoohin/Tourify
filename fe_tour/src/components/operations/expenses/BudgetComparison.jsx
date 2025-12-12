import React from 'react';
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
};

const BudgetComparison = ({ data, loading }) => {
  if (loading) return <div className="h-40 bg-slate-100 animate-pulse rounded-xl"></div>;
  if (!data || !data.summary) return <div className="text-slate-500 text-center py-8">Chưa có dữ liệu dự toán.</div>;

  const { summary, details } = data;
  const isOverBudget = summary.total_difference > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tổng Dự Toán (Estimated)</p>
            <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(summary.total_estimated)}
            </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tổng Thực Chi (Actual)</p>
            <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.total_actual)}
            </div>
        </div>

        <div className={`border p-4 rounded-xl shadow-sm ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <p className={`text-xs font-semibold uppercase mb-1 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                {isOverBudget ? 'Vượt Ngân Sách' : 'Dư Ngân Sách'}
            </p>
            <div className={`text-2xl font-bold flex items-center gap-2 ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                {isOverBudget ? <TrendingDown size={24}/> : <DollarSign size={24}/>}
                {formatCurrency(Math.abs(summary.total_difference))}
                <span className="text-sm font-medium opacity-80">({Math.abs(summary.total_percent_difference)}%)</span>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50 font-semibold text-sm text-slate-700">
              Chi tiết theo hạng mục
          </div>
          <div className="divide-y divide-slate-100">
              {details.map((item, index) => {
                  const percent = item.estimated_amount > 0 
                    ? (item.actual_amount / item.estimated_amount) * 100 
                    : (item.actual_amount > 0 ? 100 : 0);
                  
                  const isOver = item.difference > 0;
                  const barColor = isOver ? 'bg-red-500' : 'bg-emerald-500';
                  
                  return (
                      <div key={index} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-end mb-2">
                              <div>
                                  <div className="font-medium text-slate-800">{item.category}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                      Dự toán: {formatCurrency(item.estimated_amount, item.currency)}
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={`font-bold ${isOver ? 'text-red-600' : 'text-slate-700'}`}>
                                      {formatCurrency(item.actual_amount, item.currency)}
                                  </div>
                                  <div className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                                      {isOver ? '+' : ''}{formatCurrency(item.difference, item.currency)} ({item.percent_difference}%)
                                  </div>
                              </div>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                  className={`h-2 rounded-full ${barColor}`} 
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                              ></div>
                          </div>
                      </div>
                  );
              })}
              {details.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">Chưa có hạng mục ngân sách nào.</div>}
          </div>
      </div>
    </div>
  );
};

export default BudgetComparison;