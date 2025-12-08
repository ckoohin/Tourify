import React from 'react';
import { Users, CheckCircle2, XCircle, Clock, AlertTriangle, PieChart } from 'lucide-react';

const CheckinStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const total = stats.total_checkins || 0;
  const checkedIn = (stats.checked_in || 0) + (stats.auto_checked || 0);
  const missed = stats.missed || 0;
  const excused = stats.excused || 0;
  const pending = stats.pending || 0;

  const getPercent = (val) => total > 0 ? (val / total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Guests */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tổng lượt</p>
            <h3 className="text-2xl font-black text-slate-800">{total}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
        </div>

        {/* Checked In */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-500 uppercase mb-1">Đã có mặt</p>
            <h3 className="text-2xl font-black text-green-600">{checkedIn}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Missed/Absent */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase mb-1">Vắng mặt</p>
            <h3 className="text-2xl font-black text-red-600">{missed}</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <XCircle size={20} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase mb-1">Chưa điểm danh</p>
            <h3 className="text-2xl font-black text-orange-600">{pending}</h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* 2. Progress Bar Visualization */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
                <PieChart size={16} className="text-slate-400"/>
                <span className="text-sm font-bold text-slate-700">Tỷ lệ chuyên cần</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{stats.attendance_rate}%</span>
        </div>
        
        {/* Multi-color Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${getPercent(checkedIn)}%` }} className="h-full bg-green-500 transition-all duration-500" title="Đã check-in"/>
            <div style={{ width: `${getPercent(excused)}%` }} className="h-full bg-orange-400 transition-all duration-500" title="Có phép"/>
            <div style={{ width: `${getPercent(missed)}%` }} className="h-full bg-red-500 transition-all duration-500" title="Vắng mặt"/>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-slate-500 justify-end">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Có mặt</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Có phép ({excused})</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Vắng ({missed})</div>
        </div>
      </div>
    </div>
  );
};

export default CheckinStats;