import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Filter, RefreshCw, 
  MapPin, User, Building, AlertTriangle, Clock, CheckCircle2, X,
  LayoutGrid, Server
} from 'lucide-react';
import toast from 'react-hot-toast';

import feedbackService from '../../services/api/feedbackService';
import FeedbackStats from '../../components/feedbacks/FeedbackStats';
import FeedbackFormModal from '../../components/feedbacks/FeedbackFormModal';
import FeedbackDetailModal from '../../components/feedbacks/FeedbackDetailModal';
import Pagination from '../../components/ui/Pagination';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);


  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus || undefined,
          priority: filterPriority || undefined, 
          feedback_type: filterType || undefined
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const res = await feedbackService.getAll(params);

      if (res.data) {
    
         const responseData = res.data.data || res.data; 
         
         setFeedbacks(Array.isArray(responseData) ? responseData : (res.data.data || []));
         setTotalItems(res.data.total || 0);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải danh sách phản hồi");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus, filterPriority, filterType]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);


  const getPriorityBadge = (priority) => {
      const config = {
          high: 'bg-red-100 text-red-700 border-red-200',
          medium: 'bg-orange-100 text-orange-700 border-orange-200',
          low: 'bg-green-100 text-green-700 border-green-200'
      };
      const className = config[priority] || 'bg-slate-100 text-slate-600';
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${className}`}>
            {priority === 'high' ? 'Cao' : priority === 'medium' ? 'TB' : priority === 'low' ? 'Thấp' : priority}
        </span>
      );
  };

  const getStatusBadge = (status) => {
      const config = {
          open: { icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100', text: 'Chờ xử lý' },
          in_progress: { icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-100', text: 'Đang xử lý' },
          resolved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100', text: 'Đã giải quyết' },
          closed: { icon: X, color: 'text-slate-500 bg-slate-100 border-slate-200', text: 'Đã đóng' }
      };

      const style = config[status] || { icon: AlertTriangle, color: 'text-gray-500', text: status };
      const Icon = style.icon;

      return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${style.color}`}>
              <Icon size={14} />
              {style.text}
          </div>
      );
  };

  const getFeedbackTypeInfo = (type) => {
      switch(type) {
          case 'tour': return { icon: <MapPin size={14}/>, label: 'Tour', color: 'text-purple-600' };
          case 'service': return { icon: <LayoutGrid size={14}/>, label: 'Dịch vụ', color: 'text-indigo-600' };
          case 'supplier': return { icon: <Building size={14}/>, label: 'Nhà cung cấp', color: 'text-blue-600' };
          case 'staff': return { icon: <User size={14}/>, label: 'Nhân sự', color: 'text-orange-600' };
          case 'system': return { icon: <Server size={14}/>, label: 'Hệ thống', color: 'text-slate-600' };
          default: return { icon: <MessageSquare size={14}/>, label: type || 'Khác', color: 'text-slate-600' };
      }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 1. Header & Actions */}
      <div className="flex justify-between items-end mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Phản hồi</h1>
            <p className="text-slate-500 text-sm mt-1">Tiếp nhận và xử lý ý kiến đóng góp từ hệ thống.</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all active:scale-95"
        >
            <Plus size={20}/> Tạo Phản hồi
        </button>
      </div>

      <FeedbackStats />

      {/* 2. Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mr-2">
            <Filter size={16}/> Bộ lọc:
        </div>
        
        {/* Status Filter */}
        <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
        >
            <option value="">Tất cả trạng thái</option>
            <option value="open">🔴 Chờ xử lý</option>
            <option value="in_progress">🔵 Đang xử lý</option>
            <option value="resolved">🟢 Đã giải quyết</option>
            <option value="closed">⚪ Đã đóng</option>
        </select>

        {/* Priority Filter */}
        <select 
            value={filterPriority} 
            onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
        >
            <option value="">Tất cả mức độ</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
        </select>

        {/* Type Filter - Khớp với validation backend */}
        <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
        >
            <option value="">Tất cả loại</option>
            <option value="tour">Tour</option>
            <option value="service">Dịch vụ</option>
            <option value="supplier">Nhà cung cấp</option>
            <option value="staff">Nhân sự</option>
            <option value="system">Hệ thống</option>
        </select>

        <button 
            onClick={fetchFeedbacks}
            className="ml-auto p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Làm mới dữ liệu"
        >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* 3. Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                    <th className="p-4 w-16 text-center">#ID</th>
                    <th className="p-4 w-36">Trạng thái</th>
                    <th className="p-4">Nội dung</th>
                    <th className="p-4 w-36">Phân loại</th>
                    <th className="p-4 w-24 text-center">Mức độ</th>
                    <th className="p-4 w-48">Người gửi</th>
                    <th className="p-4 w-32 text-right">Ngày tạo</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                    <tr><td colSpan="7" className="p-12 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                ) : feedbacks.length === 0 ? (
                    <tr><td colSpan="7" className="p-12 text-center text-slate-400 italic">Không tìm thấy dữ liệu phù hợp.</td></tr>
                ) : (
                    feedbacks.map(item => {
                        const typeInfo = getFeedbackTypeInfo(item.feedback_type);
                        return (
                            <tr 
                                key={item.id} 
                                onClick={() => setSelectedFeedback(item)}
                                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="p-4 text-center font-mono text-slate-500">#{item.id}</td>
                                <td className="p-4">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-4 max-w-md">
                                    <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1 mb-0.5">
                                        {item.subject}
                                    </div>
                                    <div className="text-slate-500 text-xs line-clamp-1">
                                        {item.content}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className={`flex items-center gap-1.5 font-medium ${typeInfo.color}`}>
                                        {typeInfo.icon}
                                        {typeInfo.label}
                                    </div>
                                    {item.tour_code && <div className="text-[10px] text-slate-400 mt-0.5">{item.tour_code}</div>}
                                    {item.supplier_name && <div className="text-[10px] text-slate-400 mt-0.5">{item.supplier_name}</div>}
                                </td>
                                <td className="p-4 text-center">
                                    {getPriorityBadge(item.priority)}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-700 text-sm">{item.submitted_by_name || 'N/A'}</div>
                                    <div className="text-xs text-slate-400 truncate max-w-[150px]" title={item.submitted_by_email}>
                                        {item.submitted_by_email}
                                    </div>
                                </td>
                                <td className="p-4 text-right text-slate-500 text-xs font-mono">
                                    {new Date(item.created_at).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })}
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
        
        {/* Pagination */}
        {totalItems > 0 && (
            <div className="p-4 border-t border-slate-200">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        // Cuộn lên đầu bảng khi chuyển trang
                        document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                />
            </div>
        )}
      </div>

      {/* 4. Modals */}
      
      {/* Modal Tạo mới - Refresh list khi tạo thành công */}
      <FeedbackFormModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { 
            fetchFeedbacks(); 
        }} 
      />

      {/* Modal Chi tiết - Refresh list khi update status/assign */}
      <FeedbackDetailModal 
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        feedback={selectedFeedback}
        onUpdate={() => { 
            fetchFeedbacks();
            setSelectedFeedback(null);
        }}
      />

    </div>
  );
};

export default FeedbackList;