import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <i className="ri-map-pin-user-fill text-white text-xl leading-none"></i>
            </div>
            <span className="text-midnight text-2xl font-bold tracking-wide">Tourify</span>
          </Link>
        </div>
        
        {/* Nội dung 404 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-slate-800">
            Không tìm thấy trang
          </h2>
          <p className="mt-4 text-slate-500">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại, đã bị di chuyển hoặc nhập sai địa chỉ.
          </p>
          
          <Link 
            to="/dashboard"
            className="mt-8 inline-block w-full max-w-xs px-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Quay về Trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
}