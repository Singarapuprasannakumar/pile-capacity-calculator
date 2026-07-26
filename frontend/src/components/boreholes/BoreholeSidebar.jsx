import React from 'react';
import { Info, Layers, Eye, ShieldAlert, BarChart4, Compass, Droplet } from 'lucide-react';

const BoreholeSidebar = ({ activeTab, onTabChange, warningsCount = 0 }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'layers', label: 'Soil Layers', icon: Layers },
    { id: 'spt', label: 'SPT Records', icon: BarChart4 },
    { id: 'groundwater', label: 'Groundwater Logs', icon: Droplet },
    { id: 'preview', label: 'Visual Profile', icon: Eye }
  ];

  return (
    <div className="w-full md:w-60 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 block mb-1">Investigation Details</span>
      <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition whitespace-nowrap md:w-full ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              {t.id === 'layers' && warningsCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] font-black rounded-full block">
                  {warningsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BoreholeSidebar;
