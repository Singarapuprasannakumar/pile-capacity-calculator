import React, { useState, useEffect, useCallback } from 'react';
import SBCForm from './SBCForm';
import SBCLiveSummary from './SBCLiveSummary';
import SBCResultsTable from './SBCResultsTable';
import SBCExportButtons from './SBCExportButtons';
import AlertBanner from '../common/AlertBanner';
import Card from '../common/Card';
import ComparisonGrid from '../common/ComparisonGrid';
import { calculateSbc } from '../../api/sbcApi';
import { generateReportId } from '../../utils/engineeringUtils';
import { Plus, Trash2, Layers, HelpCircle, FileText } from 'lucide-react';

const defaultInputs = () => ({
  trialPit: 'TP-1',
  D: '1.5',
  B: '2.0',
  L: '3.0',
  cohesion: '20.0',
  phi: '30.0',
  wt: '2.0',
  footingType: 'square',
  failureType: 'general',
  gamma: '18.0',
  gammaSub: '8.5',
  alpha: '0.0',
  FS: '2.5'
});

export default function SBCCalculator() {
  const [inputs, setInputs] = useState(defaultInputs());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportsCounter, setReportsCounter] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [alert, setAlert] = useState(null);

  // ── Restore previous session if ?resume=true ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'true') {
      try {
        const stored = localStorage.getItem('last_sbc_calculation_inputs');
        if (stored) {
          setInputs(JSON.parse(stored));
          setAlert({
            type: 'success',
            title: 'Design Resumed',
            message: 'Your last calculated footing design has been loaded successfully.'
          });
        }
      } catch (e) {
        console.error('Error loading previous SBC session:', e);
      }
    }
  }, []);

  const handleInputChange = (field, val) => {
    setInputs((prev) => {
      const next = { ...prev, [field]: val };
      
      // Auto-adjust values if footing type changes
      if (field === 'footingType') {
        if (val === 'square' || val === 'circular' || val === 'strip') {
          next.L = next.B; // lock length to width
        }
      }
      return next;
    });

    // Clear validation error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!inputs.trialPit.trim()) errs.trialPit = 'Trial pit identifier is required.';
    
    const D = parseFloat(inputs.D);
    if (isNaN(D) || D < 0) errs.D = 'Depth must be a non-negative number.';
    
    const B = parseFloat(inputs.B);
    if (isNaN(B) || B <= 0) errs.B = 'Width must be greater than zero.';
    
    if (inputs.footingType === 'rectangular') {
      const L = parseFloat(inputs.L);
      if (isNaN(L) || L <= 0) errs.L = 'Length must be greater than zero.';
      if (L < B) errs.L = 'Length must be greater than or equal to Width.';
    }

    const cohesion = parseFloat(inputs.cohesion);
    if (isNaN(cohesion) || cohesion < 0) errs.cohesion = 'Cohesion must be non-negative.';

    const phi = parseFloat(inputs.phi);
    if (isNaN(phi) || phi < 0 || phi > 45) errs.phi = 'Friction angle must be between 0 and 45 degrees.';

    const wt = parseFloat(inputs.wt);
    if (isNaN(wt) || wt < 0) errs.wt = 'Water table depth must be non-negative.';

    const gamma = parseFloat(inputs.gamma);
    if (isNaN(gamma) || gamma < 0) errs.gamma = 'Bulk unit weight must be non-negative.';

    const gammaSub = parseFloat(inputs.gammaSub);
    if (isNaN(gammaSub) || gammaSub < 0) errs.gammaSub = 'Submerged unit weight must be non-negative.';

    const alpha = parseFloat(inputs.alpha);
    if (isNaN(alpha) || alpha < 0 || alpha > 90) errs.alpha = 'Inclination angle must be between 0 and 90 degrees.';

    const FS = parseFloat(inputs.FS);
    if (isNaN(FS) || FS <= 1.0) errs.FS = 'Factor of safety must be greater than 1.0.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setAlert({
        type: 'error',
        title: 'Validation Failed',
        message: 'Please resolve all highlighting errors before running the analysis.'
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        trialPit: inputs.trialPit,
        cohesion: parseFloat(inputs.cohesion),
        phi: parseFloat(inputs.phi),
        D: parseFloat(inputs.D),
        B: parseFloat(inputs.B),
        L: inputs.footingType === 'square' || inputs.footingType === 'circular' || inputs.footingType === 'strip'
          ? parseFloat(inputs.B)
          : parseFloat(inputs.L),
        wt: parseFloat(inputs.wt),
        footingType: inputs.footingType,
        failureType: inputs.failureType,
        gamma: parseFloat(inputs.gamma),
        gammaSub: parseFloat(inputs.gammaSub),
        alpha: parseFloat(inputs.alpha),
        FS: parseFloat(inputs.FS)
      };

      const response = await calculateSbc(payload);
      const resData = response.data;

      const nextNumber = compareMode ? reportsCounter + 1 : 1;
      const report = {
        id: generateReportId(),
        reportNumber: nextNumber,
        createdAt: new Date().toISOString(),
        inputs: resData.inputs,
        bearingFactors: resData.bearingFactors,
        correctionFactors: resData.correctionFactors,
        results: resData.results
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

      setActiveReportId(report.id);
      
      // Update local storage recent & resumes
      try {
        localStorage.setItem('last_sbc_calculation_inputs', JSON.stringify(inputs));
        
        // Also update saved reports count
        const totalGenerated = parseInt(localStorage.getItem('reports_generated_count') || '0', 10) + 1;
        localStorage.setItem('reports_generated_count', totalGenerated.toString());
      } catch (err) {
        console.error(err);
      }

      setAlert({
        type: 'success',
        title: 'Analysis Succeeded',
        message: `Report #${nextNumber} calculated successfully.`
      });

    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        title: 'API Server Error',
        message: err.friendlyMessage || 'The bearing capacity calculation service returned an error.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReport = (id, e) => {
    e.stopPropagation();
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    if (activeReportId === id) {
      setActiveReportId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const activeReport = reports.find((r) => r.id === activeReportId);

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      
      {alert && (
        <AlertBanner
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Mode selectors */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => {
                const checked = e.target.checked;
                setCompareMode(checked);
                if (!checked) {
                  // Keep only the active report or the last calculated report
                  if (reports.length > 1) {
                    const active = reports.find((r) => r.id === activeReportId) || reports[reports.length - 1];
                    setReports([active]);
                    setActiveReportId(active.id);
                  }
                }
              }}
              className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-bold text-slate-700">Enable Comparison Mode</span>
          </label>
        </div>

        {compareMode && reports.length > 0 && (
          <SBCExportButtons reportOrReports={reports} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start w-full max-w-full min-w-0">
        
        {/* Left Side: Input Form & Results */}
        <div className="space-y-6 w-full min-w-0">
          <Card title="Footing Parameters Input">
            <SBCForm
              values={inputs}
              errors={errors}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </Card>

          {/* Individual Report Results */}
          {!compareMode && activeReport && (
            <Card
              title={`Report Details — Pit #${activeReport.inputs.trialPit}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Report Export Options
                </span>
                <SBCExportButtons reportOrReports={activeReport} />
              </div>
              <SBCResultsTable report={activeReport} />
            </Card>
          )}

          {/* Comparison Mode side-by-side table */}
          {compareMode && reports.length > 0 && (
            <Card title="Comparison Summary Table">
              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full border-collapse">
                  <thead className="bg-blue-600 text-white uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-2 border border-blue-700">Report</th>
                      <th className="px-4 py-2 border border-blue-700">Trial Pit</th>
                      <th className="px-4 py-2 border border-blue-700">Type</th>
                      <th className="px-4 py-2 border border-blue-700">D (m)</th>
                      <th className="px-4 py-2 border border-blue-700">B (m)</th>
                      <th className="px-4 py-2 border border-blue-700">L (m)</th>
                      <th className="px-4 py-2 border border-blue-700">Nc</th>
                      <th className="px-4 py-2 border border-blue-700">Nq</th>
                      <th className="px-4 py-2 border border-blue-700">Nr</th>
                      <th className="px-4 py-2 border border-blue-700">Ult (kN/m²)</th>
                      <th className="px-4 py-2 border border-blue-700">Safe (kN/m²)</th>
                      <th className="px-4 py-2 border border-blue-700">Safe (t/m²)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setActiveReportId(r.id)}
                        className={`cursor-pointer hover:bg-slate-50 transition ${
                          activeReportId === r.id ? 'bg-blue-50/70 font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-2 border border-slate-200 text-center">#{r.reportNumber}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center">{r.inputs.trialPit}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center capitalize">{r.inputs.footingType}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center">{parseFloat(r.inputs.D).toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center">{parseFloat(r.inputs.B).toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center">{parseFloat(r.inputs.L).toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center font-bold">{r.bearingFactors.Nc.toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center font-bold">{r.bearingFactors.Nq.toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-center font-bold">{r.bearingFactors.Nr.toFixed(2)}</td>
                        <td className="px-4 py-2 border border-slate-200 text-right font-bold text-slate-700">
                          {r.results.ultimateBearingCapacity.toFixed(1)}
                        </td>
                        <td className="px-4 py-2 border border-slate-200 text-right font-bold text-emerald-700">
                          {r.results.safeBearingCapacity.toFixed(1)}
                        </td>
                        <td className="px-4 py-2 border border-slate-200 text-right font-bold text-indigo-700">
                          {r.results.safeBearingCapacityTon.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Comparison Mode Individual Report Cards */}
          {compareMode && reports.length > 0 && (
            <ComparisonGrid compareMode={compareMode}>
              {reports.map((report) => (
                <Card
                  key={report.id}
                  title={`Report Details — Pit #${report.inputs.trialPit} (Report #${report.reportNumber})`}
                  className="min-w-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Report Export Options
                    </span>
                    <SBCExportButtons reportOrReports={report} />
                  </div>
                  <SBCResultsTable report={report} />
                </Card>
              ))}
            </ComparisonGrid>
          )}

        </div>

        {/* Right Side: Sticky Live Summary & Comparison sidebar list */}
        <div className="space-y-6 sticky top-6 self-start">
          
          <SBCLiveSummary values={inputs} />

          {/* Comparison sidebar manager */}
          {compareMode && reports.length > 0 && (
            <Card title="Active Trials Comparison">
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveReportId(r.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition ${
                      activeReportId === r.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">Report #{r.reportNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({r.inputs.trialPit})</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveReport(r.id, e)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                      title="Delete calculation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
