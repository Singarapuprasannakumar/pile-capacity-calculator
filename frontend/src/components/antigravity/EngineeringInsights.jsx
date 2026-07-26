import React from 'react';
import { Building2, Droplets, Layers, AlertTriangle } from 'lucide-react';

const defaultInsights = [
  {
    title: 'Foundation Recommendation',
    content: 'No recommendation generated yet. Run calculations to generate AI foundation advice.',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Groundwater Summary',
    content: 'No groundwater observations available. Select a project with borehole data.',
    icon: Droplets,
    color: 'text-cyan-600 bg-cyan-50',
  },
  {
    title: 'Soil Profile Summary',
    content: 'Select a project to generate a summary of soil layers and stratification.',
    icon: Layers,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    title: 'Potential Design Risks',
    content: 'No risk analysis has been performed.',
    icon: AlertTriangle,
    color: 'text-rose-600 bg-rose-50',
  },
];

const EngineeringInsights = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500 text-xs">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Generating engineering insights...
      </div>
    );
  }

  const insights = analysis?.insights?.length ? analysis.insights : defaultInsights;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((ins, idx) => {
        const IconComponent = ins.icon || Building2;
        const colorClass = ins.color || 'text-blue-600 bg-blue-50';

        return (
          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{ins.title}</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-1">{ins.content}</p>
          </div>
        );
      })}
    </div>
  );
};

export default EngineeringInsights;

