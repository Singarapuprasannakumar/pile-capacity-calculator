import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SptSoilCalculator from '../components/foundation/SptSoilCalculator';
import AdhesionFactorCalculator from '../components/foundation/AdhesionFactorCalculator';
import NqCalculator from '../components/foundation/NqCalculator';
import { Layers, Activity, Ruler } from 'lucide-react';

const FoundationTools = () => {
  const { toolId } = useParams();

  const getToolTitleAndIcon = () => {
    switch (toolId) {
      case 'spt-soil-estimator': return { title: "SPT Soil Property Estimator", icon: <Layers className="w-6 h-6 text-slate-700" /> };
      case 'adhesion-factor-calculator': return { title: "Adhesion Factor Calculator", icon: <Activity className="w-6 h-6 text-slate-700" /> };
      case 'nq-calculator': return { title: "Nq Calculator", icon: <Ruler className="w-6 h-6 text-slate-700" /> };
      default: return null;
    }
  };

  const meta = getToolTitleAndIcon();

  if (!meta) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            {meta.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {meta.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Foundation Engineering Suite</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl">
        {toolId === 'spt-soil-estimator' && <SptSoilCalculator />}
        {toolId === 'adhesion-factor-calculator' && <AdhesionFactorCalculator />}
        {toolId === 'nq-calculator' && <NqCalculator />}
      </div>
    </div>
  );
};

export default FoundationTools;
