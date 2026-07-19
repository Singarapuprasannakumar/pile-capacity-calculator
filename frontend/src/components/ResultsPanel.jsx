import React from 'react';

const fmt = (v) =>
  typeof v === 'number' ? v.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : v;

/**
 * SummaryStrip Component
 * Displays: Clay ΣQs + Sand ΣQs = Total ΣQs in a premium engineering layout.
 */
export const SummaryStrip = ({ layerResults = [] }) => {
  const totalQs = layerResults.reduce((s, lr) => s + (lr.shaftResistance ?? 0), 0);
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-around gap-4 shadow-sm">
      {/* Clay ΣQs */}
      <div className="text-center flex-1">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Clay ΣQs</p>
        <p className="text-2xl font-black text-amber-800">{fmt(totalClaySF)} <span className="text-xs font-medium text-amber-600">kN</span></p>
      </div>

      {/* Operator + */}
      <div className="text-slate-400 font-light text-2xl select-none">+</div>

      {/* Sand ΣQs */}
      <div className="text-center flex-1">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Sand ΣQs</p>
        <p className="text-2xl font-black text-orange-800">{fmt(totalSandSF)} <span className="text-xs font-medium text-orange-600">kN</span></p>
      </div>

      {/* Operator = */}
      <div className="text-slate-400 font-light text-2xl select-none">=</div>

      {/* Total ΣQs */}
      <div className="text-center flex-1 bg-white border border-primary-100 rounded-lg p-2.5 shadow-sm">
        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Total ΣQs (Shaft)</p>
        <p className="text-2xl font-black text-primary-800">{fmt(totalQs)} <span className="text-xs font-medium text-primary-600">kN</span></p>
      </div>
    </div>
  );
};

/**
 * CapacityCards Component
 * Displays Qp (End Bearing), Qu (Ultimate Capacity), and Qa (Allowable Capacity).
 */
export const CapacityCards = ({ Qp = 0, Qu = 0, Qa = 0 }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* End Bearing Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Bearing</p>
            <p className="text-xs text-slate-400 mb-3">Qp (kN)</p>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">
            {fmt(Qp)}
          </p>
        </div>

        {/* Ultimate Capacity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md text-center flex flex-col justify-between text-white">
          <div>
            <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Ultimate Capacity</p>
            <p className="text-xs text-slate-400 mb-3">Qu (kN)</p>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">
            {fmt(Qu)}
          </p>
        </div>

        {/* Allowable Capacity Card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Allowable Capacity</p>
            <p className="text-xs text-green-500 mb-3">Qa (kN)</p>
          </div>
          <p className="text-3xl font-black text-green-800 tracking-tight">
            {fmt(Qa)}
          </p>
        </div>
      </div>

      {/* Formula note below the cards */}
      <p className="text-xs text-slate-400 text-center mt-2 select-none">
        Qu = ΣQs + Qp &nbsp;·&nbsp; Qa = Qu / FOS &nbsp;·&nbsp; Results are for design reference only.
      </p>
    </div>
  );
};
