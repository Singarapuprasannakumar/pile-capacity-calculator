import React from 'react';
import MetricCard from '../common/MetricCard';
import { ShieldCheck, Zap, Activity, Award } from 'lucide-react';

export default function UnderReamedPileResultsTable({ report }) {
  if (!report) return null;
  
  const { inputs, geometry, capacity } = report;

  return (
    <div className="space-y-6">
      
      {/* ── Key Metrics Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ultimate Capacity (Qu)"
          value={`${capacity.Qu.toFixed(2)} kN`}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          label="Allowable Capacity (Qa)"
          value={`${capacity.Qa.toFixed(2)} kN`}
          icon={ShieldCheck}
          color="green"
        />
        <MetricCard
          label="Total Allowable (Qa_total)"
          value={`${capacity.Qa_total.toFixed(2)} kN`}
          icon={Award}
          color="indigo"
        />
        <MetricCard
          label="Capacity Increase"
          value={`${capacity.Qa_increase.toFixed(2)} kN`}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* ── Geometric & Derived Parameters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Derived Geometric Parameters
        </h3>
        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full table-auto text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Parameter Description</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3.5 font-medium">Stem Diameter (D)</td>
                <td className="px-4 py-3.5 text-right font-mono">{parseFloat(inputs.D).toFixed(3)}</td>
                <td className="px-4 py-3.5">m</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Under-Ream Bulb Diameter (Du)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.Du.toFixed(3)}</td>
                <td className="px-4 py-3.5">m</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Tip Area (Ap)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.Ap.toFixed(4)}</td>
                <td className="px-4 py-3.5">m²</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Bulb Area (Aa)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.Aa.toFixed(4)}</td>
                <td className="px-4 py-3.5">m²</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Bulb Height (L1)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.L1.toFixed(3)}</td>
                <td className="px-4 py-3.5">m</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Bulb Surface Area (AB')</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.AB_dash.toFixed(3)}</td>
                <td className="px-4 py-3.5">m²</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Stem Surface Area (As)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.As.toFixed(3)}</td>
                <td className="px-4 py-3.5">m²</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Stem Extension Area (Ase)</td>
                <td className="px-4 py-3.5 text-right font-mono">{geometry.Ase.toFixed(3)}</td>
                <td className="px-4 py-3.5">m²</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Capacity Calculation Breakdown ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Vertical Capacity Calculations (Compression & Uplift)
        </h3>
        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full table-auto text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Parameter Description</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3.5 font-medium">Ultimate Vertical Pile Capacity (Qu)</td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{capacity.Qu.toFixed(2)}</td>
                <td className="px-4 py-3.5">kN</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Allowable Vertical Pile Capacity (Qa)</td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-indigo-600">{capacity.Qa.toFixed(2)}</td>
                <td className="px-4 py-3.5">kN</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Additional Stem Shaft Friction (Fse)</td>
                <td className="px-4 py-3.5 text-right font-mono">{capacity.additionalShaftFriction.toFixed(2)}</td>
                <td className="px-4 py-3.5">kN</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="px-4 py-3.5 font-bold">Total Allowable Vertical Capacity (Qa_total)</td>
                <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-600 text-sm">{capacity.Qa_total.toFixed(2)}</td>
                <td className="px-4 py-3.5 font-bold">kN</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium">Calculated Increase in Safe Capacity (Qa_increase)</td>
                <td className="px-4 py-3.5 text-right font-mono font-semibold text-amber-600">{capacity.Qa_increase.toFixed(2)}</td>
                <td className="px-4 py-3.5">kN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
