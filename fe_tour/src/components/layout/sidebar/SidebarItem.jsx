import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SidebarItem = ({ item, isOpen, isExpanded, onToggle }) => {
  const location = useLocation();
  const { title, path, icon, children } = item;

  const baseLinkClass = 'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-sm font-medium w-full';
  const inactiveClass = 'text-slate-400 hover:text-white hover:bg-slate-800/50';
  const activeClass = 'bg-primary text-white shadow-lg shadow-primary/20';
  const activeParentClass = 'text-blue-400 bg-slate-800/30';
  
  const subLinkClass = 'flex items-center pl-10 pr-3 py-2 text-sm text-slate-400 hover:text-white transition-colors border-l border-slate-800 ml-4 hover:border-slate-600';
  const activeSubLinkClass = 'text-white border-primary font-medium';

  const isActiveParent = children 
    ? children.some(child => location.pathname.startsWith(child.path))
    : false;

  if (children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => onToggle(title)}
          className={`${baseLinkClass} justify-between ${isActiveParent ? activeParentClass : inactiveClass}`}
        >
          <div className="flex items-center">
            <span className={`${isActiveParent ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`}>
              {icon}
            </span>
            <span className="ml-3">{title}</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
        </button>

        {/* Submenu List Animation */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
        >
          {children.map((child, index) => (
            <NavLink
              key={index}
              to={child.path}
              className={({ isActive }) => 
                `${subLinkClass} ${isActive ? activeSubLinkClass : ''}`
              }
            >
              {child.title}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
            {icon}
          </span>
          <span className="ml-3">{title}</span>
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;