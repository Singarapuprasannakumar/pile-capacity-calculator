import React from 'react';
import { ENGINEERING_TABLE } from '../../utils/engineeringUtils';
import { FileText, Award, Calendar, Layers, Droplet } from 'lucide-react';

export default function FootingRaftResultsTable({ report }) {
  if (!report) return null;

  const { inputs, correctionFactors: cf, results: res } = report;

  const dateStr = new Date(report.createdAt).toLocaleString();
  const foundationLabel = inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation';

  const Zw2 = parseFloat(inputs.Zw2) || 0;
  const B = parseFloat(inputs.B) || 0;
  const isWithin = Zw2 < B;

  const wtCondition = isWithin
    ? {
        title: "Water table is within depth B below base",
        expression: `Zw₂ = ${Zw2.toFixed(2)} m < B = ${B.toFixed(2)} m`,
        bannerClass: "bg-blue-50 border-blue-200 text-blue-700",
        message: "Water table correction is applicable because the groundwater level lies within the footing influence depth."
      }
    : {
        title: "Water table is deeper than foundation influence zone",
        expression: `Zw₂ = ${Zw2.toFixed(2)} m ≥ B = ${B.toFixed(2)} m`,
        bannerClass: "bg-green-50 border-green-200 text-green-700",
        message: "Groundwater is below the footing influence depth. Full correction factor applies."
      };

  return (
    <div className="space-y-6">
      
      {/* ── Heading Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl text-white shadow-sm gap-2">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300 shrink-0" />
            <span>Calculation Results — Report #{report.reportNumber}</span>
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            Net Safe Bearing Pressure Evaluation
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-50 font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 shrink-0 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left Column: Factor Tables ── */}
        <div className="space-y-6">
          
          {/* Table 1: Input Parameters Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Design Inputs Summary</span>
            </h3>

            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="min-w-full table-auto">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Depth of Foundation (Df)</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.D}</td>
                    <td className="px-4 py-2.5 text-slate-500">m</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Width of Foundation (B)</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.B}</td>
                    <td className="px-4 py-2.5 text-slate-500">m</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Allowable Settlement (S)</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.S}</td>
                    <td className="px-4 py-2.5 text-slate-500">mm</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Corrected SPT Value (N'')</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.N2}</td>
                    <td className="px-4 py-2.5 text-slate-500">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Water Table Depth below base (Zw2)</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.Zw2}</td>
                    <td className="px-4 py-2.5 text-slate-500">m</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Correction Factors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Calculated Correction Factors</span>
            </h3>

            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="min-w-full table-auto">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Factor</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-extrabold text-slate-800 tracking-wider">Cd</td>
                    <td className="px-4 py-3 text-slate-500">Depth correction factor</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 tabular-nums">{cf.Cd.toFixed(3)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-extrabold text-slate-800 tracking-wider">Rw₂</td>
                    <td className="px-4 py-3 text-slate-500">Water table correction factor</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 tabular-nums">{cf.Rw2.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right Column: Final Highlights & Engineering Notes ── */}
        <div className="space-y-6">
          
          {/* Table 3: Final Results */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Foundation Capacities</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              
              {/* Net Safe Bearing Pressure capacity */}
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Net Safe Bearing Pressure (qns)</span>
                  <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
                    {res.netSafeBearingPressure.toFixed(2)} <span className="text-sm font-semibold text-emerald-600">kN/m²</span>
                  </span>
                </div>
                <div className="w-2 h-14 bg-emerald-500 rounded-full shrink-0" />
              </div>

            </div>
          </div>

          {/* Table 4: Engineering Notes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Engineering Notes & Parameters</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Foundation Type</span>
                <span className="font-semibold text-slate-700 block">{foundationLabel}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Calculation Method</span>
                <span className="font-semibold text-slate-700 block">Teng / Peck correlations</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Settlement Criterion</span>
                <span className="font-semibold text-slate-700 block">S = {inputs.S} mm</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">SPT Value</span>
                <span className="font-semibold text-slate-700 block">N'' = {inputs.N2}</span>
              </div>
              <div className="space-y-1.5 col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 block">Water Table Condition</span>
                <p className="text-base font-semibold text-slate-800 leading-snug">{wtCondition.title}</p>
                <p className="text-sm font-mono text-slate-600">({wtCondition.expression})</p>
              </div>
            </div>

            {/* Banner */}
            <div className={`mt-3 rounded-lg border p-3 flex items-start gap-2 ${wtCondition.bannerClass}`}>
              <Droplet className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-medium">{wtCondition.message}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
