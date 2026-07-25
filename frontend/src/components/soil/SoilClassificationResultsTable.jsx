import React from 'react';
import { FileText, Award, Calendar, Layers, CheckCircle } from 'lucide-react';
import SoilClassificationExportButtons from './SoilClassificationExportButtons';

export default function SoilClassificationResultsTable({ report }) {
  if (!report) return null;

  const { inputs, soilType, groupSymbol, engineeringProperties: props, notes } = report;

  const dateStr = new Date(report.createdAt).toLocaleString();

  // Helper to format key names
  const propertyLabels = {
    "Permeability_when_Compacted": {
      name: "Permeability when Compacted",
      desc: "Hydraulic conductivity/drainage behavior of the soil after mechanical compaction."
    },
    "Shearing_Strength_when_Compacted_and_Saturated": {
      name: "Shearing Strength (Saturated)",
      desc: "Resistance of the compacted soil to shear failure under critical saturated conditions."
    },
    "Compressibility_when_Compacted_and_Saturated": {
      name: "Compressibility (Saturated)",
      desc: "Susceptibility of the soil to volume reduction under loading when saturated."
    },
    "Workability_as_Construction_Matterial": {
      name: "Workability",
      desc: "Ease of handling, spreading, and compacting the soil as construction fill."
    },
    "Rolled_Earth_Dams_Homogeneous_Embankment(1-14)": {
      name: "Homogeneous Dam Embankment",
      desc: "Suitability ranking for constructing homogeneous rolled earthfill dam sections."
    },
    "Rolled_Earth_Dams_core": {
      name: "Rolled Earth Dam Core",
      desc: "Suitability ranking for low-permeability central core sections of zoned dams."
    },
    "Rolled_Earth_Dams_shell": {
      name: "Rolled Earth Dam Shell",
      desc: "Suitability ranking for outer pervious structural shell zones."
    },
    "Foundations-Seepage_important": {
      name: "Foundations (Seepage Important)",
      desc: "Suitability for building foundations where control of water seepage is critical."
    },
    "Foundations-Seepage_not_important": {
      name: "Foundations (Seepage Not Important)",
      desc: "Suitability for foundations where water seepage is not a primary design concern."
    },
    "Roadways_Surfacing": {
      name: "Roadway Surfacing",
      desc: "Suitability for subgrades, subbases, or surfacing courses in road construction."
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Report Header Metadata Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Geotechnical Report</span>
          <h2 className="text-sm font-bold text-slate-800">
            Soil Classification Results — Report #{report.reportNumber}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{dateStr}</span>
        </div>
      </div>

      {/* Grid Layout matching SBC and Footing results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Classification Parameters */}
        <div className="space-y-6">
          
          {/* Sieve and Limits Parameters Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Input Soil Parameters</span>
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
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Percentage of Fines (&lt;75µ)</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.fines}</td>
                    <td className="px-4 py-2.5 text-slate-500">%</td>
                  </tr>
                  {inputs.gravel !== undefined && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Percentage of Gravel (&gt;4.75mm)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.gravel}</td>
                      <td className="px-4 py-2.5 text-slate-500">%</td>
                    </tr>
                  )}
                  {inputs.sand !== undefined && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Percentage of Sand (calculated)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.sand.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-slate-500">%</td>
                    </tr>
                  )}
                  {inputs.wl !== undefined && inputs.wl !== null && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Liquid Limit (WL)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.wl}</td>
                      <td className="px-4 py-2.5 text-slate-500">%</td>
                    </tr>
                  )}
                  {inputs.wp !== undefined && inputs.wp !== null && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Plastic Limit (WP)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.wp}</td>
                      <td className="px-4 py-2.5 text-slate-500">%</td>
                    </tr>
                  )}
                  {inputs.cu !== undefined && inputs.cu !== null && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Uniformity Coefficient (Cu)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.cu}</td>
                      <td className="px-4 py-2.5 text-slate-500">—</td>
                    </tr>
                  )}
                  {inputs.cc !== undefined && inputs.cc !== null && (
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Coefficient of Curvature (Cc)</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">{inputs.cc}</td>
                      <td className="px-4 py-2.5 text-slate-500">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classification Result High-Fidelity Banner */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>IS / USCS Classification</span>
            </h3>

            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">{soilType}</span>
                <span className="text-3xl font-extrabold text-emerald-800 mt-1 block">
                  {groupSymbol}
                </span>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-600 shrink-0" />
            </div>
          </div>

        </div>

        {/* Right Column: Engineering Notes */}
        <div className="space-y-6">
          
          {/* Engineering Notes Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Engineering Notes & Parameters</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Classification Standard</span>
                <span className="font-semibold text-slate-700 block">{notes.classificationMethod}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Group Symbol</span>
                <span className="font-semibold text-slate-700 block">{notes.isClassification}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Soil Category</span>
                <span className="font-semibold text-slate-700 block">{notes.soilCategory}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Plasticity Index</span>
                <span className="font-semibold text-slate-700 block">{notes.plasticity}</span>
              </div>
              <div className="space-y-0.5 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Soil Suitability Overview</span>
                <span className="font-semibold text-slate-700 block">{notes.recommendedApplications}</span>
              </div>
              <div className="space-y-0.5 col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Remarks</span>
                <p className="font-semibold text-slate-700 leading-snug">{notes.remarks}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Engineering Properties Table Section (Full Width) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Geotechnical Engineering Suitability & Properties</span>
        </h3>

        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Value / Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {Object.entries(props).map(([key, value]) => {
                const label = propertyLabels[key] || { name: key, desc: "" };
                return (
                  <tr key={key} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{label.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-sm">{label.desc}</td>
                    <td className={`px-4 py-3 text-right font-extrabold tabular-nums ${
                      value === 'Excellent' || value === '1' || value === 'Good'
                        ? 'text-emerald-700' 
                        : value === 'Poor' || value === 'Not suitable' || value === '–'
                          ? 'text-slate-400 font-normal' 
                          : 'text-slate-800'
                    }`}>
                      {value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="pt-2">
        <SoilClassificationExportButtons reportOrReports={report} />
      </div>

    </div>
  );
}
