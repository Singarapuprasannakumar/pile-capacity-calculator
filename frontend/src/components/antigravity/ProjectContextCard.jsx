import React from 'react';
import { FolderOpen, MapPin, Layers, Droplets, Calculator, Clock } from 'lucide-react';

const ProjectContextCard = ({ project }) => {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
          <FolderOpen className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">No project selected</h4>
        <p className="text-xs text-slate-500 max-w-md">
          Choose a project to load its boreholes, calculations, and engineering data into the AI assistant context.
        </p>
      </div>
    );
  }

  const {
    name,
    location,
    boreholes_count,
    soil_layers_count,
    groundwater_depth,
    calculations_completed,
    last_activity,
  } = project;

  const metadata = [
    { label: 'Project Name', value: name, icon: FolderOpen },
    { label: 'Location', value: location, icon: MapPin },
    { label: 'Boreholes', value: boreholes_count ?? 0, icon: Layers },
    { label: 'Soil Layers', value: soil_layers_count ?? 0, icon: Layers },
    { label: 'Groundwater Depth', value: groundwater_depth ? `${groundwater_depth} m` : 'N/A', icon: Droplets },
    { label: 'Calculations Completed', value: calculations_completed ?? 0, icon: Calculator },
    { label: 'Last Activity', value: last_activity || 'Recently', icon: Clock },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {metadata.map((item, idx) => (
        <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center space-x-3">
          <div className="p-2 rounded-md bg-white text-blue-600 shadow-2xs border border-slate-100">
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.value || '—'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectContextCard;

