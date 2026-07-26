import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Layers, Globe, Building2, ChevronRight } from 'lucide-react';

const actions = [
  {
    label: 'Run SBC',
    description: 'Perform IS 6403 Safe Bearing Capacity calculations.',
    icon: Globe,
    route: '/sbc',
  },
  {
    label: 'Open Boreholes',
    description: 'Review borehole data and soil layers.',
    icon: Layers,
    route: '/soil-classification',
  },
  {
    label: 'Open Soil Classification',
    description: 'Review and classify soil samples.',
    icon: Layers,
    route: '/soil-classification',
  },
  {
    label: 'Run Pile Capacity',
    description: 'Compute shaft resistance and end bearing capacity.',
    icon: HardHat,
    route: '/pile-capacity',
  },
  {
    label: 'Open Under-Reamed Pile',
    description: 'Analyze under-reamed pile capacity in expansive soils.',
    icon: Building2,
    route: '/under-reamed-pile',
  },
];

const SuggestedActions = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          to={action.route}
          className="flex flex-col p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <action.icon className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {action.label}
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {action.description}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default SuggestedActions;

