import React, { useState, useEffect } from 'react';
import UnderReamedPileForm from './UnderReamedPileForm';
import UnderReamedPileLiveSummary from './UnderReamedPileLiveSummary';
import UnderReamedPileResultsTable from './UnderReamedPileResultsTable';
import UnderReamedPileExportButtons from './UnderReamedPileExportButtons';
import AlertBanner from '../common/AlertBanner';
import Card from '../common/Card';
import ComparisonGrid from '../common/ComparisonGrid';
import { calculateUnderReamedPile } from '../../api/underReamedApi';
import { generateReportId } from '../../utils/engineeringUtils';
import { Plus, Trash2, ShieldCheck, Zap, Info, FileText } from 'lucide-react';

const defaultInputs = () => ({
  trialPit: 'BH-01',
  D: '0.30',
  Cp: '50.0',
  Ca_dash: '40.0',
  Ca: '30.0'
});

export default function UnderReamedPileCalculator() {
  const [inputs, setInputs] = useState(defaultInputs());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportsCounter, setReportsCounter] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [alert, setAlert] = useState(null);

  // Resume last session if url contains ?resume=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'true') {
      try {
        const stored = localStorage.getItem('last_under_reamed_inputs');
        if (stored) {
          setInputs(JSON.parse(stored));
          setAlert({
            type: 'success',
            title: 'Design Resumed',
            message: 'Your last analyzed under-reamed pile inputs have been loaded successfully.'
          });
        }
      } catch (e) {
        console.error('Error loading previous under-reamed session:', e);
      }
    }
  }, []);

  const handleInputChange = (field, val) => {
    setInputs((prev) => ({
      ...prev,
      [field]: val
    }));

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
    if (!inputs.trialPit.trim()) {
      errs.trialPit = 'Borehole / Trial Pit identifier is required.';
    }

    const D = parseFloat(inputs.D);
    if (isNaN(D) || D <= 0) {
      errs.D = 'Stem diameter (D) must be greater than zero.';
    }

    const Cp = parseFloat(inputs.Cp);
    if (isNaN(Cp) || Cp < 0) {
      errs.Cp = 'Cohesion at tip (Cp) must be a non-negative number.';
    }

    const Ca_dash = parseFloat(inputs.Ca_dash);
    if (isNaN(Ca_dash) || Ca_dash < 0) {
      errs.Ca_dash = 'Cohesion at bulb level (Ca\') must be a non-negative number.';
    }

    const Ca = parseFloat(inputs.Ca);
    if (isNaN(Ca) || Ca < 0) {
      errs.Ca = 'Cohesion along stem (Ca) must be a non-negative number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setAlert({
        type: 'error',
        title: 'Validation Failed',
        message: 'Please correct all highlighting errors in the form before running analysis.'
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        trialPit: inputs.trialPit,
        D: parseFloat(inputs.D),
        Cp: parseFloat(inputs.Cp),
        Ca_dash: parseFloat(inputs.Ca_dash),
        Ca: parseFloat(inputs.Ca)
      };

      const resData = await calculateUnderReamedPile(payload);

      const nextNumber = compareMode ? reportsCounter + 1 : 1;
      const report = {
        id: generateReportId(),
        reportNumber: nextNumber,
        createdAt: new Date().toISOString(),
        inputs: resData.inputs,
        geometry: resData.geometry,
        capacity: resData.capacity,
        engineeringNotes: resData.engineeringNotes
      };

      // Save inputs locally for resume functionality
      localStorage.setItem('last_under_reamed_inputs', JSON.stringify(inputs));

      if (compareMode) {
        setReports((prev) => [...prev, report]);
        setActiveReportId(report.id);
        setReportsCounter((prev) => prev + 1);
      } else {
        setReports([report]);
        setActiveReportId(report.id);
        setReportsCounter(1);
      }

      setAlert({
        type: 'success',
        title: 'Calculation Completed',
        message: `Capacity calculations finished successfully for Borehole ID: ${report.inputs.trialPit}`
      });

    } catch (error) {
      console.error('Error running pile analysis:', error);
      setAlert({
        type: 'error',
        title: 'Analysis Error',
        message: error.response?.data?.detail || 'An error occurred during calculations. Check console logs.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setInputs(defaultInputs());
    setErrors({});
    setReports([]);
    setActiveReportId(null);
    setReportsCounter(0);
    setAlert(null);
  };

  const activeReport = reports.find((r) => r.id === activeReportId);

  // Grouped comparison cards configuration for ComparisonGrid
  const getComparisonCards = () => {
    return reports.map((r) => ({
      id: r.id,
      title: `Trial #${r.reportNumber} (${r.inputs.trialPit})`,
      subtitle: `D = ${r.inputs.D.toFixed(2)}m`,
      metrics: [
        { label: 'Ultimate Capacity (Qu)', value: `${r.capacity.Qu.toFixed(2)} kN` },
        { label: 'Allowable Capacity (Qa)', value: `${r.capacity.Qa.toFixed(2)} kN` },
        { label: 'Total Capacity (Qa_total)', value: `${r.capacity.Qa_total.toFixed(2)} kN` },
        { label: 'Capacity Increase', value: `${r.capacity.Qa_increase.toFixed(2)} kN` }
      ],
      details: [
        { label: 'Under-Ream Diameter (Du)', value: `${r.geometry.Du.toFixed(3)} m` },
        { label: 'Bulb Height (L1)', value: `${r.geometry.L1.toFixed(3)} m` },
        { label: 'Shaft Area (As)', value: `${r.geometry.As.toFixed(3)} m²` },
        { label: 'Additional Friction', value: `${r.capacity.additionalShaftFriction.toFixed(2)} kN` }
      ],
      onDelete: () => {
        setReports((prev) => prev.filter((rep) => rep.id !== r.id));
        if (activeReportId === r.id) {
          const remaining = reports.filter((rep) => rep.id !== r.id);
          setActiveReportId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        }
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-full">
      
      {/* ── Top Dashboard Control Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => {
                setCompareMode(e.target.checked);
                setAlert(null);
                if (!e.target.checked && reports.length > 1) {
                  // Keep only the last report when toggling back
                  const last = reports[reports.length - 1];
                  setReports([last]);
                  setActiveReportId(last.id);
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enable Multi-Trial Comparison Mode</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          {compareMode && (
            <button
              onClick={() => {
                setInputs(defaultInputs());
                setErrors({});
                setAlert(null);
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition"
            >
              <Plus className="w-4 h-4 mr-1 shrink-0" />
              Add New Trial Parameters
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            <Trash2 className="w-4 h-4 mr-1 shrink-0" />
            Reset Form
          </button>
        </div>
      </div>

      {alert && (
        <AlertBanner
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ── main content layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-full">
        
        {/* Left Side: Input Form & Results */}
        <div className="space-y-6 w-full lg:col-span-8 min-w-0">
          <Card title="Under-Reamed Pile Design Parameters (IS 2911 Part 3)">
            <UnderReamedPileForm
              values={inputs}
              errors={errors}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </Card>

          {/* Individual Report Results */}
          {!compareMode && activeReport && (
            <Card title={`Calculation Results — Borehole ID: ${activeReport.inputs.trialPit}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Export Reports Toolbar
                </span>
                <UnderReamedPileExportButtons reportOrReports={activeReport} />
              </div>
              <UnderReamedPileResultsTable report={activeReport} />
              
              {/* Engineering Notes Section */}
              <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-4 h-4 text-indigo-500" />
                  Engineering Calculation Notes (IS 2911 Part 3)
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Bearing Capacity Factor (Nc):</strong> A static Nc = {activeReport.engineeringNotes.bearingCapacityFactorNc} was applied at both the pile base and bulb.</li>
                  <li><strong>Adhesion Factor (alpha):</strong> A default skin friction alpha = {activeReport.engineeringNotes.adhesionFactorAlpha} was applied along the stem.</li>
                  <li><strong>Factor of Safety (FS):</strong> A factor of safety FS = {activeReport.engineeringNotes.factorOfSafetyFS} was used to calculate safe capacities.</li>
                  <li><strong>Bulb Height Selection:</strong> Determined using formula: <em>{activeReport.engineeringNotes.bulbHeightFormula}</em></li>
                  <li><strong>Critical Length (L):</strong> Calculated as: <em>L = max(2 * Du, 1.75) = {activeReport.engineeringNotes.criticalLengthL} m</em></li>
                  <li><strong>Stem Extension (Le):</strong> A standard shaft extension length Le = {activeReport.engineeringNotes.shaftExtensionLe} m was considered below the bulb for additional tip friction calculations.</li>
                </ul>
              </div>
            </Card>
          )}

          {/* Comparison Mode Summary Table */}
          {compareMode && reports.length > 0 && (
            <Card title="Comparison Summary Table">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Export Combined Reports
                </span>
                <UnderReamedPileExportButtons reportOrReports={reports} />
              </div>

              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead className="bg-indigo-600 text-white uppercase font-semibold border-b">
                    <tr>
                      <th className="px-4 py-3">Report</th>
                      <th className="px-4 py-3">Borehole ID</th>
                      <th className="px-4 py-3 text-right">D (m)</th>
                      <th className="px-4 py-3 text-right">Cp (kPa)</th>
                      <th className="px-4 py-3 text-right">Ca\' (kPa)</th>
                      <th className="px-4 py-3 text-right">Ca (kPa)</th>
                      <th className="px-4 py-3 text-right">Qu (kN)</th>
                      <th className="px-4 py-3 text-right">Qa (kN)</th>
                      <th className="px-4 py-3 text-right">Qa_total (kN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setActiveReportId(r.id)}
                        className={`cursor-pointer hover:bg-slate-50 transition ${
                          activeReportId === r.id ? 'bg-indigo-50/70 font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5">#{r.reportNumber}</td>
                        <td className="px-4 py-2.5 font-medium">{r.inputs.trialPit || '–'}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.inputs.D.toFixed(3)}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.inputs.Cp.toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.inputs.Ca_dash.toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{r.inputs.Ca.toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold">{r.capacity.Qu.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">{r.capacity.Qa.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-extrabold text-emerald-600">{r.capacity.Qa_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Comparison Cards Grid */}
          {compareMode && reports.length > 0 && (
            <div className="no-print">
              <ComparisonGrid
                title="Under-Reamed Pile Design Comparison"
                cards={getComparisonCards()}
                activeId={activeReportId}
                onSelect={(id) => setActiveReportId(id)}
              />
            </div>
          )}

        </div>

        {/* Right Side: Sticky Live Summary & Diagram */}
        <div className="w-full lg:col-span-4 sticky top-6 self-start space-y-6">
          <UnderReamedPileLiveSummary values={inputs} />
        </div>

      </div>

    </div>
  );
}
