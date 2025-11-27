import React from 'react';

const InputField = ({ icon: Icon, className, ...props }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input 
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
      />
    </div>
  );
};

export default InputField;