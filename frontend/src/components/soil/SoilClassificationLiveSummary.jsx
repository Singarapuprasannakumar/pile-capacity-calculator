import React from 'react';
import SoilClassificationDiagram from './SoilClassificationDiagram';

export default function SoilClassificationLiveSummary({ values }) {
  const fines = parseFloat(values.fines) || 0;
  const gravel = parseFloat(values.gravel) || 0;
  const sand = Math.max(0, 100 - fines - gravel);

  const isCoarse = fines < 50;
  const showGravel = isCoarse;
  const showCuCc = isCoarse && (fines >= 5 && fines <= 12);
  const showWlWp = fines >= 50 || (isCoarse && fines >= 5);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 space-y-6">
      
      {/* Schematic Diagram */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Soil Phase Visualization
        </h3>
        <SoilClassificationDiagram
          fines={fines}
          gravel={gravel}
          sand={sand}
          isCoarse={isCoarse}
        />
      </div>

      {/* Inputs Summary */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Parameters Summary
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Soil Category</span>
            <span className="font-bold text-slate-200">{isCoarse ? 'Coarse-Grained' : 'Fine-Grained'}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Fines (%)</span>
            <span className="font-bold text-slate-200 font-mono">{fines.toFixed(1)}%</span>
          </div>

          {showGravel && (
            <>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Gravel (%)</span>
                <span className="font-bold text-slate-200 font-mono">{gravel.toFixed(1)}%</span>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Sand (%)</span>
                <span className="font-bold text-slate-200 font-mono">{sand.toFixed(1)}%</span>
              </div>
            </>
          )}

          {showCuCc && (
            <>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Cu Value</span>
                <span className="font-bold text-slate-200 font-mono">{values.cu || '–'}</span>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Cc Value</span>
                <span className="font-bold text-slate-200 font-mono">{values.cc || '–'}</span>
              </div>
            </>
          )}

          {showWlWp && (
            <>
              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Liquid Limit (WL)</span>
                <span className="font-bold text-slate-200 font-mono">{values.wl ? `${values.wl}%` : '–'}</span>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Plastic Limit (WP)</span>
                <span className="font-bold text-slate-200 font-mono">{values.wp ? `${values.wp}%` : '–'}</span>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}
