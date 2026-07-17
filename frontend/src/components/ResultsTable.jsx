/**
 * ResultsTable – Engineering Report Style (Dynamic Columns)
 * ────────────────────────────────────────────────────────
 * Compact, high-information-density table modelled after civil/geotechnical
 * software output (GEO5, PLAXIS, STAAD Foundation).
 *
 * Columns adapt dynamically based on soil types:
 *   - Case 1 (Clay only): Layer | Soil Type | Thickness | Method | Clay SF | Qs
 *   - Case 2 (Sand only): Layer | Soil Type | Thickness | Method | Sand SF | Qs
 *   - Case 3 (Mixed):     Layer | Soil Type | Thickness | Method | Clay SF | Sand SF | Qs
 */

import React from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const COL = {
  layer:     { w: 70,  align: 'center' },
  soilType:  { w: 110, align: 'center' },
  thickness: { w: 110, align: 'center' },
  method:    { w: 190, align: 'left'   },
  claySF:    { w: 160, align: 'right'  },
  sandSF:    { w: 160, align: 'right'  },
  qs:        { w: 130, align: 'right'  },
};

const METHOD_LABEL = {
  clay:     'α-Method (Skempton)',
  sandLow:  'Eff. Stress  (L/D < 15)',
  sandHigh: 'Eff. Stress  (L/D ≥ 15)',
};

const SOIL_LABEL = { clay: 'Clay', sand: 'Sand' };

