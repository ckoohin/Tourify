import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import departureService from '../../services/api/departureService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import DepartureForm from '../../components/operations/DepartureForm'; 

const DepartureList = () => {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [total, setTotal] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departureService.getAll(filters);
      if (res.success) {
        setDepartures(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (error) {
      toast.error("Lỗi tải lịch khởi hành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  const getStatusConfig = (status) => {
      const map = {
          scheduled: { level: 'info', text: 'Lên lịch' },
          confirmed: { level: 'primary', text: 'Chốt đoàn' },
          in_progress: { level: 'warning', text: 'Đang đi' },
          completed: { level: 'success', text: 'Hoàn thành' },
          cancelled: { level: 'danger', text: 'Hủy' }
      };
      return map[status] || { level: 'default', text: status };
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch Khởi Hành</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus size={18}/> Tạo Lịch Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
            <input 
                type="text" placeholder="Tìm theo mã hoặc tên tour..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={e => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
            />
         </div>
         <select 
            className="border rounded-lg px-4 py-2"
            value={filters.status}
            onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
         >
             <option value="">Tất cả trạng thái</option>
             <option value="scheduled">Lên lịch</option>
             <option value="confirmed">Chốt đoàn</option>
             <option value="in_progress">Đang đi</option>
             <option value="completed">Hoàn thành</option>
         </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 font-medium text-slate-600 border-b">
                <tr>
                    <th className="px-4 py-3">Mã Lịch</th>
                    <th className="px-4 py-3">Tour Version</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Số chỗ</th>
                    <th className="px-4 py-3">Nhân sự</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {departures.map(item => {
                    const status = getStatusConfig(item.status);
                    // Tính % lấp đầy
                    const fillRate = Math.round((item.confirmed_guests / item.max_guests) * 100) || 0;
                    
                    return (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-bold text-blue-600">
                                <Link to={`/departures/${item.id}`} className="hover:underline">{item.departure_code}</Link>
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium text-slate-800 truncate max-w-xs" title={item.tour_name}>{item.tour_name}</div>
                                <div className="text-xs text-slate-500">{item.version_name}</div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-slate-400"/>
                                    <span>{formatDate(item.departure_date)}</span>
                                </div>
                                <div className="text-xs text-slate-400 pl-5">→ {formatDate(item.return_date)}</div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                                        <div className={`h-full ${fillRate >= 80 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${fillRate}%`}}></div>
                                    </div>
                                    <span className="text-xs font-medium">{item.confirmed_guests}/{item.max_guests}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                                <div>HDV: {item.tour_guide_name || '--'}</div>
                                <div>Leader: {item.tour_leader_name || '--'}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <StatusBadge level={status.level} text={status.text} />
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link to={`/departures/${item.id}`} className="text-blue-600 hover:underline text-xs font-medium">Chi tiết</Link>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-4">
         <Pagination 
            currentPage={filters.page} 
            totalItems={total} 
            itemsPerPage={filters.limit} 
            onPageChange={p => setFilters(prev => ({...prev, page: p}))}
         />
      </div>

      {/* Create Modal */}
      <DepartureForm 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSuccess={fetchData} 
      />
    </div>
  );
};

export default DepartureList;