import React from 'react';
import { Building2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupplierDashboard = ({ user }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Kênh Đối tác - {user?.name}</h1>
        <p className="text-slate-300 text-lg">
          Quản lý dịch vụ, xác nhận booking và theo dõi thanh toán tập trung.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-orange-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Yêu cầu mới cần xác nhận</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">05</h3>
            </div>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle size={24}/></div>
          </div>
          <Link to="/supplier/bookings" className="text-orange-600 text-sm font-medium mt-4 block hover:underline">Xử lý ngay &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Booking trong tháng</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">28</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle size={24}/></div>
          </div>
          <Link to="/supplier/history" className="text-blue-600 text-sm font-medium mt-4 block hover:underline">Xem lịch sử &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Công nợ hiện tại</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">12.5tr</h3>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Building2 size={24}/></div>
          </div>
          <Link to="/supplier/debts" className="text-emerald-600 text-sm font-medium mt-4 block hover:underline">Đối soát ngay &rarr;</Link>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Yêu cầu dịch vụ mới nhất</h3>
          <Link to="/supplier/requests" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
        </div>
        <div className="p-6 text-center text-slate-500 py-12">
          <FileText size={48} className="mx-auto mb-3 text-slate-300"/>
          <p>Hiện chưa có yêu cầu dịch vụ mới nào.</p>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;