import React from 'react';
import FormField from '../calculator/FormField';

export default function SoilClassificationForm({
  values,
  errors,
  onChange,
  onSubmit,
  loading
}) {
  const fines = parseFloat(values.fines) || 0;
  const gravel = parseFloat(values.gravel) || 0;
  
  // Calculate Sand automatically
  const sand = Math.max(0, 100 - fines - gravel);

  // Dynamic conditions
  const isCoarse = fines < 50;
  const showGravel = isCoarse;
  const showCuCc = isCoarse && (fines >= 5 && fines <= 12);
  const showWlWp = fines >= 50 || (isCoarse && fines >= 5);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* ── Section 1: Identification ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          1. Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Trial Pit / Borehole No."
            id="trialPit"
            type="text"
            value={values.trialPit || ''}
            onChange={(e) => onChange('trialPit', e.target.value)}
            placeholder="e.g. TP-1"
            error={errors.trialPit}
            tooltip="Name or identification code of the trial pit or borehole sample."
          />
        </div>
      </div>

      {/* ── Section 2: Grain Size Distribution ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          2. Grain Size Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Percentage of Fines (%)"
            id="fines"
            type="number"
            value={values.fines}
            onChange={(e) => onChange('fines', e.target.value)}
            placeholder="e.g. 15.0"
            error={errors.fines}
            min="0"
            max="100"
            step="0.01"
            tooltip="Percentage passing the 75-micron (No. 200) sieve."
          />

          {showGravel && (
            <FormField
              label="Percentage of Gravel (%)"
              id="gravel"
              type="number"
              value={values.gravel}
              onChange={(e) => onChange('gravel', e.target.value)}
              placeholder="e.g. 40.0"
              error={errors.gravel}
              min="0"
              max="100"
              step="0.01"
              tooltip="Percentage retained on the 4.75-mm (No. 4) sieve."
            />
          )}
        </div>

        {showGravel && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Automatically Calculated Sand:</span>
            <span className="font-bold font-mono text-emerald-700">{sand.toFixed(2)}%</span>
          </div>
        )}
      </div>

      {/* ── Section 3: Plasticity & Gradation ── */}
      { (showCuCc || showWlWp) && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. Engineering Limits & Coefficients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {showCuCc && (
              <>
                <FormField
                  label="Uniformity Coefficient (Cu)"
                  id="cu"
                  type="number"
                  value={values.cu}
                  onChange={(e) => onChange('cu', e.target.value)}
                  placeholder="e.g. 6.0"
                  error={errors.cu}
                  min="0.1"
                  step="0.1"
                  tooltip="Coefficient of uniformity, Cu = D60 / D10."
                />
                <FormField
                  label="Coefficient of Curvature (Cc)"
                  id="cc"
                  type="number"
                  value={values.cc}
                  onChange={(e) => onChange('cc', e.target.value)}
                  placeholder="e.g. 2.0"
                  error={errors.cc}
                  min="0.1"
                  step="0.1"
                  tooltip="Coefficient of curvature, Cc = (D30)² / (D10 * D60)."
                />
              </>
            )}

            {showWlWp && (
              <>
                <FormField
                  label="Liquid Limit, WL (%)"
                  id="wl"
                  type="number"
                  value={values.wl}
                  onChange={(e) => onChange('wl', e.target.value)}
                  placeholder="e.g. 45.0"
                  error={errors.wl}
                  min="0"
                  step="0.1"
                  tooltip="Water content at which soil transitions from plastic to liquid state."
                />
                <FormField
                  label="Plastic Limit, WP (%)"
                  id="wp"
                  type="number"
                  value={values.wp}
                  onChange={(e) => onChange('wp', e.target.value)}
                  placeholder="e.g. 20.0"
                  error={errors.wp}
                  min="0"
                  step="0.1"
                  tooltip="Water content at which soil transitions from semi-solid to plastic state."
                />
              </>
            )}

          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl text-white font-bold transition-all shadow-md ${
          loading 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {loading ? 'Processing Classification...' : 'Run Soil Classification'}
      </button>

    </form>
  );
}
