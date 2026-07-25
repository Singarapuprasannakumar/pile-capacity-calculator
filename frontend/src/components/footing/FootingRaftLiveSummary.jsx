import React from 'react';
import { Layers3, Settings, HelpCircle, HardHat } from 'lucide-react';
import FoundationSchematic from './FoundationSchematic';

export default function FootingRaftLiveSummary({ values }) {
  const foundationTypeLabel = values.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation';
  const D = parseFloat(values.D) || 0;
  const B = parseFloat(values.B) || 0;
  const S = parseFloat(values.S) || 0;
  const N2 = parseFloat(values.N2) || 0;
  const Zw2 = parseFloat(values.Zw2) || 0;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 space-y-6">
      
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Foundation Profile & Schematic
        </h3>
        
        <FoundationSchematic
          foundationType={values.foundationType}
          D={D}
          B={B}
          Zw2={Zw2}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Parameters Summary
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Type</span>
            <span className="font-bold text-slate-200">{foundationTypeLabel}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Depth Df</span>
            <span className="font-bold text-slate-200">{D} m</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Width B</span>
            <span className="font-bold text-slate-200">{B} m</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Allowable Settlement</span>
            <span className="font-bold text-slate-200">{S} mm</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Corrected N''</span>
            <span className="font-bold text-slate-200">{N2}</span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">Water Table Zw2</span>
            <span className="font-bold text-slate-200">{Zw2} m</span>
          </div>

        </div>
      </div>

    </div>
  );
}
