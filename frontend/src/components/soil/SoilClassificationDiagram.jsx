import React from 'react';

export default function SoilClassificationDiagram({ fines, gravel, sand, isCoarse }) {
  // Normalize values for visual display
  const total = fines + (isCoarse ? (gravel + sand) : 0);
  const scale = total > 0 ? 100 / total : 0;
  
  const finesHeight = fines * scale;
  const gravelHeight = isCoarse ? gravel * scale : 0;
  const sandHeight = isCoarse ? sand * scale : 0;

  return (
    <div className="h-44 bg-slate-950/70 rounded-xl relative border border-slate-800/80 overflow-hidden flex flex-col items-center justify-between p-3 select-none">
      
      {/* Soil Type Header Banner */}
      <div className="w-full flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification Profile</span>
        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
          isCoarse ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
        }`}>
          {isCoarse ? 'Coarse Soil' : 'Fine Soil'}
        </span>
      </div>

      {/* Visual Phase Stack */}
      <div className="w-full flex items-center gap-4 px-2 my-2 h-24">
        {/* Soil Column (Stacked Bar) */}
        <div className="w-16 h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex flex-col-reverse shadow-inner">
          {isCoarse ? (
            <>
              {finesHeight > 0 && (
                <div 
                  className="bg-orange-500/80 border-t border-orange-400 transition-all flex items-center justify-center text-[8px] font-bold text-slate-100"
                  style={{ height: `${finesHeight}%` }}
                  title={`Fines: ${fines.toFixed(1)}%`}
                >
                  {finesHeight > 15 && 'Fines'}
                </div>
              )}
              {sandHeight > 0 && (
                <div 
                  className="bg-cyan-500/80 border-t border-cyan-400 transition-all flex items-center justify-center text-[8px] font-bold text-slate-100"
                  style={{ height: `${sandHeight}%` }}
                  title={`Sand: ${sand.toFixed(1)}%`}
                >
                  {sandHeight > 15 && 'Sand'}
                </div>
              )}
              {gravelHeight > 0 && (
                <div 
                  className="bg-amber-600/80 transition-all flex items-center justify-center text-[8px] font-bold text-slate-100"
                  style={{ height: `${gravelHeight}%` }}
                  title={`Gravel: ${gravel.toFixed(1)}%`}
                >
                  {gravelHeight > 15 && 'Gravel'}
                </div>
              )}
            </>
          ) : (
            <div 
              className="bg-orange-500/80 h-full flex items-center justify-center text-[9px] font-bold text-slate-100 transition-all"
              title={`Fines: ${fines.toFixed(1)}%`}
            >
              Fines (100%)
            </div>
          )}
        </div>

        {/* Description & Labels */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 text-[10px] text-slate-300">
          {isCoarse ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-600/90 rounded border border-amber-500/30 shrink-0" />
                <span>Gravel: <strong className="font-mono text-amber-400">{gravel.toFixed(1)}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-cyan-500/90 rounded border border-cyan-400/30 shrink-0" />
                <span>Sand: <strong className="font-mono text-cyan-400">{sand.toFixed(1)}%</strong></span>
              </div>
            </>
          ) : (
            <div className="text-slate-400 italic mb-1 text-[9px]">
              Sieve pass fraction is predominant fine silt/clay
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-orange-500/90 rounded border border-orange-400/30 shrink-0" />
            <span>Fines (&lt;75µ): <strong className="font-mono text-orange-400">{fines.toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Standard Info */}
      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
        USCS Sieve Reference (ASTM D2487)
      </span>

    </div>
  );
}