const f3 = (v) => (typeof v === 'number' && !isNaN(v) ? v.toFixed(3) : '0.000');

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  wrapper: {
    width: '100%',
    overflowX: 'auto',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '13px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
  },
  table: (minW) => ({
    width: '100%',
    minWidth: `${minW}px`,
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
  }),
  th: (align, isLast) => ({
    padding: '10px 10px',
    height: '42px',
    background: '#F3F4F6',
    fontWeight: 600,
    fontSize: '13px',
    color: '#111827',
    textAlign: align,
    borderBottom: '2px solid #D1D5DB',
    borderRight: isLast ? 'none' : '1px solid #D1D5DB',
    whiteSpace: 'nowrap',
    lineHeight: '1.3',
  }),
  td: (align, isLast, extraBg) => ({
    padding: '0 10px',
    height: '40px',
    color: '#1F2937',
    fontSize: '13px',
    textAlign: align,
    borderBottom: '1px solid #D1D5DB',
    borderRight: isLast ? 'none' : '1px solid #D1D5DB',
    background: extraBg || 'transparent',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
  tdTotal: (align, isLast) => ({
    padding: '0 10px',
    height: '42px',
    background: '#EEF4FF',
    color: '#1E3A8A',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: align,
    borderTop: '2px solid #BFDBFE',
    borderBottom: '1px solid #D1D5DB',
    borderRight: isLast ? 'none' : '1px solid #D1D5DB',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
};

const HoverStyle = () => (
  <style>{`
    .eng-row:hover td { background-color: #F9FAFB !important; }
  `}</style>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ResultsTable = ({ layerResults = [], layers = [], diameter }) => {
  const d = parseFloat(diameter) || 1;

  // Determine dynamic column visibility
  const hasClay = layerResults.some(lr => lr.soilType?.toLowerCase() === 'clay');
  const hasSand = layerResults.some(lr => lr.soilType?.toLowerCase() === 'sand');

  // If no data yet, show both columns as fallback
  const showClay = layerResults.length === 0 ? true : hasClay;
  const showSand = layerResults.length === 0 ? true : hasSand;

  // Compute table min-width dynamically
  const tableWidth = COL.layer.w + COL.soilType.w + COL.thickness.w + COL.method.w 
                   + (showClay ? COL.claySF.w : 0) 
                   + (showSand ? COL.sandSF.w : 0) 
                   + COL.qs.w;

  const totalQs     = layerResults.reduce((s, lr) => s + (lr.shaftResistance  ?? 0), 0);
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  const activeColsCount = 4 + (showClay ? 1 : 0) + (showSand ? 1 : 0) + 1;

  return (
    <div style={S.wrapper} id="results-table">
      <HoverStyle />
      <table style={S.table(tableWidth)}>
        
        {/* Width configuration */}
        <colgroup>
          <col style={{ width: COL.layer.w     }} />
          <col style={{ width: COL.soilType.w  }} />
          <col style={{ width: COL.thickness.w }} />
          <col style={{ width: COL.method.w    }} />
          {showClay && <col style={{ width: COL.claySF.w }} />}
          {showSand && <col style={{ width: COL.sandSF.w }} />}
          <col style={{ width: COL.qs.w        }} />
        </colgroup>

        {/* Header */}
        <thead>
          <tr>
            <th style={S.th('center', false)}>Layer</th>
            <th style={S.th('center', false)}>Soil Type</th>
            <th style={S.th('center', false)}>Thickness (m)</th>
            <th style={S.th('left', false)}>Method</th>
            {showClay && <th style={S.th('right', false)}>Skin Friction Clay (kN)</th>}
            {showSand && <th style={S.th('right', false)}>Skin Friction Sand (kN)</th>}
            <th style={S.th('right', true)}>Qs (kN)</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {layerResults.length === 0 ? (
            <tr>
              <td
                colSpan={activeColsCount}
                style={{ ...S.td('center', true), color: '#9CA3AF', fontStyle: 'italic' }}
              >
                No results to display.
              </td>
            </tr>
          ) : (
            layerResults.map((lr, i) => {
              const layerNo = lr.layer ?? (i + 1);
              const orig    = layers[i] || {};
              const ld      = (parseFloat(orig.thickness) || parseFloat(lr.thickness) || 0) / d;
              
              const method =
                lr.soilType === 'clay' ? METHOD_LABEL.clay
                : ld < 15              ? METHOD_LABEL.sandLow
                :                        METHOD_LABEL.sandHigh;

              const isClay = lr.soilType === 'clay';
              const isSand = lr.soilType === 'sand';

              const claySFval = isClay ? f3(lr.skinFrictionClay ?? lr.shaftResistance) : '';
              const sandSFval = isSand ? f3(lr.skinFrictionSand ?? lr.shaftResistance) : '';

              return (
                <tr key={i} className="eng-row">
                  <td style={S.td('center', false)}>{layerNo}</td>
                  <td style={S.td('center', false)}>
                    {SOIL_LABEL[lr.soilType] ?? lr.soilType ?? '—'}
                  </td>
                  <td style={S.td('center', false)}>
                    {lr.thickness ?? '—'}
                  </td>
                  <td style={S.td('left', false)}>{method}</td>
                  {showClay && (
                    <td style={{ ...S.td('right', false), color: '#92400E' }}>
                      {claySFval}
                    </td>
                  )}
                  {showSand && (
                    <td style={{ ...S.td('right', false), color: '#78350F' }}>
                      {sandSFval}
                    </td>
                  )}
                  <td style={S.td('right', true)}>
                    <strong>{f3(lr.shaftResistance)}</strong>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

        {/* Footer */}
        <tfoot>
          <tr>
            <td style={S.tdTotal('center', false)} colSpan={4}>Totals</td>
            {showClay && (
              <td style={S.tdTotal('right', false)}>
                {totalClaySF > 0 ? f3(totalClaySF) : '0.000'}
              </td>
            )}
            {showSand && (
              <td style={S.tdTotal('right', false)}>
                {totalSandSF > 0 ? f3(totalSandSF) : '0.000'}
              </td>
            )}
            <td style={S.tdTotal('right', true)}>
              {f3(totalQs)}
            </td>
          </tr>

          {/* Sub-label definitions */}
          <tr>
            <td
              colSpan={4}
              style={{
                padding: '4px 10px',
                background: '#EEF4FF',
                fontSize: '11px',
                color: '#6B7280',
                textAlign: 'right',
                borderRight: '1px solid #D1D5DB',
              }}
            >
              Total Shaft Resistance (ΣQs)
            </td>
            {showClay && (
              <td style={{ padding: '4px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right', borderRight: '1px solid #D1D5DB' }}>
                ΣQs (Clay)
              </td>
            )}
            {showSand && (
              <td style={{ padding: '4px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right', borderRight: '1px solid #D1D5DB' }}>
                ΣQs (Sand)
              </td>
            )}
            <td style={{ padding: '4px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right' }}>
              {showClay && showSand ? 'ΣQs_c + ΣQs_s' : showClay ? 'ΣQs_c' : 'ΣQs_s'}
            </td>
          </tr>
        </tfoot>

      </table>
    </div>
  );
};

export default ResultsTable;
