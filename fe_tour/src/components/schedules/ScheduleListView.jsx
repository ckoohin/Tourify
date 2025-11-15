import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge'; // 👈 Tái sử dụng

// Ánh xạ (Mapping) 'status' từ DB sang 'level' của StatusBadge
const statusMap = {
  scheduled: { level: 'warning', text: 'Đã lên lịch' },
  confirmed: { level: 'success', text: 'Đã xác nhận' },
  in_progress: { level: 'primary', text: 'Đang chạy' },
  completed: { level: 'info', text: 'Hoàn thành' },
  cancelled: { level: 'danger', text: 'Đã hủy' },
};

const ScheduleListView = ({ departures }) => {
  if (departures.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        Không tìm thấy lịch khởi hành nào phù hợp.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-5 py-3">Mã Đoàn</th>
            <th className="px-5 py-3">Tên Tour</th>
            <th className="px-5 py-3">Ngày đi</th>
            <th className="px-5 py-3">Ngày về</th>
            <th className="px-5 py-3">Khách (C/M)</th>
            <th className="px-5 py-3">HDV Chính</th>
            <th className="px-5 py-3">Trạng thái</th>
            <th className="px-5 py-3">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {departures.map((d) => {
            const currentStatus = statusMap[d.status] || { level: 'info', text: d.status };
            return (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-medium text-primary">
                  <Link to={`/schedules/${d.id}`} className="hover:underline">
                    {d.departure_code}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium truncate max-w-[250px]">
                  {d.tour_name}
                </td>
                <td className="px-5 py-4 text-slate-600">{d.departure_date}</td>
                <td className="px-5 py-4 text-slate-600">{d.return_date}</td>
                <td className="px-5 py-4 text-slate-600">{d.guests}</td>
                <td className="px-5 py-4 text-slate-600">{d.guide_name || '--'}</td>
                <td className="px-5 py-4">
                  <StatusBadge level={currentStatus.level} text={currentStatus.text} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Link
                      to={`/schedules/${d.id}`} // Link tới trang Chi tiết
                      className="p-2 text-slate-400 hover:text-primary"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/schedules/edit/${d.id}`} // Link tới trang Sửa
                      className="p-2 text-slate-400 hover:text-blue-600"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleListView;