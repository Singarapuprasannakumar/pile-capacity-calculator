import { useState, useCallback, lazy, Suspense } from 'react';
import FormField from './components/FormField';
import SoilLayerCard from './components/SoilLayerCard';
import PileTipSection from './components/PileTipSection';
import LiveSummaryPanel from './components/LiveSummaryPanel';
import Spinner from './components/Spinner';
import AlertBanner from './components/AlertBanner';
import { calculateCapacity } from './api/pileApi';

const ResultsTable = lazy(() => import('./components/ResultsTable'));
const ResultsPanel = lazy(() => import('./components/ResultsPanel'));

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultLayer = () => ({
  soilType: '',
  thickness: '',
  alpha: '', cohesion: '',           // clay
  K: '', phi: '',                    // sand (both L/D)
  ovTop: '', ovBottom: '',           // sand L/D < 15
  bulkUnit: '', waterTableDepth: '', submergedUnit: '',  // sand L/D >= 15
});

const defaultTip = () => ({ cohesion: '', overburden: '', nq: '' });

// ─── Validation ───────────────────────────────────────────────────────────────

const req = (v) => (v === '' || v === undefined || v === null ? 'Required' : null);
const pos = (v) => (Number(v) <= 0 ? 'Must be > 0' : null);

function validateForm({ diameter, numLayers, layers, tip }) {
  const errors = { pile: {}, layers: [], tip: {} };
  let valid = true;

  if (req(diameter))          { errors.pile.diameter  = req(diameter);  valid = false; }
  else if (pos(diameter))     { errors.pile.diameter  = pos(diameter);  valid = false; }
  if (req(numLayers))         { errors.pile.numLayers = req(numLayers); valid = false; }
  else if (Number(numLayers) < 1) { errors.pile.numLayers = 'At least 1 layer'; valid = false; }

  layers.forEach((layer, i) => {
    const le = {};
    if (!layer.soilType)         { le.soilType  = 'Required'; valid = false; }
    if (req(layer.thickness))    { le.thickness = req(layer.thickness); valid = false; }
    else if (pos(layer.thickness)) { le.thickness = pos(layer.thickness); valid = false; }

    if (layer.soilType === 'clay') {
      if (req(layer.alpha))    { le.alpha    = req(layer.alpha); valid = false; }
      if (req(layer.cohesion)) { le.cohesion = req(layer.cohesion); valid = false; }
      else if (pos(layer.cohesion)) { le.cohesion = pos(layer.cohesion); valid = false; }
    }

    if (layer.soilType === 'sand') {
      if (req(layer.K))   { le.K   = req(layer.K);   valid = false; }
      if (req(layer.phi)) { le.phi = req(layer.phi);  valid = false; }
      const d_  = parseFloat(diameter) || 1;
      const ld_ = (parseFloat(layer.thickness) || 0) / d_;
      if (ld_ < 15) {
        if (req(layer.ovTop))    { le.ovTop    = req(layer.ovTop);    valid = false; }
        if (req(layer.ovBottom)) { le.ovBottom = req(layer.ovBottom); valid = false; }
      } else {
        if (req(layer.bulkUnit))        { le.bulkUnit        = req(layer.bulkUnit);        valid = false; }
        if (req(layer.waterTableDepth)) { le.waterTableDepth = req(layer.waterTableDepth); valid = false; }
        if (req(layer.submergedUnit))   { le.submergedUnit   = req(layer.submergedUnit);   valid = false; }
      }
    }
    errors.layers[i] = le;
  });

  const lastSoilType = layers[layers.length - 1]?.soilType;
  if (lastSoilType === 'clay') {
    if (req(tip.cohesion))    { errors.tip.cohesion = req(tip.cohesion); valid = false; }
    else if (pos(tip.cohesion)) { errors.tip.cohesion = pos(tip.cohesion); valid = false; }
  }
  if (lastSoilType === 'sand') {
    if (req(tip.overburden)) { errors.tip.overburden = req(tip.overburden); valid = false; }
    if (req(tip.nq))         { errors.tip.nq         = req(tip.nq);         valid = false; }
    else if (pos(tip.nq))    { errors.tip.nq         = pos(tip.nq);         valid = false; }
  }

  return { valid, errors };
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, color, title, subtitle, badge }) => (
  <div className="section-header">
    <div className={`section-icon ${color}`}>{icon}</div>
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {badge}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [diameter,  setDiameter]  = useState('');
  const [numLayers, setNumLayers] = useState('');
  const [layers,    setLayers]    = useState([]);
  const [tip,       setTip]       = useState(defaultTip());

  const [errors,  setErrors]  = useState({ pile: {}, layers: [], tip: {} });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [alert,   setAlert]   = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Layer count change ─────────────────────────────────────────────────────
  const handleNumLayersChange = (e) => {
    const val = e.target.value;
    setNumLayers(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= 20) {
      setLayers((prev) => {
        const next = [...prev];
        while (next.length < n) next.push(defaultLayer());
        next.length = n;
        return next;
      });
    } else if (val === '') {
      setLayers([]);
    }
  };

  const handleLayerChange = useCallback((index, field, value) => {
    setLayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const handleTipChange = (field, value) =>
    setTip((prev) => ({ ...prev, [field]: value }));

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setDiameter(''); setNumLayers(''); setLayers([]); setTip(defaultTip());
    setErrors({ pile: {}, layers: [], tip: {} });
    setResults(null); setAlert(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const { valid, errors: errs } = validateForm({ diameter, numLayers, layers, tip });
    setErrors(errs);
    if (!valid) {
      setAlert({ type: 'error', title: 'Validation Failed', message: 'Please fill in all required fields correctly.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setAlert(null); setLoading(true); setResults(null);

    const d = parseFloat(diameter);
    const layersPayload = layers.map((layer) => {
      const base = { soilType: layer.soilType, thickness: parseFloat(layer.thickness) };
      if (layer.soilType === 'clay') {
        return { ...base, alpha: parseFloat(layer.alpha), cohesion: parseFloat(layer.cohesion) };
      }
      const ld = parseFloat(layer.thickness) / d;
      const sandBase = { ...base, K: parseFloat(layer.K), phi: parseFloat(layer.phi) };
      return ld < 15
        ? { ...sandBase, ovTop: parseFloat(layer.ovTop), ovBottom: parseFloat(layer.ovBottom) }
        : { ...sandBase, bulkUnit: parseFloat(layer.bulkUnit), waterTableDepth: parseFloat(layer.waterTableDepth), submergedUnit: parseFloat(layer.submergedUnit) };
    });

    const lastSoilType = layers[layers.length - 1]?.soilType;
    const tipPayload = lastSoilType === 'clay'
      ? { soilType: 'clay', cohesion: parseFloat(tip.cohesion) }
      : { soilType: 'sand', overburden: parseFloat(tip.overburden), nq: parseFloat(tip.nq) };

    try {
      const res = await calculateCapacity({ diameter: d, layers: layersPayload, tip: tipPayload });
      setResults(res.data);
      setAlert({ type: 'success', title: 'Calculation Complete', message: 'Pile capacity has been computed successfully. See results below.' });
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      setAlert({ type: 'error', title: 'API Error', message: err.friendlyMessage || err.message || 'Unexpected error.' });
    } finally {
      setLoading(false);
    }
  };

  // ── PDF Download ───────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!results) return;
    setPdfLoading(true);
    try {
      const { generatePDF } = await import('./utils/pdfReport');
      await generatePDF({ diameter: parseFloat(diameter), layers }, results);
    } catch (e) {
      setAlert({ type: 'error', title: 'PDF Error', message: String(e.message) });
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  const lastSoilType = layers[layers.length - 1]?.soilType || '';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {loading && <Spinner fullscreen message="Computing pile capacity…" />}

      {/* ── Top Navigation ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">Pile Capacity Calculator</h1>
              <p className="text-xs text-slate-500 leading-tight">Geotechnical Engineering Tool</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            {results && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  {pdfLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  Download PDF
                </button>
                <button onClick={handlePrint} className="btn-secondary text-xs py-2 px-4">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${results ? 'bg-green-400' : 'bg-blue-400'}`} />
              {results ? 'Results Ready' : 'Ready to Calculate'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Title */}
        <div className="text-center py-4 mb-6 no-print">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pile Capacity{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-400 bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
            Compute shaft resistance, end bearing and allowable capacity for multi-layer soil profiles
            using the α-method (clay) and effective stress method (sand).
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6 no-print">
            <AlertBanner
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* ── Two-column Grid: Left form | Right sticky summary ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ═══ LEFT COLUMN: Form Sections ═════════════════════════════════ */}
          <div className="flex flex-col gap-6">

            {/* SECTION 1 – Pile Information */}
            <section className="card p-6">
              <SectionHeader
                color="bg-primary-100"
                icon={
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                }
                title="Pile Information"
                subtitle="Define pile diameter and number of soil layers."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  id="pile-diameter"
                  label="Pile Diameter (m)"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  placeholder="e.g. 0.6"
                  min={0.01}
                  error={errors.pile?.diameter}
                  tooltip="External diameter of the pile. Used to compute perimeter C = πD for shaft friction and tip area Ap = πD²/4 for end bearing."
                />
                <FormField
                  id="num-layers"
                  label="Number of Soil Layers"
                  value={numLayers}
                  onChange={handleNumLayersChange}
                  placeholder="e.g. 3"
                  min={1} max={20} step={1}
                  error={errors.pile?.numLayers}
                  tooltip="Total distinct soil strata the pile passes through. Each layer is independently assigned soil type and parameters."
                />
              </div>
            </section>

            {/* SECTION 2 – Soil Layers */}
            {layers.length > 0 && (
              <section className="card p-6">
                <SectionHeader
                  color="bg-orange-100"
                  icon={
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  }
                  title="Soil Layers"
                  subtitle="Define soil properties for each layer."
                  badge={
                    <span className="badge bg-primary-100 text-primary-700">
                      {layers.length} layer{layers.length !== 1 ? 's' : ''}
                    </span>
                  }
                />
                <div className="flex flex-col gap-4">
                  {layers.map((layer, i) => (
                    <SoilLayerCard
                      key={i}
                      index={i}
                      layer={layer}
                      onChange={handleLayerChange}
                      errors={errors.layers?.[i] || {}}
                      diameter={diameter}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 3 – Pile Tip */}
            {layers.length > 0 && (
              <section className="card p-6">
                <SectionHeader
                  color="bg-purple-100"
                  icon={
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  }
                  title="Pile Tip"
                  subtitle="End bearing parameters at pile tip level."
                />
                <PileTipSection
                  tipData={tip}
                  onChange={handleTipChange}
                  lastSoilType={lastSoilType}
                  errors={errors.tip || {}}
                />
              </section>
            )}

            {/* SECTION 4 – Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end no-print">
              <button className="btn-secondary" onClick={handleReset} disabled={loading}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || layers.length === 0}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Computing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculate Capacity
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: Sticky Live Summary ══════════════════════════ */}
          <div className="lg:sticky lg:top-20 no-print">
            <LiveSummaryPanel
              diameter={diameter}
              layers={layers}
              results={results}
            />
          </div>
        </div>

        {/* ── RESULTS SECTION (full width below grid) ─────────────────────── */}
        {results && (
          <section
            id="results-section"
            className="mt-8 flex flex-col gap-6 animate-slide-up"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded bg-primary-500" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Calculation Results</h2>
                  <p className="text-xs text-slate-500">
                    Diameter: {diameter} m &nbsp;·&nbsp; {layers.length} Layer{layers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* PDF / Print Buttons */}
              <div className="flex items-center gap-3 no-print">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="btn-primary py-2.5 px-5 text-sm"
                >
                  {pdfLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  Download PDF
                </button>
                <button onClick={handlePrint} className="btn-secondary py-2.5 px-5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
              </div>
            </div>

            {/* Layer-wise Breakdown Table */}
            <div className="card p-3">
              <h3
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #E5E7EB',
                  letterSpacing: '0.01em',
                }}
              >
                Table 1 &nbsp;·&nbsp; Layer-wise Shaft Resistance Breakdown
              </h3>
              <Suspense fallback={<div className="p-4 text-center text-xs text-slate-500">Loading analysis table...</div>}>
                <ResultsTable
                  layerResults={results.layerResults}
                  layers={layers}
                  diameter={diameter}
                  Qp={results.Qp}
                  Qu={results.Qu}
                  Qa={results.Qa}
                />
              </Suspense>
            </div>

            {/* Summary Cards */}
            <div className="card p-4">
              <Suspense fallback={<div className="p-4 text-center text-xs text-slate-500">Loading summary charts...</div>}>
                <ResultsPanel results={results} />
              </Suspense>
            </div>

            {/* Formula note */}
            <p className="text-xs text-slate-400 text-center pb-2 no-print">
              Qu = ΣQs + Qp &nbsp;|&nbsp; Qa = Qu / 2.5 &nbsp;|&nbsp; Results are for design reference only.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-8 no-print">
          Pile Capacity Calculator &nbsp;·&nbsp; For engineering reference only. Consult a licensed geotechnical engineer for design decisions.
        </footer>
      </main>
    </div>
  );
}
