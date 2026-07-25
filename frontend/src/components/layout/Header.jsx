import React from 'react';
import { Menu } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

const Header = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <Breadcrumbs />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm border border-blue-200 group-hover:bg-blue-200 transition-colors">
            PE
          </div>
          <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors hidden sm:block">
            Professional Engineer
          </span>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
