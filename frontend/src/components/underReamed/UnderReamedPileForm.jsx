import React from 'react';
import FormField from '../calculator/FormField';

export default function UnderReamedPileForm({
  values,
  errors,
  onChange,
  onSubmit,
  loading
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* ── Section 1: Trial Identification ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          1. Borehole / Trial Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Borehole / Trial Pit ID"
            id="trialPit"
            type="text"
            value={values.trialPit}
            onChange={(e) => onChange('trialPit', e.target.value)}
            placeholder="e.g. BH-01"
            error={errors.trialPit}
            tooltip="Name or identification code of the borehole/trial pit."
          />
        </div>
      </div>

      {/* ── Section 2: Pile Geometry ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          2. Stem Geometry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Stem Diameter, D (m)"
            id="D"
            type="number"
            value={values.D}
            onChange={(e) => onChange('D', e.target.value)}
            placeholder="e.g. 0.3"
            error={errors.D}
            min="0.1"
            step="0.05"
            tooltip="Diameter of the main concrete pile stem in metres. Typical values range from 0.2m to 0.5m."
          />
        </div>
      </div>

      {/* ── Section 3: Soil Strength Parameters ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          3. Soil Cohesion Parameters (Clayey Soil)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Cohesion at Pile Tip, Cp (kPa)"
            id="Cp"
            type="number"
            value={values.Cp}
            onChange={(e) => onChange('Cp', e.target.value)}
            placeholder="e.g. 50.0"
            error={errors.Cp}
            min="0"
            tooltip="Cohesion value of the clay layer supporting the pile base/tip."
          />
          <FormField
            label="Cohesion at Bulb Level, Ca' (kPa)"
            id="Ca_dash"
            type="number"
            value={values.Ca_dash}
            onChange={(e) => onChange('Ca_dash', e.target.value)}
            placeholder="e.g. 40.0"
            error={errors.Ca_dash}
            min="0"
            tooltip="Cohesion value at the level of the under-reamed bulb(s)."
          />
          <FormField
            label="Cohesion Along Stem, Ca (kPa)"
            id="Ca"
            type="number"
            value={values.Ca}
            onChange={(e) => onChange('Ca', e.target.value)}
            placeholder="e.g. 30.0"
            error={errors.Ca}
            min="0"
            tooltip="Average cohesion value along the pile stem for skin friction calculations."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Run Analysis</span>
          )}
        </button>
      </div>
    </form>
  );
}
