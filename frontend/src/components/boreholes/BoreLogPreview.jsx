import React from 'react';
import { Droplet } from 'lucide-react';

const BoreLogPreview = ({ layers, groundwaterDepth, groundLevel = 0.0 }) => {
  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed border-gray-150 text-gray-400 font-bold uppercase tracking-wider rounded-2xl">
        No layers defined to preview profile.
      </div>
    );
  }

  // Calculate height scale (pixels per meter)
  const scale = 30; // 30px per meter
  const minLayerHeight = 50; // minimum height in pixels to ensure thin layers are readable

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Visual Strata Profile Log</h4>
      
      {/* Visual profile container */}
      <div className="relative flex gap-6 mt-4 select-none max-w-xl mx-auto p-4 border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Scale/Depth Ruler */}
        <div className="w-16 flex flex-col justify-between text-right text-[10px] font-black text-gray-400 border-r border-gray-100 pr-3 font-mono">
          <div className="h-0 block">GL: {groundLevel.toFixed(1)}m</div>
          {layers.map((l, index) => {
            const height = Math.max((l.to_depth - l.from_depth) * scale, minLayerHeight);
            return (
              <React.Fragment key={l.uuid}>
                <div style={{ height: `${height}px` }} className="flex flex-col justify-end relative">
                  {/* Top tick label */}
                  {index === 0 && (
                    <span className="absolute -top-2 right-3 font-black text-blue-600 block">
                      0.00 m
                    </span>
                  )}
                  {/* Bottom tick label */}
                  <span className="absolute -bottom-2 right-3 block">
                    {l.to_depth.toFixed(2)} m
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Strata Log Columns */}
        <div className="flex-1 relative space-y-1">
          {/* Groundwater level line indicator overlay */}
          {groundwaterDepth !== null && groundwaterDepth !== undefined && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-blue-500 z-10 flex items-center gap-1 bg-transparent"
              style={{
                top: `${groundwaterDepth * scale}px`
              }}
            >
              <span className="bg-blue-500 text-white rounded px-1.5 py-0.5 text-[8px] font-black uppercase flex items-center gap-0.5 shadow-sm transform -translate-y-1/2">
                <Droplet size={8} className="fill-white" />
                GWT: {groundwaterDepth.toFixed(2)}m
              </span>
            </div>
          )}

          {/* Strata Layers list */}
          {layers.map(l => {
            const height = Math.max((l.to_depth - l.from_depth) * scale, minLayerHeight);
            return (
              <div
                key={l.uuid}
                style={{
                  height: `${height}px`,
                  backgroundColor: l.color,
                  borderLeft: `5px solid rgba(0,0,0,0.15)`
                }}
                className="rounded-r-xl p-3 flex flex-col justify-between border-t border-b border-black/5 hover:brightness-95 transition-all text-white shadow-sm overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between flex-wrap gap-1 leading-none">
                    <span className="font-extrabold uppercase text-xs tracking-wider drop-shadow-md">
                      {l.soil_type}
                    </span>
                    <div className="flex gap-1">
                      {l.uscs_classification && (
                        <span className="px-1 py-0.5 bg-black/20 text-white text-[8px] font-black rounded uppercase">
                          {l.uscs_classification}
                        </span>
                      )}
                      {l.is_1498_classification && (
                        <span className="px-1 py-0.5 bg-white/20 text-white text-[8px] font-black rounded uppercase">
                          {l.is_1498_classification}
                        </span>
                      )}
                    </div>
                  </div>
                  {l.description && (
                    <p className="text-[10px] opacity-90 mt-1 line-clamp-2 leading-tight drop-shadow-sm font-medium italic">
                      {l.description}
                    </p>
                  )}
                </div>

                {/* Properties list snippet */}
                <div className="flex items-center justify-between text-[9px] font-mono opacity-85 leading-none mt-2 border-t border-white/10 pt-1.5">
                  <span>Thk: {(l.to_depth - l.from_depth).toFixed(2)}m</span>
                  {l.unit_weight && <span>γ: {l.unit_weight}</span>}
                  {l.cohesion && <span>c: {l.cohesion}</span>}
                  {l.friction_angle && <span>φ: {l.friction_angle}°</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BoreLogPreview;
