/**
 * ResultsTable – Engineering Report Style
 * ─────────────────────────────────────────
 * Compact, high-information-density table modelled after civil/geotechnical
 * software output (GEO5, PLAXIS, STAAD Foundation).
 *
 * Columns (fixed-width, table-layout: fixed):
 *   Layer | Soil Type | Thickness (m) | Method |
 *   Skin Friction Clay (kN) | Skin Friction Sand (kN) | Qs (kN)
 *
 * Data flows from: results.layerResults (backend response).
 * Rows are generated dynamically — no hardcoded layer count.
 */

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

const TOTAL_W = Object.values(COL).reduce((s, c) => s + c.w, 0); // 930 px

const METHOD_LABEL = {
  clay:     'α-Method (Skempton)',
  sandLow:  'Eff. Stress  (L/D < 15)',
  sandHigh: 'Eff. Stress  (L/D ≥ 15)',
};

const SOIL_LABEL = { clay: 'Clay', sand: 'Sand' };

// ── Helpers ───────────────────────────────────────────────────────────────────

const f3 = (v) => (typeof v === 'number' && !isNaN(v) ? v.toFixed(3) : '—');

// ── Inline style objects (precise, deterministic, no Tailwind purge risk) ─────

const S = {
  // Wrapper
  wrapper: {
    width: '100%',
    overflowX: 'auto',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '13px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    minWidth: `${TOTAL_W}px`,
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
  },

  // Header
  th: (align) => ({
    padding: '10px 10px',
    height: '42px',
    background: '#F3F4F6',
    fontWeight: 600,
    fontSize: '13px',
    color: '#111827',
    textAlign: align,
    borderBottom: '2px solid #D1D5DB',
    borderRight: '1px solid #D1D5DB',
    whiteSpace: 'nowrap',
    lineHeight: '1.3',
  }),
  thLast: (align) => ({
    padding: '10px 10px',
    height: '42px',
    background: '#F3F4F6',
    fontWeight: 600,
    fontSize: '13px',
    color: '#111827',
    textAlign: align,
    borderBottom: '2px solid #D1D5DB',
    lineHeight: '1.3',
  }),

  // Body cell
  td: (align, extraBg) => ({
    padding: '0 10px',
    height: '40px',
    color: '#1F2937',
    fontSize: '13px',
    textAlign: align,
    borderBottom: '1px solid #D1D5DB',
    borderRight: '1px solid #D1D5DB',
    background: extraBg || 'transparent',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
  tdLast: (align, extraBg) => ({
    padding: '0 10px',
    height: '40px',
    color: '#1F2937',
    fontSize: '13px',
    textAlign: align,
    borderBottom: '1px solid #D1D5DB',
    background: extraBg || 'transparent',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),

  // Totals row
  tdTotal: (align) => ({
    padding: '0 10px',
    height: '42px',
    background: '#EEF4FF',
    color: '#1E3A8A',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: align,
    borderTop: '2px solid #BFDBFE',
    borderRight: '1px solid #D1D5DB',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
  tdTotalLast: (align) => ({
    padding: '0 10px',
    height: '42px',
    background: '#EEF4FF',
    color: '#1E3A8A',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: align,
    borderTop: '2px solid #BFDBFE',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
};

// ── Hover row helper (stateless via CSS class defined below) ──────────────────
// We inject a tiny <style> block once so hover works without Tailwind.
const HoverStyle = () => (
  <style>{`
    .eng-row:hover td { background-color: #F9FAFB !important; }
  `}</style>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ResultsTable = ({ layerResults = [], layers = [], diameter }) => {
  const d = parseFloat(diameter) || 1;

  const totalQs     = layerResults.reduce((s, lr) => s + (lr.shaftResistance  ?? 0), 0);
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  return (
    <div style={S.wrapper} id="results-table">
      <HoverStyle />
      <table style={S.table}>

        {/* ── Column width declarations ── */}
        <colgroup>
          <col style={{ width: COL.layer.w     }} />
          <col style={{ width: COL.soilType.w  }} />
          <col style={{ width: COL.thickness.w }} />
          <col style={{ width: COL.method.w    }} />
          <col style={{ width: COL.claySF.w    }} />
          <col style={{ width: COL.sandSF.w    }} />
          <col style={{ width: COL.qs.w        }} />
        </colgroup>

        {/* ── Header ── */}
        <thead>
          <tr>
            <th style={S.th('center')}>Layer</th>
            <th style={S.th('center')}>Soil Type</th>
            <th style={S.th('center')}>Thickness (m)</th>
            <th style={S.th('left')}>Method</th>
            <th style={S.th('right')}>Skin Friction Clay (kN)</th>
            <th style={S.th('right')}>Skin Friction Sand (kN)</th>
            <th style={S.thLast('right')}>Qs (kN)</th>
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {layerResults.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ ...S.td('center'), color: '#9CA3AF', fontStyle: 'italic', borderRight: 'none' }}
              >
                No results to display.
              </td>
            </tr>
          ) : (
            layerResults.map((lr, i) => {
              const layerNo = lr.layer ?? (i + 1);
              const orig    = layers[i] || {};
              const ld      = (parseFloat(orig.thickness) || parseFloat(lr.thickness) || 0) / d;
              const method  =
                lr.soilType === 'clay' ? METHOD_LABEL.clay
                : ld < 15              ? METHOD_LABEL.sandLow
                :                        METHOD_LABEL.sandHigh;

              const isClay = lr.soilType === 'clay';
              const isSand = lr.soilType === 'sand';

              // Clay SF value: use backend field if present, else shaftResistance for clay row
              const claySFval = isClay
                ? f3(lr.skinFrictionClay ?? lr.shaftResistance)
                : '—';
              const sandSFval = isSand
                ? f3(lr.skinFrictionSand ?? lr.shaftResistance)
                : '—';

              return (
                <tr key={i} className="eng-row">
                  <td style={S.td('center')}>{layerNo}</td>
                  <td style={S.td('center')}>
                    {SOIL_LABEL[lr.soilType] ?? lr.soilType ?? '—'}
                  </td>
                  <td style={S.td('center')}>
                    {lr.thickness ?? '—'}
                  </td>
                  <td style={S.td('left')}>{method}</td>
                  <td style={{ ...S.td('right'), color: isClay ? '#92400E' : '#9CA3AF' }}>
                    {claySFval}
                  </td>
                  <td style={{ ...S.td('right'), color: isSand ? '#78350F' : '#9CA3AF' }}>
                    {sandSFval}
                  </td>
                  <td style={S.tdLast('right')}>
                    <strong>{f3(lr.shaftResistance)}</strong>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

        {/* ── Totals Row ── */}
        <tfoot>
          <tr>
            <td style={S.tdTotal('center')} colSpan={4}>Totals</td>
            <td style={S.tdTotal('right')}>
              {totalClaySF > 0 ? f3(totalClaySF) : '—'}
            </td>
            <td style={S.tdTotal('right')}>
              {totalSandSF > 0 ? f3(totalSandSF) : '—'}
            </td>
            <td style={S.tdTotalLast('right')}>
              {f3(totalQs)}
            </td>
          </tr>
          {/* Label sub-row */}
          <tr>
            <td
              colSpan={4}
              style={{
                padding: '3px 10px',
                background: '#EEF4FF',
                fontSize: '11px',
                color: '#6B7280',
                textAlign: 'right',
                borderRight: '1px solid #D1D5DB',
              }}
            >
              Total Shaft Resistance (ΣQs)
            </td>
            <td style={{ padding: '3px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right', borderRight: '1px solid #D1D5DB' }}>
              ΣQs (Clay)
            </td>
            <td style={{ padding: '3px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right', borderRight: '1px solid #D1D5DB' }}>
              ΣQs (Sand)
            </td>
            <td style={{ padding: '3px 10px', background: '#EEF4FF', fontSize: '11px', color: '#6B7280', textAlign: 'right' }}>
              ΣQs_c + ΣQs_s
            </td>
          </tr>
        </tfoot>

      </table>
    </div>
  );
};

export default ResultsTable;
