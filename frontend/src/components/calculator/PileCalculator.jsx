import { useState, useCallback, lazy, Suspense, useMemo, useEffect } from 'react';
import FormField from './FormField';
import SoilLayerCard from './SoilLayerCard';
import PileTipSection from './PileTipSection';
import LiveSummaryPanel from './LiveSummaryPanel';
import Spinner from './Spinner';
import AlertBanner from '../common/AlertBanner';
import ComparisonGrid from '../common/ComparisonGrid';
import { calculateCapacity } from '../../api/pileApi';
import { formatEngineeringNumber, generateReportId, ENGINEERING_TABLE } from '../../utils/engineeringUtils';
import { exportTableToExcel, exportCombinedExcel } from '../../utils/excelExport';
import ExportButtons from './ExportButtons';

const ResultsTable = lazy(() => import('./ResultsTable'));

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultLayer = (globalAlpha = null) => ({
  soilType: '',
  thickness: '',
  alpha: globalAlpha !== null ? globalAlpha : 0.8, cohesion: '',           // clay
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
    else if (pos(tip.overburden)) { errors.tip.overburden = pos(tip.overburden); valid = false; }
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

// ─── PileCalculator Component ────────────────────────────────────────────────

export default function PileCalculator() {
  const [diameter,  setDiameter]  = useState('');
  const [numLayers, setNumLayers] = useState('');
  const [layers,    setLayers]    = useState([]);
  const [tip,       setTip]       = useState(defaultTip());

  const [errors,  setErrors]  = useState({ pile: {}, layers: [], tip: {} });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsCounter, setReportsCounter] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [alert,   setAlert]   = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [globalAlpha, setGlobalAlpha] = useState(null);

  useEffect(() => {
    const searchParams = new window.URLSearchParams(window.location.search);
    const projectUuid = searchParams.get('project');
    
    if (projectUuid) {
      import('../../api/foundationPreferencesApi').then(({ getFoundationPreferences }) => {
        getFoundationPreferences(projectUuid).then(prefs => {
          if (prefs?.adhesion_factor_active) {
            setGlobalAlpha(prefs.adhesion_factor_value);
          }
        }).catch(console.error);
      });
    }

    if (searchParams.get('resume') === 'true') {
      try {
        const stored = localStorage.getItem('last_pile_calculation_inputs');
        if (stored) {
          const { diameter: d, numLayers: n, layers: l, tip: t } = JSON.parse(stored);
          setDiameter(d ?? '');
          setNumLayers(n ?? '');
          setLayers(l ?? []);
          setTip(t ?? defaultTip());
          setAlert({
            type: 'success',
            title: 'Design Resumed',
            message: 'Your last calculated design has been successfully loaded into the form.'
          });
        }
      } catch (e) {
        console.error('Error resuming last calculated project:', e);
      }
    }
  }, []);

  // ── Layer count change ─────────────────────────────────────────────────────
  const handleNumLayersChange = (e) => {
    const val = e.target.value;
    setNumLayers(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= 20) {
      setLayers((prev) => {
        const next = [...prev];
        while (next.length < n) next.push(defaultLayer(globalAlpha));
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
    setReports([]); setReportsCounter(0); setAlert(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const correctedLayers = layers.map((layer) => {
      if (layer.soilType === 'clay') {
        const val = layer.alpha;
        if (val === '' || val === undefined || val === null) {
          return { ...layer, alpha: globalAlpha !== null ? globalAlpha : 0.8 };
        }
      }
      return layer;
    });

    setLayers(correctedLayers);

    const { valid, errors: errs } = validateForm({ diameter, numLayers, layers: correctedLayers, tip });
    setErrors(errs);
    if (!valid) {
      setAlert({ type: 'error', title: 'Validation Failed', message: 'Please fill in all required fields correctly.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setAlert(null); setLoading(true);

    const d = parseFloat(diameter);
    const layersPayload = correctedLayers.map((layer) => {
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

    const lastSoilType = correctedLayers[correctedLayers.length - 1]?.soilType;
    const tipPayload = lastSoilType === 'clay'
      ? { soilType: 'clay', cohesion: parseFloat(tip.cohesion) }
      : { soilType: 'sand', overburden: parseFloat(tip.overburden), nq: parseFloat(tip.nq) };

    const payload = { diameter: d, layers: layersPayload, tip: tipPayload };

    try {
      const res = await calculateCapacity(payload);
      const resData = res.data;

      const totalLength = correctedLayers.reduce((sum, layer) => sum + (parseFloat(layer.thickness) || 0), 0);
      const bearingLayer = correctedLayers.length > 0 
        ? (correctedLayers[correctedLayers.length - 1].soilType === 'clay' ? 'Clay' : 'Sand') 
        : '—';
      
      let gwLevel = '—';
      let accumDepth = 0;
      for (let i = 0; i < correctedLayers.length; i++) {
        const l = correctedLayers[i];
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

      const nextNumber = compareMode ? reportsCounter + 1 : 1;
      const report = {
        id: generateReportId() + '-' + Math.random().toString(36).substring(2, 6),
        reportNumber: nextNumber,
        createdAt: new Date().toISOString(),
        diameter: d,
        pileLength: totalLength,
        groundwater: gwLevel,
        bearingLayer,
        inputs: {
          diameter,
          numLayers,
          layers: JSON.parse(JSON.stringify(correctedLayers)),
          tip: JSON.parse(JSON.stringify(tip))
        },
        calculations: resData.layerResults,
        outputs: { Qp: resData.Qp, Qu: resData.Qu, Qa: resData.Qa }
      };

      let newReports = [];
      if (compareMode) {
        newReports = [...reports, report];
        setReports(newReports);
        setReportsCounter(nextNumber);
      } else {
        newReports = [report];
        setReports(newReports);
        setReportsCounter(1);
      }

      // Track recent calculations to localStorage for Dashboard statistics
      try {
        const recent = JSON.parse(localStorage.getItem('recent_calculations') || '[]');
        const updatedRecent = [
          report,
          ...recent
        ].slice(0, 10); // keep last 10 calculations
        localStorage.setItem('recent_calculations', JSON.stringify(updatedRecent));

        // Save last calculation inputs for quick resumption
        localStorage.setItem('last_pile_calculation_inputs', JSON.stringify({
          diameter,
          numLayers,
          layers: correctedLayers,
          tip
        }));
        
        // Also update saved reports count
        const totalGenerated = parseInt(localStorage.getItem('reports_generated_count') || '0', 10) + 1;
        localStorage.setItem('reports_generated_count', totalGenerated.toString());
      } catch (e) {
        console.error('Error saving recent calculations metadata:', e);
      }

      setAlert({ type: 'success', title: 'Calculation Complete', message: 'Pile capacity has been computed successfully. See results below.' });
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      setAlert({ type: 'error', title: 'API Error', message: err.friendlyMessage || err.message || 'Unexpected error.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Report Specific Actions ────────────────────────────────────────────────
  const handlePrintReport = (reportId) => {
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #report-container-${reportId}, #report-container-${reportId} * {
          visibility: visible;
        }
        #report-container-${reportId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const handleDownloadPDFReport = async (report) => {
    setPdfLoading(true);
    try {
      const { generatePDF } = await import('../../utils/pdfReport');
      generatePDF(report);
    } catch (e) {
      setAlert({ type: 'error', title: 'PDF Error', message: String(e.message) });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadExcelReport = (report) => {
    exportTableToExcel(report);
  };

  const handleCopyInputs = (report) => {
    setDiameter(report.inputs.diameter.toString());
    setNumLayers(report.inputs.numLayers.toString());
    setLayers(JSON.parse(JSON.stringify(report.inputs.layers)));
    setTip(JSON.parse(JSON.stringify(report.inputs.tip)));
    setAlert({ type: 'info', title: 'Inputs Copied', message: `Inputs from Report #${report.reportNumber} (Diameter = ${report.diameter} m) loaded into form.` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  // ── Global Actions ─────────────────────────────────────────────────────────
  const handleClearAll = () => {
    setReports([]);
    setReportsCounter(0);
    setAlert({ type: 'info', title: 'Reports Cleared', message: 'All reports have been deleted.' });
  };

  const handleDownloadCombinedPDF = async () => {
    if (reports.length === 0) return;
    setPdfLoading(true);
    try {
      const { generateCombinedPDF } = await import('../../utils/pdfReport');
      generateCombinedPDF(reports);
    } catch (e) {
      setAlert({ type: 'error', title: 'Combined PDF Error', message: String(e.message) });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadCombinedExcel = () => {
    if (reports.length === 0) return;
    exportCombinedExcel(reports);
  };

  // ── Derived Comparison Summary Rows ────────────────────────────────────────
  const comparisonRows = useMemo(() => {
    return reports.map(r => {
      const totalQs = r.calculations.reduce((sum, lr) => sum + lr.shaftResistance, 0);
      return {
        id: r.id,
        number: r.reportNumber,
        diameter: r.diameter,
        pileLength: r.pileLength,
        qs: totalQs,
        qp: r.outputs.Qp,
        qu: r.outputs.Qu,
        qa: r.outputs.Qa
      };
    });
  }, [reports]);

  const comparisonExportRows = useMemo(() => {
    const format = (value) => {
      if (value === null || value === undefined || value === '') return '';
      return typeof value === "number" ? Number(value.toFixed(3)) : value;
    };
    return reports.map((r) => {
      const totalQs = r.calculations.reduce((sum, lr) => sum + lr.shaftResistance, 0);
      return {
        Report: `Report #${r.reportNumber}`,
        Diameter_m: format(r.diameter),
        Pile_Length_m: format(r.pileLength),
        Qs_kN: format(totalQs),
        Qp_kN: format(r.outputs.Qp),
        Qu_kN: format(r.outputs.Qu),
        Qa_kN: format(r.outputs.Qa),
        Bearing_Layer: r.bearingLayer || '—',
        Groundwater_Depth: r.groundwater || '—'
      };
    });
  }, [reports]);

  const lastSoilType = layers[layers.length - 1]?.soilType || '';

  return (
    <div className="w-full max-w-full min-w-0">
      {loading && <Spinner fullscreen message="Computing pile capacity…" />}

      {/* Toggle Compare Mode */}
      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-bold text-slate-700">Compare Mode (Enable Comparison)</span>
          </label>
          <span className="text-xs text-slate-400">
            {compareMode 
              ? 'Accumulates reports on each calculation.' 
              : 'Overwrites the report on each calculation.'}
          </span>
        </div>
        {reports.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCombinedPDF}
              className="btn-primary text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white"
            >
              Combined PDF
            </button>
            <button
              onClick={handleDownloadCombinedExcel}
              className="btn-primary text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white"
            >
              Combined Excel
            </button>
            <button
              onClick={handleClearAll}
              className="btn-secondary text-xs py-2 px-4 border-red-500 hover:bg-red-50 text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        )}
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

      {/* Form sections & Live summary split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 items-start w-full max-w-full min-w-0">
        <div className="flex flex-col gap-6 w-full min-w-0">
          
          {/* Section 1 – Pile Information */}
          <section className="card p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
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

          {/* Section 2 – Soil Layers */}
          {layers.length > 0 && (
            <section className="card p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
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

          {/* Section 3 – Pile Tip */}
          {layers.length > 0 && (
            <section className="card p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end no-print">
            <button className="btn-secondary font-semibold" onClick={handleReset} disabled={loading}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Form
            </button>
            <button
              className="btn-primary font-semibold"
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

        {/* Right sticky live summary panel */}
        <div className="lg:sticky lg:top-20 no-print self-start">
          <LiveSummaryPanel
            diameter={diameter}
            layers={layers}
            results={reports.length > 0 ? {
              layerResults: reports[reports.length - 1].calculations,
              Qp: reports[reports.length - 1].outputs.Qp,
              Qu: reports[reports.length - 1].outputs.Qu,
              Qa: reports[reports.length - 1].outputs.Qa
            } : null}
          />
        </div>
      </div>

      {/* Results Section */}
      {reports.length > 0 && (
        <section id="results-section" className="mt-8 flex flex-col gap-8 animate-slide-up w-full max-w-full min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3 no-print">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Calculation Results</h2>
              <p className="text-xs text-slate-500">
                {reports.length} report{reports.length !== 1 ? 's' : ''} generated
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadCombinedPDF}
                className="btn-primary py-2 px-4 text-xs bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
              >
                Combined PDF
              </button>
              <button
                onClick={handleDownloadCombinedExcel}
                className="btn-secondary py-2 px-4 text-xs text-primary-600 border-primary-600 hover:bg-primary-50 flex items-center gap-2"
              >
                📊 Combined Excel
              </button>
              <button
                onClick={handleClearAll}
                className="btn-secondary py-2 px-4 text-xs text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-2"
              >
                Clear All
              </button>
            </div>
          </div>

          <ComparisonGrid compareMode={compareMode}>
            {reports.map((report) => (
              <div 
                key={report.id} 
                id={`report-container-${report.id}`} 
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative flex flex-col gap-6 w-full max-w-full min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      PILE CAPACITY REPORT #{report.reportNumber}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Generated on: {new Date(report.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 no-print flex-wrap">
                    <button
                      onClick={() => handleCopyInputs(report)}
                      className="btn-secondary py-1 px-3 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      title="Copy this report's inputs back to the form for tweaking"
                    >
                      Copy Inputs
                    </button>
                    <button
                      onClick={() => handleDownloadPDFReport(report)}
                      className="btn-secondary py-1 px-3 text-xs"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownloadExcelReport(report)}
                      className="btn-secondary py-1 px-3 text-xs text-primary-600 border-primary-200 hover:bg-primary-50"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => handlePrintReport(report.id)}
                      className="btn-secondary py-1 px-3 text-xs"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="btn-secondary py-1 px-3 text-xs text-red-500 border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <Suspense fallback={<div className="p-4 text-center text-xs text-slate-500">Loading analysis table...</div>}>
                  <ResultsTable
                    reportId={report.id}
                    reportNumber={report.reportNumber}
                    layerResults={report.calculations}
                    layers={report.inputs.layers}
                    diameter={report.diameter}
                    Qp={report.outputs.Qp}
                    Qu={report.outputs.Qu}
                    Qa={report.outputs.Qa}
                  />
                </Suspense>
              </div>
            ))}
          </ComparisonGrid>

          <div className="card p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-blue-600">
                Diameter Comparison Summary
              </h3>
              <ExportButtons
                excelData={comparisonExportRows}
                fileName="Diameter_Comparison_Summary"
                sheetName="Comparison"
                disabled={!comparisonExportRows.length}
                theme="indigo"
              />
            </div>
            <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className={ENGINEERING_TABLE.header}>
                  <tr>
                    <th className={ENGINEERING_TABLE.headerCell}>Report</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Diameter (m)</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Pile Length (m)</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Qs (kN)</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Qp (kN)</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Qu (kN)</th>
                    <th className={ENGINEERING_TABLE.headerCell}>Qa (kN)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {comparisonRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-r border-slate-200">Report #{row.number}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 border-r border-slate-200">{formatEngineeringNumber(row.diameter)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 border-r border-slate-200">{formatEngineeringNumber(row.pileLength)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 border-r border-slate-200">{formatEngineeringNumber(row.qs)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 border-r border-slate-200">{formatEngineeringNumber(row.qp)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-800 border-r border-slate-200">{formatEngineeringNumber(row.qu)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">{formatEngineeringNumber(row.qa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
