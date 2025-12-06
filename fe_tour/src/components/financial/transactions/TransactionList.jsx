import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';
import transactionService from '../../../services/api/transactionService';
import TransactionModal from './TransactionModal';
import toast from 'react-hot-toast';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ type: '', start_date: '', end_date: '' });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      console.log("Đang gọi API transaction...");
      const res = await transactionService.getAll({ ...filter, limit: 50 });
      
      // LOG DỮ LIỆU ĐỂ KIỂM TRA
      console.log("Dữ liệu Transaction trả về:", res);

      if (res.success) {
        // [FIX] Xử lý linh hoạt các trường hợp cấu trúc dữ liệu
        let dataList = [];
        
        if (Array.isArray(res.data)) {
            // Trường hợp 1: Trả về mảng trực tiếp
            dataList = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
            // Trường hợp 2: Có phân trang (res.data.data)
            dataList = res.data.data;
        } else if (res.data?.transactions && Array.isArray(res.data.transactions)) {
             // Trường hợp 3: Tên biến là transactions
            dataList = res.data.transactions;
        }

        console.log("Dữ liệu sau khi xử lý:", dataList);
        setTransactions(dataList);
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
      toast.error('Lỗi tải giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      await transactionService.approve(id);
      toast.success('Đã duyệt giao dịch');
      fetchTransactions();
    } catch (e) { toast.error('Lỗi duyệt'); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <select 
            className="border rounded-lg px-3 py-2 text-sm"
            onChange={e => setFilter({...filter, type: e.target.value})}
          >
            <option value="">Tất cả loại</option>
            <option value="income">Thu (Income)</option>
            <option value="expense">Chi (Expense)</option>
          </select>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" onChange={e => setFilter({...filter, start_date: e.target.value})}/>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
          <Plus size={16}/> Tạo Giao dịch
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
            <tr>
              <th className="p-3">Mã GD</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Loại/Hạng mục</th>
              <th className="p-3">Nội dung</th>
              <th className="p-3 text-right">Số tiền</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                        Không có dữ liệu hiển thị (Kiểm tra Console F12)
                    </td>
                </tr>
            ) : (
                transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs text-blue-600 font-medium">{tx.code || `#${tx.id}`}</td>
                    <td className="p-3">{new Date(tx.transaction_date).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3">
                    <div className="flex items-center gap-2">
                        {tx.type === 'income' 
                        ? <ArrowDownCircle size={16} className="text-green-600"/> 
                        : <ArrowUpCircle size={16} className="text-red-600"/>}
                        <span className="font-medium capitalize">{tx.type === 'income' ? 'Thu' : 'Chi'}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{tx.category}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate" title={tx.description}>{tx.description}</td>
                    <td className={`p-3 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-3 text-center">
                    {tx.approved_by 
                        ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-100 flex items-center justify-center gap-1"><CheckCircle size={12}/> Đã duyệt</span>
                        : <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs border border-amber-100 flex items-center justify-center gap-1"><Clock size={12}/> Chờ duyệt</span>
                    }
                    </td>
                    <td className="p-3 text-right">
                    {!tx.approved_by && (
                        <button onClick={() => handleApprove(tx.id)} className="text-blue-600 hover:underline text-xs font-medium">Duyệt</button>
                    )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchTransactions} />
    </div>
  );
};

export default TransactionList;