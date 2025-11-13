import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Đây là trang Đăng ký (Placeholder)
 * Chỉ để link từ trang Login không bị lỗi 404
 */
export default function Register() {
  return (
    <>
      <h2 className="text-center text-2xl font-bold text-slate-800 mb-6">
        Tạo tài khoản
      </h2>
      
      <form className="space-y-5">
        {/* Tên */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Họ và Tên
          </label>
          <input type="text" id="name" placeholder="Nguyễn Văn A" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" />
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input type="email" id="email" placeholder="admin@tourify.com" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" />
        </div>

        {/* Mật khẩu */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input type="password" id="password" placeholder="••••••••" className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Đăng ký
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </>
  );
}