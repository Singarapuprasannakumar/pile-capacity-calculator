import React from 'react';
import UnderReamedPileDiagram from './UnderReamedPileDiagram';

export default function UnderReamedPileLiveSummary({ values }) {
  const D = parseFloat(values.D) || 0;
  const Cp = parseFloat(values.Cp) || 0;
  const Ca_dash = parseFloat(values.Ca_dash) || 0;
  const Ca = parseFloat(values.Ca) || 0;
  
  // Computed values for dynamic visualization
  const Du = 2.5 * D;
  const Nc = 9.0;
  const FS = 2.5;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 space-y-6">
      
      {/* Schematic Diagram */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Pile Profile Schematic
        </h3>
        <UnderReamedPileDiagram
          D={D}
          Du={Du}
          Cp={Cp}
          Ca_dash={Ca_dash}
          Ca={Ca}
        />
      </div>

      {/* Inputs Summary */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Parameters Summary
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Trial Pit</span>
            <span className="font-bold text-slate-200">{values.trialPit || '–'}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Stem Diameter (D)</span>
            <span className="font-bold text-slate-200 font-mono">{D > 0 ? `${D.toFixed(3)} m` : '–'}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Under-Ream Dia (Du)</span>
            <span className="font-bold text-slate-200 font-mono">{D > 0 ? `${Du.toFixed(3)} m` : '–'}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Tip Cohesion (Cp)</span>
            <span className="font-bold text-slate-200 font-mono">{Cp.toFixed(1)} kPa</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Bulb Cohesion (Ca')</span>
            <span className="font-bold text-slate-200 font-mono">{Ca_dash.toFixed(1)} kPa</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Stem Cohesion (Ca)</span>
            <span className="font-bold text-slate-200 font-mono">{Ca.toFixed(1)} kPa</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Factor of Safety</span>
            <span className="font-bold text-amber-400 font-mono">{FS.toFixed(1)}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Bearing Factor (Nc)</span>
            <span className="font-bold text-indigo-400 font-mono">{Nc.toFixed(1)}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
