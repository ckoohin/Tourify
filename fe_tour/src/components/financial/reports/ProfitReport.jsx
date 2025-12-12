import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import reportService from '../../../services/api/reportService';
import { Search } from 'lucide-react';

const ProfitReport = () => {
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const res = await reportService.getPeriodProfit(dateRange);
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  if (!data) return <div className="p-10 text-center">Đang tải báo cáo...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Từ ngày</label>
          <input type="date" value={dateRange.start_date} onChange={e => setDateRange({...dateRange, start_date: e.target.value})} className="border rounded px-3 py-2 text-sm"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đến ngày</label>
          <input type="date" value={dateRange.end_date} onChange={e => setDateRange({...dateRange, end_date: e.target.value})} className="border rounded px-3 py-2 text-sm"/>
        </div>
        <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 h-[38px] flex items-center gap-2">
          <Search size={16}/> Xem báo cáo
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase">Tổng Doanh Thu</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(data.summary.total_income)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase">Tổng Chi Phí</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(data.summary.total_expense)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase">Lợi Nhuận Ròng</div>
          <div className={`text-2xl font-bold mt-1 ${data.summary.total_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(data.summary.total_profit)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Biểu đồ Lợi nhuận theo Tour</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.tours} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="departure_code" tick={{fontSize: 12}} />
            <YAxis tickFormatter={(val) => `${val/1000000}M`} tick={{fontSize: 12}}/>
            <Tooltip formatter={(val) => formatCurrency(val)} cursor={{fill: '#f1f5f9'}}/>
            <Legend />
            <Bar name="Doanh thu" dataKey="total_income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar name="Chi phí" dataKey="total_expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitReport;