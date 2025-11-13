import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Đây là trang Thêm Tour mới (Placeholder)
 * Chỉ để link từ trang TourList không bị lỗi 404
 */
export default function TourCreate() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tours" className="text-slate-500 hover:text-primary">
          <i className="ri-arrow-left-line text-2xl"></i>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Tạo Tour mới</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700">Form tạo tour...</h2>
        <p className="text-slate-500 mt-2">Nội dung form tạo tour sẽ được xây dựng ở đây.</p>
      </div>
    </div>
  );
}