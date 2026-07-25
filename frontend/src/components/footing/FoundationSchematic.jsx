import React from 'react';
import { Droplet } from 'lucide-react';

export default function FoundationSchematic({ foundationType, D, B, Zw2 }) {
  const isIsolated = foundationType === 'isolated';

  // Zw2 is depth below foundation base. Depth from ground level = D + Zw2.
  const wtDepth = D + Zw2;

  // Let's compute scale/positions (restricted to container boundaries)
  // GL is at top-10 (40px)
  const glOffset = 40;
  // D base offset
  const baseOffset = glOffset + Math.min(D * 20, 80);
  const foundationWidth = Math.max(isIsolated ? 50 : 150, Math.min(B * 25, 200));

  return (
    <div className="h-44 bg-slate-950/70 rounded-xl relative border border-slate-800/80 overflow-hidden flex items-center justify-center select-none">
      
      {/* Ground Line */}
      <div className="absolute top-10 left-0 right-0 h-0.5 bg-green-800/80 border-t border-dashed border-green-500/50">
        <span className="absolute -top-3.5 left-3 text-[9px] font-bold text-green-500 tracking-wider">GL</span>
      </div>

      {/* Water Table Indicator */}
      {Zw2 >= 0 && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-blue-500/50 border-t border-dashed border-blue-400/80 transition-all"
          style={{
            top: `${Math.min(baseOffset + (Zw2 * 20), 160)}px`
          }}
        >
          <span className="absolute -top-3.5 right-3 text-[9px] font-bold text-blue-400 tracking-wider flex items-center gap-0.5">
            <Droplet className="w-2.5 h-2.5 fill-current shrink-0" />
            GWT ({wtDepth.toFixed(2)}m)
          </span>
        </div>
      )}

      {/* Columns / Stems */}
      {isIsolated ? (
        // Single central column for isolated footing
        <div 
          className="absolute bg-slate-700/80 border-x border-slate-600 flex items-center justify-center transition-all"
          style={{
            top: '40px',
            height: `${baseOffset - glOffset}px`,
            width: '16px',
            left: 'calc(50% - 8px)'
          }}
        >
          <span className="text-[7px] text-slate-400 select-none">Col</span>
        </div>
      ) : (
        // Multiple columns for raft foundation
        <>
          <div 
            className="absolute bg-slate-700/80 border-x border-slate-600 transition-all"
            style={{
              top: '40px',
              height: `${baseOffset - glOffset}px`,
              width: '12px',
              left: '30%'
            }}
          />
          <div 
            className="absolute bg-slate-700/80 border-x border-slate-600 transition-all"
            style={{
              top: '40px',
              height: `${baseOffset - glOffset}px`,
              width: '12px',
              left: 'calc(50% - 6px)'
            }}
          />
          <div 
            className="absolute bg-slate-700/80 border-x border-slate-600 transition-all"
            style={{
              top: '40px',
              height: `${baseOffset - glOffset}px`,
              width: '12px',
              left: '65%'
            }}
          />
        </>
      )}

      {/* Foundation Slab Base */}
      <div 
        className="absolute bg-slate-600 border border-slate-500 rounded flex flex-col items-center justify-center transition-all shadow-md"
        style={{
          top: `${baseOffset}px`,
          width: `${foundationWidth}px`,
          height: isIsolated ? '20px' : '15px'
        }}
      >
        <span className="text-[9px] font-bold text-slate-300">
          {isIsolated ? `Footing (B=${B}m)` : `Raft (B=${B}m)`}
        </span>
      </div>

      {/* Depth D Dimension Line (left side) */}
      <div 
        className="absolute left-10 border-l border-dashed border-slate-500/50 flex flex-col justify-between items-center text-[8px] text-slate-400"
        style={{
          top: '40px',
          height: `${baseOffset - glOffset}px`
        }}
      >
        <div className="w-2 border-t border-slate-500/50" />
        <span className="font-bold bg-slate-950/80 px-1 rounded select-none">Df = {D}m</span>
        <div className="w-2 border-b border-slate-500/50" />
      </div>

    </div>
  );
}
