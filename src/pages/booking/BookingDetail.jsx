import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function BookingDetail() {
  const { id } = useParams(); // Lấy ID từ URL

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/bookings" className="text-slate-500 hover:text-primary">
          <i className="ri-arrow-left-line text-2xl"></i>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Chi tiết Booking #{id}</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700">Thông tin chi tiết...</h2>
        <p className="text-slate-500 mt-2">Nội dung chi tiết của booking #{id} sẽ được hiển thị ở đây.</p>
      </div>
    </div>
  );
}