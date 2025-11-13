import React from 'react';
import { Link } from 'react-router-dom';

export default function BookingCreate() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/bookings" className="text-slate-500 hover:text-primary">
          <i className="ri-arrow-left-line text-2xl"></i>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Tạo Booking (Offline)</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700">Form tạo booking...</h2>
        <p className="text-slate-500 mt-2">Nội dung form tạo booking thủ công sẽ được xây dựng ở đây.</p>
      </div>
    </div>
  );
}