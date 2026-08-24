import React from 'react';

const SptResultsTable = ({ result, onTransferPhi, onTransferCohesion }) => {
  if (!result || !result.data) return null;
  const { data } = result;

  if (data.soilType === 'clay') {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📋 CLAY SOIL ANALYSIS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <span className="font-semibold block">SPT N-value:</span>
              <span>{data.nValue}</span>
            </div>
            <div>
              <span className="font-semibold block">Consistency:</span>
              <span>{data.consistency}</span>
            </div>
            <div>
              <span className="font-semibold block">Unconfined Strength (qu):</span>
              <span>{data.qu} kPa</span>
            </div>
            <div>
              <span className="font-semibold block">Cohesion (c = qu/2):</span>
              <span>{data.cohesion} kPa</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
            data.qu < 50 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{data.qu < 50 ? '⚠️' : '✓'}</span>
            <span className="font-medium">{data.recommendation}</span>
          </div>
        </div>
        
        {onTransferCohesion && (
          <div className="pt-2">
            <button 
              type="button"
              onClick={() => onTransferCohesion(data.cohesion)} 
              className="text-sm px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-md hover:bg-blue-100 transition-colors shadow-sm"
            >
              Use Cohesion in Adhesion Calculator
            </button>
          </div>
        )}
      </div>
    );
  }

  // Sand
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📋 SANDY SOIL ANALYSIS (CONSERVATIVE APPROACH)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
          <div>
            <span className="font-semibold block">SPT N-value:</span>
            <span>{data.nValue}</span>
          </div>
          <div>
            <span className="font-semibold block">Relative Density:</span>
            <span>{data.relativeDensity}</span>
          </div>
        </div>

        <h5 className="text-sm font-bold text-slate-700 mb-2">Friction Angle (φ) Estimates (Multiple Methods):</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left mb-6 border border-slate-200">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2 border-b font-medium">Method</th>
                <th className="px-4 py-2 border-b font-medium">Formula</th>
                <th className="px-4 py-2 border-b font-medium">φ (°)</th>
              </tr>
            </thead>
            <tbody>
              {data.phiEstimates.map((est, idx) => (
                <tr key={idx} className="border-b last:border-none hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{est.method}</td>
                  <td className="px-4 py-2 text-slate-500 font-mono text-xs">{est.formula}</td>
                  <td className="px-4 py-2">{est.phi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50/50 p-4 rounded border border-blue-100 text-sm">
          <h5 className="font-bold text-blue-900 mb-2">📊 SUMMARY:</h5>
          <ul className="space-y-1 text-blue-800">
            <li>• Average φ: <span className="font-semibold">{data.averagePhi}°</span></li>
            <li className="flex items-center gap-2">• <span className="font-medium bg-blue-200 px-1 rounded">Most Conservative φ:</span> <span className="font-bold text-blue-950">{data.conservativePhi}° ⬅️ USE FOR DESIGN</span></li>
            <li>• Range of values: <span className="font-semibold">{data.minPhi}° - {data.maxPhi}°</span></li>
          </ul>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${
          data.conservativePhi < 34 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{data.conservativePhi < 34 ? '⚠️' : '✓'}</span>
          <span className="font-medium">{data.recommendation}</span>
        </div>
      </div>

      {onTransferPhi && (
        <div className="pt-2">
          <button 
            type="button"
            onClick={() => onTransferPhi(data.conservativePhi)} 
            className="text-sm px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-md hover:bg-blue-100 transition-colors shadow-sm"
          >
            Use Conservative φ in Nq Calculator
          </button>
        </div>
      )}
    </div>
  );
};

export default SptResultsTable;
