import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationItem = ({ to, icon: Icon, title, status, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center space-x-3 overflow-hidden">
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'
              }`}
            />
            <span className="truncate">{title}</span>
          </div>
          {status === 'coming-soon' && (
            <span
              className={`text-[9px] shrink-0 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase border transition-colors ${
                isActive 
                  ? 'bg-blue-700 text-blue-200 border-blue-500' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-600'
              }`}
            >
              Soon
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default React.memo(NavigationItem);
