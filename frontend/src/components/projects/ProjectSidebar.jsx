import React from 'react';
import { 
  Info, MapPin, Database, Layers, Landmark, HardHat, FileSpreadsheet, 
  HelpCircle, Settings, ClipboardList, TrendingUp
} from 'lucide-react';

const ProjectSidebar = ({ activeTab, onTabChange, onLaunchModule }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'site-info', label: 'Site Information', icon: MapPin },
    { id: 'boreholes', label: 'Boreholes', icon: Database },
  ];

  const engineeringModules = [
    { id: 'pile-capacity', label: 'Pile Capacity', icon: TrendingUp, route: '/pile-capacity' },
    { id: 'sbc', label: 'SBC (IS 6403)', icon: Landmark, route: '/sbc' },
    { id: 'footing', label: 'Footing & Raft', icon: Layers, route: '/footing-raft' },
    { id: 'soil-classification', label: 'Soil Classification', icon: FileSpreadsheet, route: '/soil-classification' },
    { id: 'under-reamed', label: 'Under-Reamed Pile', icon: HardHat, route: '/under-reamed-pile' }
  ];

  const utilityItems = [
    { id: 'reports', label: 'Reports Center', icon: ClipboardList },
    { id: 'activities', label: 'Activity Logs', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hidden md:flex flex-col gap-6 sticky top-6">
      {/* Overview Group */}
      <div>
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Project Info</h5>
        <div className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition ${
                  isTabActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Engineering Modules Group */}
      <div>
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Design Suite</h5>
        <div className="space-y-1">
          {engineeringModules.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onLaunchModule(module.route)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span>{module.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Utilities Group */}
      <div>
        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace Logs</h5>
        <div className="space-y-1">
          {utilityItems.map(item => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition ${
                  isTabActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectSidebar;
