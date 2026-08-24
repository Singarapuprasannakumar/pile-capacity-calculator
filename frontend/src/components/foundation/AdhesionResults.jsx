import React from 'react';
import { AlertCircle } from 'lucide-react';

const AdhesionResults = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-4">
        <h2 className="text-lg font-bold text-slate-800">RESULTS</h2>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📊 Input:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
          <div>
            <span className="font-semibold block">Cohesion (c):</span>
            <span>{result.inputs?.cohesion} kPa</span>
          </div>
          <div>
            <span className="font-semibold block">Pile type:</span>
            <span className="capitalize">{result.inputs?.pile_material === 'all' ? 'All pilings (average)' : 'Concrete pilings'}</span>
          </div>
        </div>

        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📈 Calculated Adhesion Factor:</h4>
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center mb-6">
          <p className="text-sm text-blue-800 font-medium mb-1">ADHESION FACTOR α</p>
          <p className="text-4xl font-black text-blue-950">{(result.adhesion_factor || 0).toFixed(4)}</p>
          <p className="text-xs text-blue-700 mt-2 font-mono">(dimensionless)</p>
        </div>
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

export default AdhesionResults;
