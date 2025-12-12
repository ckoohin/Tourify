import React, { useState, useEffect } from 'react';
import { Plus, Activity, AlertTriangle, MessageSquare, Camera, FileText, MapPin, Clock, Trash2, Edit, Cloud, Filter } from 'lucide-react';
import tourLogService from '../../../services/api/tourLogService';
import TourLogForm from './TourLogForm';
import toast from 'react-hot-toast';

const TourLogList = ({ departureId }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, statRes] = await Promise.all([
          tourLogService.getByDepartureId(departureId, { log_type: filterType || undefined, limit: 50 }),
          tourLogService.getStats(departureId)
      ]);
      
      if (logRes && logRes.success) {
         setLogs(logRes.data?.data || []); 
      }

      if (statRes && statRes.success) {
         setStats(statRes.data || []);
      }

    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departureId) fetchData();
  }, [departureId, filterType]);

  const handleDelete = async (id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa nhật ký này không?")) return;
      try {
          await tourLogService.delete(id);
          toast.success("Đã xóa");
          fetchData();
      } catch (e) { toast.error("Lỗi xóa"); }
  };

  const getTypeConfig = (type) => {
      switch(type) {
          case 'incident': return { color: 'bg-red-100 text-red-600 border-red-200', icon: AlertTriangle, label: 'Sự cố' };
          case 'feedback': return { color: 'bg-purple-100 text-purple-600 border-purple-200', icon: MessageSquare, label: 'Phản hồi' };
          case 'photo': return { color: 'bg-blue-100 text-blue-600 border-blue-200', icon: Camera, label: 'Hình ảnh' };
          case 'note': return { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: FileText, label: 'Ghi chú' };
          default: return { color: 'bg-green-100 text-green-600 border-green-200', icon: Activity, label: 'Hoạt động' };
      }
  };

  const getCountByType = (type) => {
      const stat = stats.find(s => s.log_type === type);
      return stat ? stat.count : 0;
  };

  return (
    <div className="p-6">
      {/* Header Stats & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${!filterType ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                Tất cả
            </button>
            {['activity', 'incident', 'feedback', 'photo', 'note'].map(type => {
                const conf = getTypeConfig(type);
                const count = getCountByType(type);
                const isActive = filterType === type;
                return (
                    <button 
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 whitespace-nowrap ${isActive ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${conf.color.replace('text-', 'text-').replace('bg-', 'bg-opacity-50 ')}`}
                    >
                        <conf.icon size={12}/> {conf.label} <span className="ml-1 opacity-70 bg-white/50 px-1.5 rounded-full">{count}</span>
                    </button>
                )
            })}
        </div>
        
        <button 
            onClick={() => setModal({ open: true, data: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm shrink-0 transition-colors"
        >
            <Plus size={18}/> Viết Nhật Ký
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải nhật ký...</div>
      ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <FileText size={40} className="mx-auto mb-3 opacity-20"/>
              <p className="text-slate-500">Chưa có nhật ký nào. Hãy bắt đầu ghi lại hành trình!</p>
          </div>
      ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-8">
              {logs.map(log => {
                  const conf = getTypeConfig(log.log_type);
                  const LogIcon = conf.icon;
                  
                  return (
                      <div key={log.id} className="relative pl-8 group">
                          <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-white ${conf.color.split(' ')[1]}`}>
                              <LogIcon size={12}/>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${conf.color}`}>{conf.label}</span>
                                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                              <Clock size={12}/> {new Date(log.log_date).toLocaleDateString('vi-VN')} {log.log_time?.slice(0,5)}
                                          </span>
                                      </div>
                                      {log.title && <h4 className="font-bold text-slate-800 text-sm">{log.title}</h4>}
                                  </div>
                                  
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setModal({ open: true, data: log })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Sửa"><Edit size={14}/></button>
                                      <button onClick={() => handleDelete(log.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14}/></button>
                                  </div>
                              </div>

                              <p className="text-sm text-slate-600 whitespace-pre-line mb-3">{log.content}</p>

                              {(log.location || log.weather) && (
                                  <div className="flex gap-3 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded border border-slate-100 w-fit">
                                      {log.location && <span className="flex items-center gap-1"><MapPin size={12}/> {log.location}</span>}
                                      {log.weather && <span className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-300"><Cloud size={12}/> {log.weather}</span>}
                                  </div>
                              )}

                              {log.images && log.images.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                                      {log.images.map((img, idx) => (
                                          <div key={idx} className="relative group/img">
                                            <img 
                                                src={img} 
                                                alt="Log" 
                                                className="h-24 w-auto rounded-lg border border-slate-100 object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => window.open(img, '_blank')}
                                            />
                                          </div>
                                      ))}
                                  </div>
                              )}

                              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 italic flex justify-between">
                                  <span>Ghi bởi: <span className="font-medium text-slate-600">{log.created_by_name || 'Unknown'}</span></span>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      <TourLogForm 
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        onSuccess={fetchData}
        initialData={modal.data}
        departureId={departureId}
      />
    </div>
  );
};

export default TourLogList;