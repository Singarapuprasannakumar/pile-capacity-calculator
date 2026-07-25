/**
 * ResultsTable – Civil Engineering Report Style
 * ────────────────────────────────────────────────────────
 * Redesigned to look like a professional civil engineering report.
 * - Always displays all 7 layer-dependent columns.
 * - Displays overall pile capacities (Qp, Qu, Qa) integrated directly 
 *   into the main table as summary rows at the bottom.
 */

import React from 'react';
import { formatEngineeringNumber, getEngineeringMethod, ENGINEERING_TABLE } from '../../utils/engineeringUtils';
import ExportButtons from './ExportButtons';

// ── Column Configurations (7 columns) ─────────────────────────────────────────
const COL = {
  layer:     { w: 70,  align: 'center' },
  soilType:  { w: 100, align: 'center' },
  thickness: { w: 110, align: 'right'  },
  method:    { w: 220, align: 'center' },
  claySF:    { w: 160, align: 'right'  },
  sandSF:    { w: 160, align: 'right'  },
  qs:        { w: 140, align: 'right'  },
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrapper: {
    width: '100%',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
  },
  table: (minW) => ({
    width: '100%',
    minWidth: `${minW}px`,
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    backgroundColor: '#FFFFFF',
  }),
  th: (align, isLast) => ({
    padding: '12px 10px',
    background: '#FFFFFF',
    fontWeight: 700,
    fontSize: '12px',
    color: '#374151',
    textAlign: 'center', // All headers are centered
    borderTop: '1px solid #D1D5DB',
    borderBottom: '2px solid #9CA3AF',
    borderRight: isLast ? 'none' : '1px solid #E5E7EB',
    whiteSpace: 'normal',
    lineHeight: '1.2',
  }),
  td: (align, isLast, bg) => ({
    padding: '10px 10px',
    color: '#1F2937',
    fontSize: '13px',
    textAlign: align,
    borderBottom: '1px solid #E5E7EB',
    borderRight: isLast ? 'none' : '1px solid #E5E7EB',
    backgroundColor: bg || '#FFFFFF',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
};

// ── Custom Hover & Mobile CSS ──────────────────────────────────────────────────
const HoverStyle = () => (
  <style>{`
    .eng-row:hover td { background-color: #F9FAFB !important; }
    @media (max-width: 640px) {
      .eng-table-th { font-size: 11px !important; padding: 8px 4px !important; }
      .eng-table-td { font-size: 11px !important; padding: 8px 4px !important; }
      .eng-metadata-title { font-size: 11px !important; }
      .eng-metadata-value { font-size: 12px !important; }
    }
  `}</style>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ResultsTable = ({ layerResults = [], layers = [], diameter, Qp = 0, Qu = 0, Qa = 0, reportId = 'PCR', reportNumber = 1 }) => {
  const d = parseFloat(diameter) || 1;

  // Compute table min-width
  const tableWidth = COL.layer.w + COL.soilType.w + COL.thickness.w + COL.method.w 
                   + COL.claySF.w + COL.sandSF.w + COL.qs.w;

  // Compute metadata
  const totalLength = layers.reduce((sum, layer) => sum + (parseFloat(layer.thickness) || 0), 0);
  const bearingLayer = layers.length > 0 
    ? (layers[layers.length - 1].soilType === 'clay' ? 'Clay' : 'Sand') 
    : '—';
  
  let gwLevel = '—';
  let accumDepth = 0;
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const thickness = parseFloat(l.thickness) || 0;
    if (l.soilType === 'sand' && l.waterTableDepth !== undefined && l.waterTableDepth !== null && l.waterTableDepth !== '') {
      const wt = parseFloat(l.waterTableDepth);
      if (!isNaN(wt)) {
        gwLevel = formatEngineeringNumber(accumDepth + wt) + ' m';
        break;
      }
    }
    accumDepth += thickness;
  }

  const format = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return typeof value === "number" ? Number(value.toFixed(3)) : value;
  };

  const layerExportRows = layerResults.map(layer => ({
    Layer: layer.layer,
    Soil_Type: layer.soilType,
    Thickness_m: format(layer.thickness),
    Clay_Skin_Friction_kN: format(layer.skinFrictionClay),
    Sand_Skin_Friction_kN: format(layer.skinFrictionSand),
    Shaft_Resistance_kN: format(layer.shaftResistance),
    Area_m2: format(layer.area),
    Perimeter_m: format(layer.perimeter),
    Avg_Effective_Stress_kPa: format(layer.avgEffectiveStress),
    Depth_m: format(layer.depth)
  }));

  const calculatedQs = layerResults.reduce((sum, lr) => sum + (lr.shaftResistance || 0), 0);

  const summaryData = [
    {
      Report: `Report #${reportNumber}`,
      Generated_On: new Date().toLocaleString(),
      Diameter_m: format(diameter),
      Pile_Length_m: format(totalLength),
      Qs_kN: format(calculatedQs),
      Qp_kN: format(Qp),
      Qu_kN: format(Qu),
      Qa_kN: format(Qa),
    },
  ];

  return (
    <div style={S.wrapper} id="results-table">
      <HoverStyle />

      {/* ── 1. Metadata Report Block ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-slate-700 shadow-sm no-print">
        <div className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">
          Pile Capacity Engineering Report
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm font-medium">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-0.5 eng-metadata-title">Pile Diameter</span>
            <span className="font-bold text-slate-800 eng-metadata-value">{formatEngineeringNumber(diameter)} m</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-0.5 eng-metadata-title">Pile Length</span>
            <span className="font-bold text-slate-800 eng-metadata-value">{formatEngineeringNumber(totalLength)} m</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-0.5 eng-metadata-title">Factor of Safety</span>
            <span className="font-bold text-slate-800 eng-metadata-value">2.500</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-0.5 eng-metadata-title">Bearing Layer</span>
            <span className="font-bold text-slate-800 eng-metadata-value">{bearingLayer}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block mb-0.5 eng-metadata-title">Groundwater Level</span>
            <span className="font-bold text-slate-800 eng-metadata-value">{gwLevel !== '—' ? gwLevel : 'Not Encountered'}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Layer-wise Shaft Resistance Calculations Table ─────────────────── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-blue-600">
          Layer-wise Calculations
        </h3>
        <ExportButtons
          excelData={layerExportRows}
          fileName={`Pile_Report_${reportId}_Layer_Calculations`}
          sheetName="Layer Calculations"
          disabled={!layerResults?.length}
          theme="blue"
        />
      </div>

      <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table style={S.table(tableWidth)}>
          
          <colgroup>
            <col style={{ width: COL.layer.w     }} />
            <col style={{ width: COL.soilType.w  }} />
            <col style={{ width: COL.thickness.w }} />
            <col style={{ width: COL.method.w    }} />
            <col style={{ width: COL.claySF.w    }} />
            <col style={{ width: COL.sandSF.w    }} />
            <col style={{ width: COL.qs.w        }} />
          </colgroup>

          <thead className={ENGINEERING_TABLE.header}>
            <tr>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Layer</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Soil Type</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Thickness (m)</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Engineering Method</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Clay Skin Friction (kN)</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Sand Skin Friction (kN)</th>
              <th className={`eng-table-th ${ENGINEERING_TABLE.headerCell}`}>Total Shaft Resistance Qs (kN)</th>
            </tr>
          </thead>

          <tbody>
            {layerResults.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="eng-table-td"
                  style={{ ...S.td('center', true), color: '#9CA3AF', fontStyle: 'italic' }}
                >
                  No results to display.
                </td>
              </tr>
            ) : (
              layerResults.map((lr, i) => {
                const layerNo = lr.layer ?? (i + 1);
                const method  = getEngineeringMethod(lr, d);

                const isClay = lr.soilType?.toLowerCase() === 'clay';
                const isSand = lr.soilType?.toLowerCase() === 'sand';

                const claySFval = isClay ? formatEngineeringNumber(lr.skinFrictionClay ?? lr.shaftResistance) : '-';
                const sandSFval = isSand ? formatEngineeringNumber(lr.skinFrictionSand ?? lr.shaftResistance) : '-';
                const bg = i % 2 === 0 ? '#FFFFFF' : '#F9FAFB';

                return (
                  <tr key={i} className="eng-row">
                    <td className="eng-table-td" style={S.td('center', false, bg)}>{layerNo}</td>
                    <td className="eng-table-td" style={S.td('center', false, bg)}>
                      {lr.soilType ? lr.soilType.charAt(0).toUpperCase() + lr.soilType.slice(1) : '-'}
                    </td>
                    <td className="eng-table-td" style={S.td('right', false, bg)}>
                      {formatEngineeringNumber(lr.thickness)}
                    </td>
                    <td className="eng-table-td" style={S.td('center', false, bg)}>{method}</td>
                    <td className="eng-table-td" style={S.td('right', false, bg)}>
                      {claySFval}
                    </td>
                    <td className="eng-table-td" style={S.td('right', false, bg)}>
                      {sandSFval}
                    </td>
                    <td className="eng-table-td" style={S.td('right', true, bg)}>
                      {formatEngineeringNumber(lr.shaftResistance)}
                    </td>
                  </tr>
                );
              })
            )}

            {/* ── 3. Final Results Integrated Rows ───────────────────────────── */}
            <tr className={`eng-section-header ${ENGINEERING_TABLE.header}`}>
              <td
                colSpan={7}
                className={ENGINEERING_TABLE.headerCell}
              >
                <div className="flex items-center justify-between w-full">
                  <span>FINAL RESULTS</span>
                  <ExportButtons
                    excelData={summaryData}
                    fileName={`Pile_Report_${reportId}_Summary`}
                    sheetName="Summary"
                    disabled={!layerResults?.length}
                    theme="green"
                  />
                </div>
              </td>
            </tr>
            <tr className="eng-row">
              <td
                colSpan={6}
                className="eng-table-td font-semibold"
                style={{ ...S.td('left', false, '#FFFFFF'), fontSize: '13px', color: '#374151' }}
              >
                End Bearing Capacity (Qp)
              </td>
              <td
                className="eng-table-td font-bold text-slate-800 text-[14px]"
                style={S.td('right', true, '#FFFFFF')}
              >
                {formatEngineeringNumber(Qp)} kN
              </td>
            </tr>
            <tr className="eng-row">
              <td
                colSpan={6}
                className="eng-table-td font-semibold"
                style={{ ...S.td('left', false, '#FFFFFF'), fontSize: '13px', color: '#374151' }}
              >
                Ultimate Capacity (Qu)
              </td>
              <td
                className="eng-table-td font-bold text-slate-800 text-[14px]"
                style={S.td('right', true, '#FFFFFF')}
              >
                {formatEngineeringNumber(Qu)} kN
              </td>
            </tr>
            <tr className="eng-row">
              <td
                colSpan={6}
                className="eng-table-td font-semibold"
                style={{ ...S.td('left', false, '#FFFFFF'), fontSize: '13px', color: '#374151' }}
              >
                Allowable Capacity (Qa)
              </td>
              <td
                className="eng-table-td font-bold text-slate-800 text-[14px]"
                style={S.td('right', true, '#FFFFFF')}
              >
                {formatEngineeringNumber(Qa)} kN
              </td>
            </tr>
          </tbody>

        </table>
      </div>

      {/* ── 4. Engineering Notes ──────────────────────────────────────────────── */}
      <p className="text-[11px] text-slate-400 mt-6 leading-relaxed italic border-t border-slate-100 pt-3">
        <strong>Note:</strong> All capacities are calculated based on the selected engineering methods and user-provided soil parameters. Results should be verified by a qualified geotechnical engineer before use in design.
      </p>
    </div>
  );
};

export default React.memo(ResultsTable);
