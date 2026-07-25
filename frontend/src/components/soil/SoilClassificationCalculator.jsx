import React, { useState, useEffect } from 'react';
import SoilClassificationForm from './SoilClassificationForm';
import SoilClassificationLiveSummary from './SoilClassificationLiveSummary';
import SoilClassificationResultsTable from './SoilClassificationResultsTable';
import SoilClassificationExportButtons from './SoilClassificationExportButtons';
import AlertBanner from '../common/AlertBanner';
import Card from '../common/Card';
import ComparisonGrid from '../common/ComparisonGrid';
import { classifySoil } from '../../api/soilApi';
import { generateReportId } from '../../utils/engineeringUtils';
import { Plus, Trash2, Layers, HelpCircle, FileText, Award } from 'lucide-react';

const defaultInputs = () => ({
  trialPit: 'TP-1',
  fines: '15.0',
  gravel: '40.0',
  wl: '35.0',
  wp: '20.0',
  cu: '6.0',
  cc: '2.0'
});

export default function SoilClassificationCalculator() {
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
        const stored = localStorage.getItem('last_soil_calculation_inputs');
        if (stored) {
          setInputs(JSON.parse(stored));
          setAlert({
            type: 'success',
            title: 'Design Resumed',
            message: 'Your last analyzed soil classification has been loaded successfully.'
          });
        }
      } catch (e) {
        console.error('Error loading previous soil session:', e);
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
    
    const fines = parseFloat(inputs.fines);
    if (isNaN(fines) || fines < 0 || fines > 100) {
      errs.fines = 'Fines percentage must be between 0 and 100.';
    }
    
    if (fines < 50) {
      const gravel = parseFloat(inputs.gravel);
      if (isNaN(gravel) || gravel < 0 || gravel > 100) {
        errs.gravel = 'Gravel percentage must be between 0 and 100.';
      }
      if (!isNaN(gravel) && !isNaN(fines) && (fines + gravel > 100)) {
        errs.gravel = 'Sum of fines and gravel cannot exceed 100%.';
      }
      
      if (fines >= 5 && fines <= 12) {
        const cu = parseFloat(inputs.cu);
        if (isNaN(cu) || cu <= 0) errs.cu = 'Uniformity coefficient must be greater than zero.';
        const cc = parseFloat(inputs.cc);
        if (isNaN(cc) || cc <= 0) errs.cc = 'Curvature coefficient must be greater than zero.';
      }
    }
    
    if (fines >= 50 || (fines >= 5)) {
      const wl = parseFloat(inputs.wl);
      if (isNaN(wl) || wl < 0) errs.wl = 'Liquid limit must be non-negative.';
      const wp = parseFloat(inputs.wp);
      if (isNaN(wp) || wp < 0) errs.wp = 'Plastic limit must be non-negative.';
      if (!isNaN(wl) && !isNaN(wp) && wp > wl) {
        errs.wp = 'Plastic limit cannot exceed liquid limit.';
      }
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
        message: 'Please resolve all highlighting errors before running soil classification.'
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const fines = parseFloat(inputs.fines);
      const payload = {
        fines: fines,
        trialPit: inputs.trialPit
      };

      if (fines < 50) {
        payload.gravel = parseFloat(inputs.gravel);
        if (fines >= 5 && fines <= 12) {
          payload.cu = parseFloat(inputs.cu);
          payload.cc = parseFloat(inputs.cc);
        }
      }

      if (fines >= 50 || (fines >= 5)) {
        payload.wl = parseFloat(inputs.wl);
        payload.wp = parseFloat(inputs.wp);
      }

      const resData = await classifySoil(payload);

      const nextNumber = compareMode ? reportsCounter + 1 : 1;
      const report = {
        id: generateReportId(),
        reportNumber: nextNumber,
        createdAt: new Date().toISOString(),
        inputs: resData.inputs,
        soilType: resData.soilType,
        groupSymbol: resData.groupSymbol,
        engineeringProperties: resData.engineeringProperties,
        notes: resData.notes
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
      
      try {
        localStorage.setItem('last_soil_calculation_inputs', JSON.stringify(inputs));
        const totalGenerated = parseInt(localStorage.getItem('reports_generated_count') || '0', 10) + 1;
        localStorage.setItem('reports_generated_count', totalGenerated.toString());
      } catch (err) {
        console.error(err);
      }

      setAlert({
        type: 'success',
        title: 'Classification Succeeded',
        message: `Soil sample classified successfully as group symbol: ${report.groupSymbol}.`
      });

    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        title: 'API Server Error',
        message: err.response?.data?.detail || 'The soil classification service returned an error.'
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
              className="rounded text-green-600 focus:ring-green-500 border-slate-300"
            />
            <span className="text-xs font-bold text-slate-700">Enable Comparison Mode</span>
          </label>
        </div>

        {compareMode && reports.length > 0 && (
          <SoilClassificationExportButtons reportOrReports={reports} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start w-full max-w-full min-w-0">
        
        {/* Left Side: Input Form & Results */}
        <div className="space-y-6 w-full min-w-0">
          <Card title="Soil Parameters Input (IS 1498 / ASTM D2487)">
            <SoilClassificationForm
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
              title={`Classification Details — Trial #${activeReport.inputs.trialPit}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Report Export Options
                </span>
                <SoilClassificationExportButtons reportOrReports={activeReport} />
              </div>
              <SoilClassificationResultsTable report={activeReport} />
            </Card>
          )}

          {/* Comparison Mode Summary Table */}
          {compareMode && reports.length > 0 && (
            <Card title="Comparison Summary Table">
              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full border-collapse">
                  <thead className="bg-green-700 text-white uppercase text-xs font-semibold tracking-wider text-left">
                    <tr>
                      <th className="px-4 py-3 border border-green-800">Report</th>
                      <th className="px-4 py-3 border border-green-800">Trial Pit</th>
                      <th className="px-4 py-3 border border-green-800">Symbol</th>
                      <th className="px-4 py-3 border border-green-800">Fines %</th>
                      <th className="px-4 py-3 border border-green-800">Gravel %</th>
                      <th className="px-4 py-3 border border-green-800 text-right">WL %</th>
                      <th className="px-4 py-3 border border-green-800 text-right">WP %</th>
                      <th className="px-4 py-3 border border-green-800">Permeability</th>
                      <th className="px-4 py-3 border border-green-800">Shear Strength</th>
                      <th className="px-4 py-3 border border-green-800">Compressibility</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setActiveReportId(r.id)}
                        className={`cursor-pointer hover:bg-slate-50 transition ${
                          activeReportId === r.id ? 'bg-green-50/70 font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 border border-slate-200">#{r.reportNumber}</td>
                        <td className="px-4 py-2.5 border border-slate-200">{r.inputs.trialPit || '–'}</td>
                        <td className="px-4 py-2.5 border border-slate-200 font-extrabold text-emerald-800">{r.groupSymbol}</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">{parseFloat(r.inputs.fines).toFixed(1)}%</td>
                        <td className="px-4 py-2.5 border border-slate-200 tabular-nums">
                          {r.inputs.gravel !== undefined ? `${parseFloat(r.inputs.gravel).toFixed(1)}%` : '–'}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200 text-right tabular-nums">
                          {r.inputs.wl !== undefined && r.inputs.wl !== null ? `${parseFloat(r.inputs.wl).toFixed(1)}%` : '–'}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200 text-right tabular-nums">
                          {r.inputs.wp !== undefined && r.inputs.wp !== null ? `${parseFloat(r.inputs.wp).toFixed(1)}%` : '–'}
                        </td>
                        <td className="px-4 py-2.5 border border-slate-200">{r.engineeringProperties.Permeability_when_Compacted}</td>
                        <td className="px-4 py-2.5 border border-slate-200">{r.engineeringProperties.Shearing_Strength_when_Compacted_and_Saturated}</td>
                        <td className="px-4 py-2.5 border border-slate-200">{r.engineeringProperties.Compressibility_when_Compacted_and_Saturated}</td>
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
                  title={`Classification Details — Trial #${report.inputs.trialPit} (Report #${report.reportNumber})`}
                  className="min-w-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-slate-100 no-print">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Report Export Options
                    </span>
                    <SoilClassificationExportButtons reportOrReports={report} />
                  </div>
                  <SoilClassificationResultsTable report={report} />
                </Card>
              ))}
            </ComparisonGrid>
          )}

        </div>

        {/* Right Side: Sticky Live Summary & Comparison sidebar list */}
        <div className="space-y-6 sticky top-6 self-start">
          
          <SoilClassificationLiveSummary values={inputs} />

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
                        ? 'border-green-500 bg-green-50/50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">Report #{r.reportNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({r.inputs.trialPit || '–'})</span>
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
