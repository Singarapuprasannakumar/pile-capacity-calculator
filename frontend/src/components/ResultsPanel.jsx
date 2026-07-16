/**
 * Results panel – displays per-layer shaft resistance cards + summary card.
 * Props:
 *  - results : { layerResults: [], Qp: number, Qu: number, Qa: number }
 */
const ResultsPanel = ({ results }) => {
  const { layerResults = [], Qp = 0, Qu = 0, Qa = 0 } = results;

  const fmt = (v) =>
    typeof v === 'number' ? v.toLocaleString('en-IN', { maximumFractionDigits: 3 }) : v;

  const totalQs = layerResults.reduce((s, lr) => s + (lr.shaftResistance ?? 0), 0);
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  const soilColors = {
    clay: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      icon: '🏔',
    },
    sand: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: '🏜',
    },
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded bg-primary-500" />
        <h2 className="text-lg font-bold text-slate-800">Calculation Results</h2>
      </div>

      {/* Layer Results */}
      {layerResults.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Shaft Resistance — Per Layer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {layerResults.map((lr, i) => {
              const c = soilColors[lr.soilType] || soilColors.sand;
              return (
                <div
                  key={i}
                  className={`result-card ${c.bg} ${c.border} border`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Layer {lr.layer ?? (i + 1)}
                    </span>
                    <span className={`badge ${c.badge}`}>
                      {c.icon} {lr.soilType || '—'}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800 mb-1">
                    {fmt(lr.shaftResistance)}{' '}
                    <span className="text-sm font-normal text-slate-500">kN</span>
                  </div>
                  <p className="text-xs text-slate-500">Shaft Resistance (Qs)</p>
                  {/* Split friction sub-line */}
                  {lr.soilType === 'clay' && lr.skinFrictionClay !== undefined && (
                    <p className="text-xs text-amber-600 mt-1.5 font-medium">
                      Clay Skin Friction: {fmt(lr.skinFrictionClay)} kN
                    </p>
                  )}
                  {lr.soilType === 'sand' && lr.skinFrictionSand !== undefined && (
                    <p className="text-xs text-yellow-600 mt-1.5 font-medium">
                      Sand Skin Friction: {fmt(lr.skinFrictionSand)} kN
                    </p>
                  )}
                  {lr.thickness !== undefined && (
                    <p className="text-xs text-slate-400 mt-1">Thickness: {lr.thickness} m</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Summary
        </h3>

        {/* ΣQs breakdown chip row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-semibold text-amber-600">Clay ΣQs</span>
            <span className="text-sm font-extrabold text-amber-800 tabular-nums">{fmt(totalClaySF)} kN</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
            <span className="text-lg font-light">+</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
            <span className="text-xs font-semibold text-yellow-600">Sand ΣQs</span>
            <span className="text-sm font-extrabold text-yellow-800 tabular-nums">{fmt(totalSandSF)} kN</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
            <span className="text-lg font-light">=</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
            <span className="text-xs font-semibold text-primary-600">Total ΣQs</span>
            <span className="text-sm font-extrabold text-primary-800 tabular-nums">{fmt(totalQs)} kN</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* End Bearing */}
          <div className="result-card bg-primary-50 border border-primary-200 text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
              End Bearing
            </p>
            <p className="text-2xl font-extrabold text-primary-800">
              {fmt(Qp)}
            </p>
            <p className="text-xs text-primary-500 mt-1">Qp (kN)</p>
          </div>

          {/* Ultimate Capacity */}
          <div className="result-card bg-slate-800 border border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Ultimate Capacity
            </p>
            <p className="text-2xl font-extrabold text-white">
              {fmt(Qu)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Qu (kN)</p>
          </div>

          {/* Allowable Capacity */}
          <div className="result-card bg-green-50 border border-green-200 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
              Allowable Capacity
            </p>
            <p className="text-2xl font-extrabold text-green-800">
              {fmt(Qa)}
            </p>
            <p className="text-xs text-green-500 mt-1">Qa (kN)</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 text-center">
        Qu = Σ Qs + Qp &nbsp;|&nbsp; Qa = Qu / FOS &nbsp;|&nbsp; Results are for design reference only.
      </p>
    </div>
  );
};

export default ResultsPanel;
