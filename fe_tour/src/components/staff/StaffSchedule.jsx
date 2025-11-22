import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, Trash2 } from 'lucide-react';
import staffService from '../../services/api/staffService';

const StaffSchedule = ({ staffId }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    schedule_date: '',
    schedule_type: 'busy',
    start_time: '08:00',
    end_time: '17:00',
    notes: ''
  });

  const fetchSchedule = async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const startDate = new Date(viewDate);
      startDate.setDate(startDate.getDate() - 15);
      const endDate = new Date(viewDate);
      endDate.setDate(endDate.getDate() + 15);

      const res = await staffService.getSchedule(
        staffId, 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      );
      
      if (res.success) {
        setSchedules(res.data.schedule);
      }
    } catch (error) {
      console.error("Lỗi tải lịch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [staffId, viewDate]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await staffService.addSchedule(staffId, newSchedule);
      alert("Thêm lịch thành công!");
      setIsAdding(false);
      fetchSchedule();
    } catch (error) {
      alert("Lỗi thêm lịch: " + error.response?.data?.message);
    }
  };

  const getScheduleColor = (type) => {
    switch (type) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'day_off': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sick_leave': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'annual_leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-white border-slate-200';
    }
  };

  const getTypeName = (type) => {
    const map = {
      available: 'Rảnh', busy: 'Bận', day_off: 'Nghỉ phép', 
      sick_leave: 'Nghỉ ốm', annual_leave: 'Nghỉ phép năm'
    };
    return map[type] || type;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600"/> Lịch làm việc
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-1 transition-colors"
        >
          <Plus size={16}/> Thêm lịch
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSchedule} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-fade-in-down">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ngày</label>
              <input 
                type="date" 
                required
                className="w-full border rounded px-2 py-1 text-sm"
                value={newSchedule.schedule_date}
                onChange={e => setNewSchedule({...newSchedule, schedule_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Loại</label>
              <select 
                className="w-full border rounded px-2 py-1 text-sm"
                value={newSchedule.schedule_type}
                onChange={e => setNewSchedule({...newSchedule, schedule_type: e.target.value})}
              >
                <option value="busy">Bận</option>
                <option value="available">Rảnh (Đăng ký)</option>
                <option value="day_off">Nghỉ (Day Off)</option>
                <option value="sick_leave">Nghỉ ốm</option>
                <option value="annual_leave">Phép năm</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Từ</label>
               <input type="time" className="w-full border rounded px-2 py-1 text-sm" value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Đến</label>
               <input type="time" className="w-full border rounded px-2 py-1 text-sm" value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
             </div>
          </div>
          <textarea 
            placeholder="Ghi chú (VD: Đi viện, bận việc gia đình...)" 
            className="w-full border rounded px-2 py-1 text-sm"
            rows="2"
            value={newSchedule.notes}
            onChange={e => setNewSchedule({...newSchedule, notes: e.target.value})}
          ></textarea>
          <div className="flex justify-end gap-2">
             <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-slate-50">Hủy</button>
             <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {loading ? (
           <p className="text-center text-slate-500 text-sm py-4">Đang tải lịch...</p>
        ) : schedules.length === 0 ? (
           <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
              <p className="text-slate-400 text-sm">Chưa có lịch làm việc nào gần đây</p>
           </div>
        ) : (
          schedules.map((item) => (
            <div key={item.id} className={`p-3 rounded-lg border ${getScheduleColor(item.schedule_type)} flex justify-between items-start`}>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{new Date(item.schedule_date).toLocaleDateString('vi-VN')}</span>
                    <span className="text-[10px] uppercase border px-1.5 rounded bg-white/50 font-semibold tracking-wider">
                      {getTypeName(item.schedule_type)}
                    </span>
                  </div>
                  {(item.start_time || item.end_time) && (
                    <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                       <Clock size={12} />
                       {item.start_time?.slice(0,5)} - {item.end_time?.slice(0,5)}
                    </div>
                  )}
                  {item.notes && <p className="text-xs italic opacity-90">"{item.notes}"</p>}
                  {item.tour_name && (
                     <div className="mt-2 text-xs font-medium bg-white/60 p-1.5 rounded text-slate-700">
                        Tour: {item.tour_name}
                     </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffSchedule;