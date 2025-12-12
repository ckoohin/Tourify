import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, Globe2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_CONFIG } from '../../components/config/sidebarConfig';
import SidebarItem from './sidebar/SidebarItem';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { hasPermission, getUserRole } = useAuth();
  
  const [expandedItems, setExpandedItems] = useState({});

  const handleToggle = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const currentRole = getUserRole();

  const menuItems = useMemo(() => {
    const filterMenu = (items) => {
      return items.reduce((acc, item) => {
        let validChildren = [];
        if (item.children && item.children.length > 0) {
          validChildren = filterMenu(item.children);
        }
        
        let isRoleSatisfied = true;
        let isPermissionSatisfied = true;

        if (item.allowedRoles && item.allowedRoles.length > 0) {
            if (!item.allowedRoles.includes(currentRole)) {
                isRoleSatisfied = false;
            }
        }

        if (item.permissions && item.permissions.length > 0) {
           if (!hasPermission(item.permissions)) {
             isPermissionSatisfied = false;
           }
        }

        const isVisible = isRoleSatisfied && isPermissionSatisfied;

        if (validChildren.length > 0) {
           
           if (isVisible) {
               acc.push({ ...item, children: validChildren });
           }
        } else if (isVisible) {
           if (!item.children || item.children.length === 0 || item.path) {
              acc.push(item);
           }
        }

        return acc;
      }, []);
    };

    return filterMenu(SIDEBAR_CONFIG);
  }, [currentRole, hasPermission]); 

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 border-r border-slate-800 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-[#0f172a]">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer select-none">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300">
              <Globe2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight group-hover:text-blue-400 transition-colors duration-300">Tourify</h1>
              <span className="text-xs text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-800 uppercase tracking-wider">
                {currentRole !== 'guest' ? currentRole.toUpperCase() : 'GUEST'}
              </span>
            </div>
          </Link>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Menu List */}
        <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.length > 0 ? (
            menuItems.map((item, index) => (
              <SidebarItem
                key={index}
                item={item}
                isExpanded={!!expandedItems[item.label]}
                onToggle={() => handleToggle(item.label)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 px-6 text-center animate-pulse">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <AlertCircle size={24} />
              </div>
              <p className="text-sm">Tài khoản chưa được phân quyền.</p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}