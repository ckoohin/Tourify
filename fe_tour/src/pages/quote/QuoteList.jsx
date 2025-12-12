import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import quoteService from '../../services/api/quoteService';
import QuoteTable from '../../components/quotes/QuoteTable';
import QuickQuoteModal from '../../components/quotes/QuickQuoteModal'; 
import QuoteDetailModal from '../../components/quotes/QuoteDetailModal'; 
import Pagination from '../../components/ui/Pagination'; 
import { useAuth } from '../../context/AuthContext'; 

const QuoteList = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = {
          ...filters,
          page: currentPage,
          limit: itemsPerPage
      };

      const res = await quoteService.getAll(params);
      
      if (res.success) {
        setQuotes(res.data.quotes || []);
        const total = res.data.total || res.data.pagination?.totalItems || 0;
        setTotalItems(total);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách báo giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [filters, currentPage]);

  const handleFilterChange = (e) => {
      setFilters(prev => ({...prev, status: e.target.value}));
      setCurrentPage(1); 
  };

  const handlePageChange = (page) => {
      setCurrentPage(page);
  };

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
    <div className="bg-slate-50 min-h-screen">
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
                className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-indigo-500 appearance-none bg-white cursor-pointer"
                value={filters.status}
                onChange={handleFilterChange}
             >
                 <option value="">Tất cả trạng thái</option>
                 <option value="draft">Bản nháp</option>
                 <option value="sent">Đã gửi</option>
                 <option value="accepted">Đã chốt</option>
                 <option value="rejected">Từ chối</option>
                 <option value="expired">Hết hạn</option>
             </select>
        </div>
        <button 
            onClick={fetchQuotes} 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Tải lại dữ liệu"
        >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
        </button>
      </div>

      {/* Table & Pagination */}
      {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
              Đang tải dữ liệu...
          </div>
      ) : (
          <div className="flex flex-col gap-4">
              <QuoteTable 
                quotes={quotes} 
                onView={(q) => setDetailQuote(q)} 
                onUpdateStatus={handleUpdateStatus}
              />
              
              {totalItems > 0 && (
                <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>
              )}
          </div>
      )}

      {/* Modals */}
      <QuickQuoteModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { fetchQuotes(); }} 
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