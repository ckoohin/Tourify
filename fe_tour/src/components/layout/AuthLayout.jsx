import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-midnight to-[#1E293B] p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              {/* Sử dụng Remixicon (đã có trong file HTML) */}
              <i className="ri-map-pin-user-fill text-white text-xl leading-none"></i>
            </div>
            <span className="text-white text-2xl font-bold tracking-wide">Tourify</span>
          </Link>
        </div>
        
        {/* Box nội dung (sẽ chứa Login.jsx hoặc Register.jsx) */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}