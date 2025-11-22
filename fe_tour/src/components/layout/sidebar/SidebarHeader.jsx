import React from 'react';
import { Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';

const SidebarHeader = () => {
  return (
    <div className="h-16 flex items-center px-6 bg-[#0f172a] border-b border-slate-800 shrink-0">
      <Link to="/" className="flex items-center gap-3 group w-full">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
          <CircleUserRound className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-white text-lg font-bold tracking-tight">Tourify</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Admin Portal</span>
        </div>
      </Link>
    </div>
  );
};

export default SidebarHeader;