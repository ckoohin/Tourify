import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Circle } from 'lucide-react';

const SidebarItem = ({ item, isExpanded, onToggle }) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const baseClass = "flex items-center justify-between px-4 py-3 mx-2 mb-1 rounded-xl cursor-pointer transition-all duration-200 select-none group border border-transparent";
  
  const activeParentClass = "bg-slate-800/80 text-white font-medium border-slate-700/50 shadow-sm";
  
  const inactiveParentClass = "text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700/50 hover:shadow-sm hover:translate-x-1";

  const isChildActive = hasChildren && item.children.some(child => 
    location.pathname === child.path
  );

  if (hasChildren) {
    return (
      <div className="mb-1">
        <div
          onClick={onToggle}
          className={`${baseClass} ${isExpanded || isChildActive ? activeParentClass : inactiveParentClass}`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={20} className={`transition-colors duration-200 ${isExpanded || isChildActive ? "text-blue-500" : "text-slate-500 group-hover:text-blue-400"}`} />
            <span className="text-[15px]">{item.label}</span>
          </div>
          <div className="text-slate-500 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-4 pl-4 border-l border-slate-700/50 space-y-1">
            {item.children.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/30 translate-x-1'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:translate-x-1'
                  }`
                }
              >
                <Circle 
                  size={6} 
                  className={`transition-colors duration-200 ${location.pathname === child.path ? "fill-white text-white" : "fill-slate-600 text-slate-600 group-hover:fill-slate-400"}`} 
                />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `${baseClass} ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-medium' 
            : inactiveParentClass
        }`
      }
    >
      <div className="flex items-center gap-3">
        <item.icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
        <span className="text-[15px]">{item.label}</span>
      </div>
    </NavLink>
  );
};

export default SidebarItem;