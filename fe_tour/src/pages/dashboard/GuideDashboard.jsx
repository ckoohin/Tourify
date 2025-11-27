import React from 'react';
import { Calendar, MapPin, UserCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuideDashboard = ({ user }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Xin chào HDV {user?.name}! 🎒</h1>
          <p className="text-emerald-50 text-lg">
            Chúc bạn có những chuyến đi an toàn và tuyệt vời cùng du khách.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
           <MapPin size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Tour */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Calendar className="text-emerald-600" size={20}/> Tour sắp tới của bạn
            </h3>
            <Link to="/guide/my-schedule" className="text-sm text-blue-600 hover:underline">Xem lịch chi tiết</Link>
          </div>

          {/* Card Tour Giả lập */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xl text-slate-800">Hà Giang - Mùa Hoa Tam Giác Mạch</h4>
                <div className="flex items-center gap-4 mt-2 text-slate-600 text-sm">
                  <span className="flex items-center gap-1"><Clock size={16}/> 3 Ngày 2 Đêm</span>
                  <span className="flex items-center gap-1"><UserCheck size={16}/> 15 Khách</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Sắp khởi hành</span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
              <Link to="/guide/guests" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors">
                Xem danh sách đoàn
              </Link>
              <Link to="/guide/checkin" className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-center py-2.5 rounded-lg font-medium transition-colors">
                Check-in Điểm danh
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Quick Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Việc cần làm</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
              <span className="text-sm font-medium">Xác nhận lịch dẫn tháng 12</span>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium">Cập nhật nhật ký tour hôm qua</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;