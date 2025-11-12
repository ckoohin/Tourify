import React from 'react';
import { Link } from 'react-router-dom';


export default function Login() {
  return (
    <>
      <h2 className="text-center text-2xl font-bold text-slate-800 mb-1">
        Chào mừng trở lại!
      </h2>
      <p className="text-center text-sm text-slate-500 mb-6">
        Đăng nhập vào hệ thống quản trị Tourify.
      </p>

      <form className="space-y-5">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <div className="relative">
            <i className="ri-mail-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="email"
              id="email"
              placeholder="admin@tourify.com"
              className="block w-full text-sm border-slate-300 rounded-lg shadow-sm pl-10 p-2.5 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <i className="ri-lock-2-line text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="block w-full text-sm border-slate-300 rounded-lg shadow-sm pl-10 p-2.5 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow-sm"
        >
          Đăng nhập
        </button>

        {/* Link to Register */}
        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </>
  );
}