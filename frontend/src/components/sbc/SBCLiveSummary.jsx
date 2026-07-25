import React from 'react';
import { Layers3, Droplet, ShieldAlert, FileText, Ruler, Compass } from 'lucide-react';

export default function SBCLiveSummary({ values }) {
  const footingTypeLabel = values.footingType.charAt(0).toUpperCase() + values.footingType.slice(1);
  const failureTypeLabel = values.failureType.charAt(0).toUpperCase() + values.failureType.slice(1);

  const D = parseFloat(values.D) || 0;
  const B = parseFloat(values.B) || 0;
  const L = parseFloat(values.L) || 0;
  const wt = parseFloat(values.wt) || 0;

  // Visual schematic calculations
  const showL = values.footingType === 'rectangular';
  const wtStatus = wt <= D ? 'At/Above base of footing' : wt < D + B ? 'Within depth B below footing' : 'Deep (No correction)';

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 space-y-6">
      
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Footing Profile & Schematic
        </h3>
        
        {/* Footing Schematic Diagram */}
        <div className="h-44 bg-slate-950/70 rounded-xl relative border border-slate-800/80 overflow-hidden flex items-center justify-center">
          
          {/* Ground Line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-green-800/80 border-t border-dashed border-green-500/50">
            <span className="absolute -top-3.5 left-3 text-[9px] font-bold text-green-500 tracking-wider">GL</span>
          </div>

          {/* Water Table Indicator */}
          {wt > 0 && (
            <div 
              className="absolute left-0 right-0 h-0.5 bg-blue-500/50 border-t border-dashed border-blue-400/80 transition-all"
              style={{
                top: `${Math.min(10 + (wt * 20), 160)}px`
              }}
            >
              <span className="absolute -top-3.5 right-3 text-[9px] font-bold text-blue-400 tracking-wider flex items-center gap-0.5">
                <Droplet className="w-2.5 h-2.5 fill-current shrink-0" />
                GWT ({wt}m)
              </span>
            </div>
          )}

          {/* Footing Column */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-6 h-12 bg-slate-700/80 border-x border-slate-600 flex items-center justify-center">
            <span className="text-[8px] text-slate-400 select-none">Col</span>
          </div>

          {/* Footing Base */}
          <div 
            className="absolute bg-slate-600 border border-slate-500 rounded flex flex-col items-center justify-center transition-all shadow-md"
            style={{
              top: '58px',
              width: `${Math.max(40, Math.min(B * 25, 140))}px`,
              height: '24px'
            }}
          >
            <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wide">
              {values.footingType}
            </span>
            <span className="text-[8px] text-slate-300 font-medium">
              B={B}m {showL && `x L=${L}m`}
            </span>
          </div>

          {/* Depth dimension lines */}
          <div className="absolute top-10 left-[15%] bottom-1/2 w-0.5 bg-slate-700 flex items-center justify-center">
            <span className="absolute bg-slate-950 px-1 text-[8px] font-semibold text-slate-400">
              D={D}m
            </span>
          </div>

        </div>
      </div>

      {/* Parameter Recap List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Design Parameters Recap
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Trial Pit</p>
              <p className="font-bold text-slate-200 truncate">{values.trialPit || '—'}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-start gap-2">
            <Layers3 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Footing Type</p>
              <p className="font-bold text-slate-200">{footingTypeLabel}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Failure Criteria</p>
              <p className="font-bold text-slate-200">{failureTypeLabel}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-start gap-2">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Inclination α</p>
              <p className="font-bold text-slate-200">{values.alpha}°</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 col-span-2 flex items-start gap-2">
            <Droplet className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Water Table Correction</p>
              <p className="font-bold text-slate-200 text-xs leading-normal">{wtStatus}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
