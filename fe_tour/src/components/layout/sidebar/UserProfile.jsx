import React from 'react';

const UserProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="p-4 bg-[#0b1120] border-t border-slate-800 mt-auto">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate capitalize">
            {user.role_name || user.role_slug || 'User'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;