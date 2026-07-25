import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ENGINEERING_MODULES } from '../../utils/constants';

const Breadcrumbs = () => {
  const location = useLocation();
  const path = location.pathname;

  const currentModule = ENGINEERING_MODULES.find(m => m.route === path);
  if (!currentModule) return null;

  return (
    <nav className="flex items-center text-xs text-slate-500 space-x-1.5 font-medium" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-blue-600 transition-colors">Suite</Link>
      {currentModule.id !== 'dashboard' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">{currentModule.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-semibold">{currentModule.title}</span>
        </>
      )}
      {currentModule.id === 'dashboard' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-semibold">Dashboard</span>
        </>
      )}
    </nav>
  );
};

export default React.memo(Breadcrumbs);
