import React from 'react';
import { X, HardHat } from 'lucide-react';
import NavigationItem from './NavigationItem';
import { ENGINEERING_MODULES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const categories = ['Main', 'Foundation Engineering', 'Geotechnical Engineering', 'Project Management'];

  const getModulesByCategory = (cat) => {
    return ENGINEERING_MODULES.filter(m => m.category === cat);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-100 shadow-xl border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <HardHat className="w-6 h-6 text-blue-500 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white leading-tight">Engineering Suite</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">Foundation & Geotech Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden focus:outline-none"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3.5 py-6 overflow-y-auto space-y-6 scrollbar-thin">
          {categories.map((category) => {
            const modules = getModulesByCategory(category);
            if (modules.length === 0) return null;

            return (
              <div key={category} className="space-y-1.5">
                {category !== 'Main' && (
                  <h4 className="px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {category}
                  </h4>
                )}
                <div className="space-y-1">
                  {modules.map((module) => (
                    <NavigationItem
                      key={module.id}
                      to={module.route}
                      icon={module.icon}
                      title={module.title}
                      status={module.status}
                      onClick={onClose}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
