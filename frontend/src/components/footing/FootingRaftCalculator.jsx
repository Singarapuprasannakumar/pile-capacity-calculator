import React, { useState, useEffect } from 'react';
import FootingRaftForm from './FootingRaftForm';
import FootingRaftLiveSummary from './FootingRaftLiveSummary';
import FootingRaftResultsTable from './FootingRaftResultsTable';
import FootingRaftExportButtons from './FootingRaftExportButtons';
import AlertBanner from '../common/AlertBanner';
import Card from '../common/Card';
import ComparisonGrid from '../common/ComparisonGrid';
import { calculateFooting } from '../../api/footingApi';
import { generateReportId } from '../../utils/engineeringUtils';
import { Plus, Trash2, Layers, HelpCircle, FileText } from 'lucide-react';

const defaultInputs = () => ({
  trialPit: 'TP-1',
  D: '1.5',
  B: '2.0',
  S: '25.0',
  N2: '15',
  Zw2: '1.0',
  foundationType: 'isolated'
});

export default function FootingRaftCalculator() {
  const [inputs, setInputs] = useState(defaultInputs());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportsCounter, setReportsCounter] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [alert, setAlert] = useState(null);

  // Restore previous session if ?resume=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'true') {
      try {
        const stored = localStorage.getItem('last_footing_calculation_inputs');
        if (stored) {
          setInputs(JSON.parse(stored));
          setAlert({
            type: 'success',
            title: 'Design Resumed',
            message: 'Your last calculated footing & raft design has been loaded successfully.'
          });
        }
      } catch (e) {
        console.error('Error loading previous footing session:', e);
      }
    }
  }, []);

  const handleInputChange = (field, val) => {
    setInputs((prev) => ({
      ...prev,
      [field]: val
    }));

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
    
    const S = parseFloat(inputs.S);
    if (isNaN(S) || S <= 0) errs.S = 'Allowable settlement must be greater than zero.';

    const N2 = parseFloat(inputs.N2);
    if (isNaN(N2) || N2 < 0) errs.N2 = 'Corrected N value must be non-negative.';

    const Zw2 = parseFloat(inputs.Zw2);
    if (isNaN(Zw2) || Zw2 < 0) errs.Zw2 = 'Water table depth Zw2 must be non-negative.';

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
        foundationType: inputs.foundationType,
        D: parseFloat(inputs.D),
        B: parseFloat(inputs.B),
        S: parseFloat(inputs.S),
        N2: parseFloat(inputs.N2),
        Zw2: parseFloat(inputs.Zw2)
      };

      const resData = await calculateFooting(payload);

      const nextNumber = compareMode ? reportsCounter + 1 : 1;
      const report = {
        id: generateReportId(),
        reportNumber: nextNumber,
        createdAt: new Date().toISOString(),
        inputs: resData.inputs,
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
        localStorage.setItem('last_footing_calculation_inputs', JSON.stringify(inputs));
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
        message: err.response?.data?.detail || 'The footing capacity calculation service returned an error.'
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
          <FootingRaftExportButtons reportOrReports={reports} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start w-full max-w-full min-w-0">
        
        {/* Left Side: Input Form & Results */}
        <div className="space-y-6 w-full min-w-0">
          <Card title="Footing & Raft Parameters Input">
            <FootingRaftForm
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
                <FootingRaftExportButtons reportOrReports={activeReport} />
              </div>
              <FootingRaftResultsTable report={activeReport} />
            </Card>
          )}

          {/* Comparison Mode Summary Table */}
          {compareMode && reports.length > 0 && (
            <Card title="Comparison Summary Table">
              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full border-collapse">
                  <thead className="bg-amber-600 text-white uppercase text-xs font-semibold tracking-wider text-left">
                    <tr>
                      <th className="px-4 py-3 border border-amber-700">Report</th>
                      <th className="px-4 py-3 border border-amber-700">Trial Pit</th>
                      <th className="px-4 py-3 border border-amber-700">Type</th>
                      <th className="px-4 py-3 border border-amber-700">Df (m)</th>
                      <th className="px-4 py-3 border border-amber-700">B (m)</th>
                      <th className="px-4 py-3 border border-amber-700">S (mm)</th>
                      <th className="px-4 py-3 border border-amber-700">N''</th>
                      <th className="px-4 py-3 border border-amber-700">Zw2 (m)</th>
                      <th className="px-4 py-3 border border-amber-700 text-right">Cd</th>
                      <th className="px-4 py-3 border border-amber-700 text-right">Rw2</th>
                      <th className="px-4 py-3 border border-amber-700 text-right">Net Safe (kN/m²)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setActiveReportId(r.id)}
                        className={`cursor-pointer hover:bg-slate-50 transition ${
                          activeReportId === r.id ? 'bg-amber-50/70 font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 border border-slate-200">#{r.reportNumber}</td>
                        <td className="px-4 py-2.5 border border-slate-200">{r.inputs.trialPit}</td>
                        <td className="px-4 py-2.5 border border-slate-200 capitalize">
                          {r.inputs.foundationType === 'isolated' ? 'Isolated' : 'Raft'}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.D).toFixed(2)}</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.B).toFixed(2)}</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.S).toFixed(1)}</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.N2)}</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.Zw2).toFixed(2)}</td>
                        <td className="px-4 py-2.5 border border-slate-200 text-right font-bold text-slate-700 tabular-nums">
                          {r.correctionFactors.Cd.toFixed(3)}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200 text-right font-bold text-slate-700 tabular-nums">
                          {r.correctionFactors.Rw2.toFixed(3)}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200 text-right font-extrabold text-emerald-700 tabular-nums">
                          {r.results.netSafeBearingPressure.toFixed(2)}
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
                    <FootingRaftExportButtons reportOrReports={report} />
                  </div>
                  <FootingRaftResultsTable report={report} />
                </Card>
              ))}
            </ComparisonGrid>
          )}

        </div>

        {/* Right Side: Sticky Live Summary & Comparison sidebar list */}
        <div className="space-y-6 sticky top-6 self-start">
          
          <FootingRaftLiveSummary values={inputs} />

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
                        ? 'border-amber-500 bg-amber-50/50'
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
