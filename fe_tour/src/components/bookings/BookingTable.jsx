import React from 'react';
import { Eye, Edit, Trash2, Calendar, User, DollarSign, FileText } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const BookingTable = ({ bookings, loading, onEdit, onDelete }) => {

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusConfig = (status) => {
    const map = {
      pending: { level: 'warning', text: 'Chờ xử lý' },
      confirmed: { level: 'primary', text: 'Đã xác nhận' },
      deposited: { level: 'info', text: 'Đã cọc' },
      paid: { level: 'success', text: 'Đã thanh toán' },
      completed: { level: 'success', text: 'Hoàn thành' },
      cancelled: { level: 'danger', text: 'Đã hủy' },
    };
    return map[status] || { level: 'default', text: status };
  };

  return (
    <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="p-4 border-b">Mã Booking</th>
              <th className="p-4 border-b">Thông tin Tour</th>
              <th className="p-4 border-b">Ngày đi</th>
              <th className="p-4 border-b">Khách hàng (ID)</th>
              <th className="p-4 border-b">Số lượng</th>
              <th className="p-4 border-b text-right">Tổng tiền</th>
              <th className="p-4 border-b text-center">Trạng thái</th>
              <th className="p-4 border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">Không tìm thấy booking nào</td></tr>
            ) : (
              bookings.map((booking) => {
                const statusConf = getStatusConfig(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-medium text-blue-600">
                        {booking.booking_code}
                        <div className="text-[10px] text-gray-400 font-mono">#{booking.id}</div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700">Version ID: {booking.tour_version_id}</span>
                        </div>
                        <div className="text-xs text-gray-500">{booking.booking_type === 'group' ? 'Đoàn' : 'Cá nhân'}</div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14}/> {formatDate(booking.departure_date)}
                        </div>
                    </td>
                    <td className="p-4 text-gray-600">
                        ID: {booking.customer_id}
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-700" title="Người lớn / Trẻ em / Em bé">
                            <User size={14}/> 
                            <span>{booking.total_guests}</span>
                            <span className="text-xs text-gray-400">({booking.total_adults}/{booking.total_children}/{booking.total_infants}/{booking.total_senior})</span>
                        </div>
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-600">
                        {formatCurrency(booking.total_amount, booking.currency)}
                    </td>
                    <td className="p-4 text-center">
                        <StatusBadge level={statusConf.level} text={statusConf.text} />
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => onEdit(booking)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                            <button onClick={() => onDelete(booking.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;