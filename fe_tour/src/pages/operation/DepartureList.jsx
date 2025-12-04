import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import departureService from '../../services/api/departureService';
import DepartureStatusBadge from '../../components/operations/DepartureStatusBadge';
import DepartureFormModal from '../../components/operations/DepartureFormModal';
import toast from 'react-hot-toast';

const DepartureList = () => {
  const navigate = useNavigate();
  // Ensure initial state is an empty array to avoid .map error on first render
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departureService.getAll({ 
        status: filterStatus || undefined,
        search: searchTerm || undefined,
        limit: 20 
      });
      
      // Check response structure carefully
      if (res.success) {
        // Handle different possible response structures (pagination vs direct array)
        const dataList = res.data?.data || res.data || [];
        setDepartures(Array.isArray(dataList) ? dataList : []);
      } else {
        setDepartures([]);
      }
    } catch (error) {
      console.error(error);
      setDepartures([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]); // Re-fetch when filter changes

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa lịch khởi hành này?")) return;
      try {
          await departureService.delete(id);
          toast.success("Đã xóa thành công");
          fetchData();
      } catch (error) {
          toast.error("Lỗi xóa: Có thể đã có khách đặt tour");
      }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch Khởi Hành</h1>
        <button 
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
            <Plus size={20} /> Tạo Lịch Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Tìm theo mã tour, tên tour..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
        </div>
        
        <select 
            className="border rounded-lg px-4 py-2 outline-none bg-white min-w-[150px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
        >
            <option value="">Tất cả trạng thái</option>
            <option value="scheduled">Dự kiến</option>
            <option value="confirmed">Chắc chắn</option>
            <option value="in_progress">Đang đi</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
        </select>

        <button onClick={fetchData} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
            Lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-sm">
                <tr>
                    <th className="p-4">Mã Lịch</th>
                    <th className="p-4">Tour / Hành trình</th>
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Số chỗ</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
                {/* Ensure departures is an array before mapping */}
                {Array.isArray(departures) && departures.map(item => {
                    const percent = item.max_guests > 0 ? (item.confirmed_guests / item.max_guests) * 100 : 0;
                    return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono font-medium text-blue-600">{item.departure_code}</td>
                            <td className="p-4">
                                <div className="font-medium text-slate-800 line-clamp-1">{item.tour_name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{item.version_name}</div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <Calendar size={14}/> 
                                    {new Date(item.departure_date).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 pl-5">
                                    đến {new Date(item.return_date).toLocaleDateString('vi-VN')}
                                </div>
                            </td>
                            <td className="p-4 w-40">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium">{item.confirmed_guests}/{item.max_guests}</span>
                                    <span className="text-slate-500">{Math.round(percent)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(percent, 100)}%`}}></div>
                                </div>
                            </td>
                            <td className="p-4">
                                <DepartureStatusBadge status={item.status} />
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => navigate(`/departures/${item.id}`)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" 
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded" 
                                        title="Sửa"
                                    >
                                        <Edit size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" 
                                        title="Xóa"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        {(!departures || departures.length === 0) && !loading && (
            <div className="p-8 text-center text-slate-500">Không tìm thấy lịch khởi hành nào.</div>
        )}
        {loading && (
            <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        )}
      </div>

      <DepartureFormModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        initialData={selectedItem}
      />
    </div>
  );
};

export default DepartureList;