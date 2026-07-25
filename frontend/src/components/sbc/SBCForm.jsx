import React from 'react';
import FormField from '../calculator/FormField';

export default function SBCForm({
  values,
  errors,
  onChange,
  onSubmit,
  loading
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* ── Section 1: Trial Pit Information ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          1. Trial Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Trial Pit No."
            id="trialPit"
            type="text"
            value={values.trialPit}
            onChange={(e) => onChange('trialPit', e.target.value)}
            placeholder="e.g. TP-1"
            error={errors.trialPit}
            tooltip="Name or identification code of the trial pit/borehole."
          />
        </div>
      </div>

      {/* ── Section 2: Footing Geometry ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          2. Footing Geometry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Depth of Footing, D (m)"
            id="D"
            type="number"
            value={values.D}
            onChange={(e) => onChange('D', e.target.value)}
            placeholder="e.g. 1.5"
            error={errors.D}
            min="0"
            tooltip="Depth of foundation footing below ground surface in metres."
          />
          <FormField
            label="Width of Footing, B (m)"
            id="B"
            type="number"
            value={values.B}
            onChange={(e) => onChange('B', e.target.value)}
            placeholder="e.g. 2.0"
            error={errors.B}
            min="0.1"
            tooltip="Width of footing in metres."
          />
          <FormField
            label="Length of Footing, L (m)"
            id="L"
            type="number"
            value={values.L}
            onChange={(e) => onChange('L', e.target.value)}
            placeholder="e.g. 3.0"
            error={errors.L}
            min="0.1"
            disabled={values.footingType === 'circular' || values.footingType === 'square' || values.footingType === 'strip'}
            tooltip="Length of footing in metres (only used for rectangular footings)."
          />
        </div>
      </div>

      {/* ── Section 3: Footing & Shear Failure Types ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Footing Type Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. Footing Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'square', label: 'Square' },
              { id: 'rectangular', label: 'Rectangular' },
              { id: 'circular', label: 'Circular' },
              { id: 'strip', label: 'Strip' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                  values.footingType === opt.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="footingType"
                  value={opt.id}
                  checked={values.footingType === opt.id}
                  onChange={() => onChange('footingType', opt.id)}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Shear Failure Type Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            4. Shear Failure Criteria
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'general', label: 'General Shear' },
              { id: 'local', label: 'Local Shear' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                  values.failureType === opt.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="failureType"
                  value={opt.id}
                  checked={values.failureType === opt.id}
                  onChange={() => onChange('failureType', opt.id)}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* ── Section 4: Soil Properties ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          5. Soil & Groundwater Properties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            label="Cohesion, C (kN/m²)"
            id="cohesion"
            value={values.cohesion}
            onChange={(e) => onChange('cohesion', e.target.value)}
            placeholder="e.g. 20.0"
            error={errors.cohesion}
            min="0"
            tooltip="Soil cohesion intercept (c) in kN per square metre."
          />
          <FormField
            label="Friction Angle, φ (°)"
            id="phi"
            value={values.phi}
            onChange={(e) => onChange('phi', e.target.value)}
            placeholder="e.g. 30.0"
            error={errors.phi}
            min="0"
            max="45"
            tooltip="Internal angle of friction of the soil in degrees."
          />
          <FormField
            label="Bulk Unit Weight (kN/m³)"
            id="gamma"
            value={values.gamma}
            onChange={(e) => onChange('gamma', e.target.value)}
            placeholder="e.g. 18.0"
            error={errors.gamma}
            min="0"
            tooltip="Soil bulk unit weight above water table level."
          />
          <FormField
            label="Submerged Unit Wt (kN/m³)"
            id="gammaSub"
            value={values.gammaSub}
            onChange={(e) => onChange('gammaSub', e.target.value)}
            placeholder="e.g. 8.5"
            error={errors.gammaSub}
            min="0"
            tooltip="Soil submerged/buoyant unit weight below groundwater level."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <FormField
            label="Water Table Depth, wt (m)"
            id="wt"
            value={values.wt}
            onChange={(e) => onChange('wt', e.target.value)}
            placeholder="e.g. 2.0"
            error={errors.wt}
            min="0"
            tooltip="Depth of water table below ground surface level."
          />
          <FormField
            label="Load Inclination, α (°)"
            id="alpha"
            value={values.alpha}
            onChange={(e) => onChange('alpha', e.target.value)}
            placeholder="e.g. 0.0"
            error={errors.alpha}
            min="0"
            max="90"
            tooltip="Inclination of load relative to vertical axis in degrees."
          />
        </div>
      </div>

      {/* ── Section 5: Design Factor of Safety ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          6. Safety Factor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Factor of Safety (FS)"
            id="FS"
            value={values.FS}
            onChange={(e) => onChange('FS', e.target.value)}
            placeholder="e.g. 2.5"
            error={errors.FS}
            min="1.001"
            tooltip="Safety factor applied to net ultimate capacity (typically 2.5 or 3.0)."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
          }`}
        >
          {loading ? 'Calculating...' : 'Run Analysis'}
        </button>
      </div>

    </form>
  );
}
