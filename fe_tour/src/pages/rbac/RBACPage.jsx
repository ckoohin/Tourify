import React, { useState } from 'react';
import { Shield, Key } from 'lucide-react';
import RoleList from './RoleList';
import PermissionList from './PermissionList';

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 mb-2">
        <div className="text-sm text-slate-500 mb-1">
          Trang chủ &gt; Quản trị hệ thống &gt; <span className="text-slate-800 font-medium">Vai trò & Phân quyền</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
            activeTab === 'roles'
              ? 'bg-white text-blue-600 border-blue-600 shadow-sm ring-1 ring-blue-100'
              : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200 hover:text-slate-700'
          }`}
        >
          <Shield size={18} />
          Vai trò
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
            activeTab === 'permissions'
              ? 'bg-white text-blue-600 border-blue-600 shadow-sm ring-1 ring-blue-100'
              : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200 hover:text-slate-700'
          }`}
        >
          <Key size={18} />
          Quyền hạn
        </button>
      </div>

      <div className="transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2">
        {activeTab === 'roles' ? <RoleList /> : <PermissionList />}
      </div>
    </div>
  );
}