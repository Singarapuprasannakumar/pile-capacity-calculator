import React from 'react';
import { ENGINEERING_TABLE } from '../../utils/engineeringUtils';
import { FileText, Award, Calendar, Layers } from 'lucide-react';

export default function SBCResultsTable({ report }) {
  if (!report) return null;

  const { inputs, bearingFactors: bf, correctionFactors: cf, results: res } = report;

  const dateStr = new Date(report.createdAt).toLocaleString();
  const footingLabel = inputs.footingType.charAt(0).toUpperCase() + inputs.footingType.slice(1);
  const failureLabel = inputs.failureType.charAt(0).toUpperCase() + inputs.failureType.slice(1);

  // Water table depth text description
  let wtDesc = '';
  if (parseFloat(inputs.wt) <= parseFloat(inputs.D)) {
    wtDesc = 'wt <= D (At/Above footing base level)';
  } else if (parseFloat(inputs.wt) < parseFloat(inputs.D) + parseFloat(inputs.B)) {
    wtDesc = 'D < wt < D + B (Within footing shear zone)';
  } else {
    wtDesc = 'wt >= D + B (Deep groundwater table)';
  }

  return (
    <div className="space-y-6">
      
      {/* ── Heading Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl text-white shadow-sm gap-2">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Calculation Results — Report #{report.reportNumber}</span>
          </h2>
          <p className="text-xs text-blue-200 mt-0.5">
            IS 6403:1981 Shallow Foundation Bearing Capacity Evaluation
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-100 font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 shrink-0 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left Column: Factor Tables ── */}
        <div className="space-y-6">
          
          {/* Table 1: Bearing Capacity Factors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bearing Capacity Factors</span>
            </h3>
            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className={ENGINEERING_TABLE.table}>
                <thead>
                  <tr className={ENGINEERING_TABLE.header}>
                    <th className={ENGINEERING_TABLE.headerCell}>Factor</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Description</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>Nc</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Cohesion Bearing Factor</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800`}>{bf.Nc.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>Nq</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Surcharge Overburden Factor</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800`}>{bf.Nq.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>Nr</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Soil Self-Weight Factor</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800`}>{bf.Nr.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Correction Factors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Correction Factors (Shape, Depth, Water Table)</span>
            </h3>
            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className={ENGINEERING_TABLE.table}>
                <thead>
                  <tr className={ENGINEERING_TABLE.header}>
                    <th className={ENGINEERING_TABLE.headerCell}>Factor</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Description</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>dc</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Depth correction factor for cohesion</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.dc.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>dq</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Depth correction factor for surcharge</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.dq.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>dr</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Depth correction factor for unit weight</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.dr.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>sc</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Shape factor for cohesion (Footing: {footingLabel})</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.sc.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>sq</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Shape factor for surcharge (Footing: {footingLabel})</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.sq.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>sr</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Shape factor for unit weight (Footing: {footingLabel})</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.sr.toFixed(3)}</td>
                  </tr>
                  <tr className={ENGINEERING_TABLE.row}>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-semibold text-slate-700`}>Rw₂</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} text-left text-xs text-slate-500`}>Groundwater table correction factor</td>
                    <td className={`${ENGINEERING_TABLE.bodyCell} font-bold text-slate-800 text-right`}>{cf.Rw2.toFixed(3)}</td>
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
              
              {/* Net Ultimate capacity */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Ultimate Capacity (qnu)</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                    {res.ultimateBearingCapacity.toFixed(3)} <span className="text-xs font-semibold text-slate-500">kN/m²</span>
                  </span>
                </div>
                <div className="w-1.5 h-12 bg-blue-500 rounded-full shrink-0" />
              </div>

              {/* Safe SBC in kN/sq.m */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Safe Bearing Capacity (qs)</span>
                  <span className="text-xl font-extrabold text-emerald-800 mt-1 block">
                    {res.safeBearingCapacity.toFixed(3)} <span className="text-xs font-semibold text-emerald-600">kN/m²</span>
                  </span>
                </div>
                <div className="w-1.5 h-12 bg-emerald-500 rounded-full shrink-0" />
              </div>

              {/* Safe SBC in t/sq.m */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Safe Bearing Capacity (ton)</span>
                  <span className="text-xl font-extrabold text-indigo-800 mt-1 block">
                    {res.safeBearingCapacityTon.toFixed(3)} <span className="text-xs font-semibold text-indigo-600">t/m²</span>
                  </span>
                </div>
                <div className="w-1.5 h-12 bg-indigo-500 rounded-full shrink-0" />
              </div>

            </div>
          </div>

          {/* Table 4: Engineering Notes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Engineering Notes & Parameters</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Standard Standard</span>
                <span className="font-semibold text-slate-700 block">IS 6403:1981</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Failure Mode</span>
                <span className="font-semibold text-slate-700 block">{failureLabel} Shear</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Footing Shape</span>
                <span className="font-semibold text-slate-700 block">{footingLabel}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Factor of Safety</span>
                <span className="font-semibold text-slate-700 block">FS = {inputs.FS}</span>
              </div>
              <div className="space-y-0.5 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Water Table Condition</span>
                <span className="font-semibold text-slate-700 block truncate" title={wtDesc}>{wtDesc}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
