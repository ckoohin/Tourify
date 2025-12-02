import React from 'react';
import { User, Calendar, DollarSign } from 'lucide-react';

const BookingCard = ({ booking, onDragStart, onClick }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, booking)}
      onClick={() => onClick(booking)}
      className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-grab active:cursor-grabbing transition-all mb-2 group"
    >
      {/* Header: Code & Price */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
          {booking.booking_code}
        </span>
        <span className="text-[11px] font-bold text-emerald-600">
          {formatCurrency(booking.total_amount)}
        </span>
      </div>

      {/* Customer Name */}
      <div className="flex items-center gap-1.5 mb-1">
        <User size={12} className="text-slate-400 shrink-0"/>
        <h4 className="text-xs font-medium text-slate-700 line-clamp-1" title={booking.customer_name}>
           {booking.customer_name || `Khách #${booking.customer_id}`}
        </h4>
      </div>

      {/* Footer: Tour & Date */}
      <div className="flex justify-between items-center pt-1.5 border-t border-slate-50 mt-1">
         <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[60%]" title={`Tour Ver: ${booking.tour_version_id}`}>
            T: {booking.tour_version_id}
         </div>
         <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar size={10}/>
            {new Date(booking.created_at).toLocaleDateString('vi-VN')}
         </div>
      </div>
    </div>
  );
};

export default BookingCard;