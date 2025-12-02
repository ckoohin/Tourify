import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import quoteService from '../../services/api/quoteService';
import QuoteTable from '../../components/quotes/QuoteTable';
import QuickQuoteModal from '../../components/quotes/QuickQuoteModal'; 
import QuoteDetailModal from '../../components/quotes/QuoteDetailModal'; 
import { useAuth } from '../../context/AuthContext'; 

const QuoteList = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await quoteService.getAll(filters);
      if (res.success) {
        setQuotes(res.data.quotes || []);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách báo giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [filters]);

  const handleUpdateStatus = async (id, status) => {
      try {
          await quoteService.updateStatus(id, status);
          toast.success("Cập nhật trạng thái thành công");
          fetchQuotes();
      } catch (error) {
          toast.error("Lỗi cập nhật");
      }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Báo Giá</h1>
            <p className="text-sm text-slate-500">Tạo và quản lý các báo giá gửi cho khách hàng</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
        >
            <Plus size={20}/> Tạo Báo Giá Nhanh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4">
        <div className="relative w-48">
             <Filter className="absolute left-3 top-2.5 text-slate-400" size={16}/>
             <select 
                className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-indigo-500 appearance-none bg-white"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
             >
                 <option value="">Tất cả trạng thái</option>
                 <option value="draft">Bản nháp</option>
                 <option value="sent">Đã gửi</option>
                 <option value="accepted">Đã chốt</option>
             </select>
        </div>
        <button onClick={fetchQuotes} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw size={20}/></button>
      </div>

      {/* Table */}
      {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải dữ liệu...</div>
      ) : (
          <QuoteTable 
            quotes={quotes} 
            onView={(q) => setDetailQuote(q)} // Mở modal chi tiết
            onUpdateStatus={handleUpdateStatus}
          />
      )}

      {/* Modals */}
      <QuickQuoteModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { fetchQuotes(); }} // Reload sau khi tạo xong
        currentUserId={user?.id}
      />

      <QuoteDetailModal 
        isOpen={!!detailQuote}
        onClose={() => setDetailQuote(null)}
        quote={detailQuote}
      />

    </div>
  );
};

export default QuoteList;