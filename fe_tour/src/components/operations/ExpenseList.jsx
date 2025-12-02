import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileBarChart, Receipt, User } from 'lucide-react';
import api from '../../services/api/axios';

const ExpenseList = ({ departureId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get(`/departures/${departureId}/expenses`);
        if (res.success) {
          setExpenses(res.data || []);
        }
      } catch (error) {
        console.error("Lỗi tải chi phí:", error);
      } finally {
        setLoading(false);
      }
    };
    if (departureId) fetchExpenses();
  }, [departureId]);

  const formatMoney = (amount, currency) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount);

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  if (loading) return <div className="p-6 text-center text-slate-500">Đang tải dữ liệu chi phí...</div>;

  // Tính tổng chi nhanh
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="p-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                <Receipt className="text-orange-500"/> Chi phí vận hành
            </h3>
            <p className="text-sm text-slate-500">Tổng thực chi: <span className="font-bold text-orange-600 text-base">{formatMoney(totalExpense)}</span></p>
        </div>
        <div className="flex gap-3">
            <Link 
                to={`/departures/${departureId}/expenses-report`} 
                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
            >
                <FileBarChart size={16}/> So sánh Dự toán
            </Link>
            <button className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2">
                <Plus size={16}/> Ghi nhận Chi phí
            </button>
        </div>
      </div>

      {expenses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              Chưa có khoản chi nào được ghi nhận.
          </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-orange-50 text-orange-800 font-semibold border-b border-orange-100">
                    <tr>
                        <th className="px-4 py-3">Danh mục</th>
                        <th className="px-4 py-3">Ngày chi</th>
                        <th className="px-4 py-3">Diễn giải</th>
                        <th className="px-4 py-3">Người chi</th>
                        <th className="px-4 py-3 text-right">Số tiền</th>
                        <th className="px-4 py-3 text-center">Thanh toán</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {expenses.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700">{item.expense_category}</td>
                            <td className="px-4 py-3 text-slate-600">{formatDate(item.expense_date)}</td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={item.description}>
                                {item.description || '--'}
                                {item.supplier_name && <div className="text-xs text-blue-500">NCC: {item.supplier_name}</div>}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                                <div className="flex items-center gap-1 text-xs">
                                    <User size={12}/> {item.reported_by_name}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-orange-600">
                                {formatMoney(item.amount, item.currency)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 capitalize border border-slate-200">
                                    {item.payment_method}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;