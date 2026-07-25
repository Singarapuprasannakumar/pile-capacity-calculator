import React from 'react';

const PI = Math.PI;

const fmt = (v, dec = 3) =>
  typeof v === 'number' && !isNaN(v)
    ? v.toLocaleString('en-IN', { maximumFractionDigits: dec })
    : '—';

const SectionTitle = ({ children }) => (
  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
    {children}
  </h4>
);

const SummaryRow = ({ label, value, bold, green, blue }) => (
  <div
    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg
      ${blue ? 'bg-primary-50' : green ? 'bg-green-50' : 'hover:bg-slate-50'}
      transition-colors`}
  >
    <span className="text-xs text-slate-500">{label}</span>
    <span
      className={`text-xs font-semibold tabular-nums
        ${blue ? 'text-primary-700' : green ? 'text-green-700' : bold ? 'text-slate-900' : 'text-slate-700'}`}
    >
      {value}
    </span>
  </div>
);

const LiveSummaryPanel = ({ diameter, layers, results }) => {
  const d = parseFloat(diameter) || 0;
  const perimeter = d > 0 ? PI * d : null;
  const tipArea = d > 0 ? (PI * d * d) / 4 : null;
  const totalQs =
    results?.layerResults?.reduce((s, lr) => s + lr.shaftResistance, 0) ?? null;

  const soilStyle = {
    clay: {
      dot: 'bg-amber-400',
      badge: 'bg-amber-50 border-amber-200 text-amber-700',
      ldBadge: '',
    },
    sand: {
      dot: 'bg-yellow-400',
      badge: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      ldBadge: '',
    },
    '': {
      dot: 'bg-slate-200',
      badge: 'bg-slate-50 border-slate-200 text-slate-400',
    },
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-primary-700 to-primary-600 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Live Summary</p>
            <p className="text-xs text-primary-200 leading-tight mt-0.5">Updates as you type</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-primary-200">Live</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
        <div>
          <SectionTitle>Pile Geometry</SectionTitle>
          <div className="flex flex-col gap-0.5">
            <SummaryRow label="Diameter" value={d > 0 ? `${d} m` : '—'} />
            <SummaryRow
              label="Perimeter (πD)"
              value={perimeter ? `${perimeter.toFixed(4)} m` : '—'}
            />
            <SummaryRow
              label="Tip Area (πD²/4)"
              value={tipArea ? `${tipArea.toFixed(4)} m²` : '—'}
            />
            <SummaryRow
              label="No. of Layers"
              value={layers.length > 0 ? layers.length : '—'}
            />
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div>
          <SectionTitle>Soil Profile</SectionTitle>
          {layers.length === 0 ? (
            <div className="flex flex-col items-center py-4 text-slate-300">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-xs italic text-slate-400">No layers yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {layers.map((layer, i) => {
                const c = soilStyle[layer.soilType] || soilStyle[''];
                const dn = parseFloat(diameter) || 1;
                const ld = (parseFloat(layer.thickness) || 0) / dn;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${c.badge} transition-all duration-200`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        Layer {i + 1}
                        {layer.soilType ? (
                          <span className="font-semibold">
                            {' '}· {layer.soilType.charAt(0).toUpperCase() + layer.soilType.slice(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400"> · —</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {layer.thickness && (
                        <span className="text-xs text-slate-400">{layer.thickness} m</span>
                      )}
                      {layer.soilType === 'sand' && layer.thickness && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                            ${ld < 15
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'}`}
                        >
                          {ld < 15 ? 'L/D<15' : 'L/D≥15'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {layers.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg bg-purple-50 border border-purple-100">
                  <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-xs text-purple-600 font-medium">
                    Tip in {layers[layers.length - 1]?.soilType
                      ? layers[layers.length - 1].soilType.charAt(0).toUpperCase() + layers[layers.length - 1].soilType.slice(1)
                      : '—'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {results ? (
          <>
            <div className="h-px bg-slate-100" />
            <div>
              <SectionTitle>Calculation Results</SectionTitle>
              <div className="flex flex-col gap-0.5">
                <SummaryRow label="Total Shaft (ΣQs)" value={`${fmt(totalQs)} kN`} blue />
                <SummaryRow label="End Bearing (Qp)" value={`${fmt(results.Qp)} kN`} />
                <div className="h-px bg-slate-100 my-1" />
                <SummaryRow label="Ultimate (Qu)" value={`${fmt(results.Qu)} kN`} bold />
                <SummaryRow label="Allowable (Qa)" value={`${fmt(results.Qa)} kN`} green />
                <p className="text-[10px] text-slate-400 px-2.5 mt-1">Factor of Safety = 2.5</p>
              </div>
            </div>
          </>
        ) : (
          layers.length > 0 && (
            <>
              <div className="h-px bg-slate-100" />
              <div className="flex flex-col items-center py-3 text-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 italic">
                  Click "Calculate Capacity" to see results
                </p>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default React.memo(LiveSummaryPanel);
