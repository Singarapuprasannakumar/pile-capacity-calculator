import React from 'react';
import { Database, Layers, CheckCircle2, TrendingUp } from 'lucide-react';

const BoreholeStatistics = ({ boreholes }) => {
  const totalLogs = boreholes.length;
  const totalLayers = boreholes.reduce((sum, b) => sum + (b.layers_count || 0), 0);
  const validatedCount = boreholes.filter(b => b.status === 'Validated' || b.status === 'Approved').length;
  
  // Calculate average depth
  const avgDepth = totalLogs > 0 
    ? (boreholes.reduce((sum, b) => sum + (b.termination_depth || 0), 0) / totalLogs).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Database size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Boreholes</span>
          <span className="text-lg font-black text-gray-800 leading-tight block">{totalLogs}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
          <Layers size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Layers</span>
          <span className="text-lg font-black text-gray-800 leading-tight block">{totalLayers}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Verified Logs</span>
          <span className="text-lg font-black text-gray-800 leading-tight block">{validatedCount}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
          <TrendingUp size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Avg. Depth</span>
          <span className="text-lg font-black text-gray-800 leading-tight block">{avgDepth} m</span>
        </div>
      </div>
    </div>
  );
};

export default BoreholeStatistics;
