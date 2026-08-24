import React from 'react';
import { AlertCircle } from 'lucide-react';

const NqResults = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-4">
        <h2 className="text-lg font-bold text-slate-800">RESULTS</h2>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📊 Input:</h4>
        <div className="mb-6 text-sm text-slate-600">
          <span className="font-semibold">Angle of internal friction (φ'):</span> {result.phi}°
        </div>

        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📈 Calculated Nq Value:</h4>
        
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center mb-4">
          <p className="text-sm text-blue-800 font-medium mb-1">DESIGN Nq VALUE</p>
          <p className="text-4xl font-black text-blue-950">{result.nq.toFixed(4)}</p>
          <p className="text-xs text-blue-700 mt-2 font-mono">(dimensionless)</p>
        </div>
        
        {Math.abs(result.nq - result.nqLog) > 0.1 && (
          <div className="text-xs text-slate-500 bg-white p-3 rounded border text-center">
            <span className="font-semibold block mb-1">💡 Note on Log Interpolation:</span>
            Log interpolation gives Nq = {result.nqLog.toFixed(4)} <br/>
            (Difference: {result.difference.toFixed(4)})
          </div>
        )}
      </div>

      {result.outOfRange && (
        <div className="p-4 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold flex">Warning</span>
              <span>{result.warningMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NqResults;
