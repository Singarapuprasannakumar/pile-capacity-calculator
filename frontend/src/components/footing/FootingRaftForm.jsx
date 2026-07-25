import React from 'react';
import FormField from '../calculator/FormField';

export default function FootingRaftForm({
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
          <div className="flex flex-col gap-1">
            <label htmlFor="foundationType" className="form-label">
              Foundation Type
            </label>
            <select
              id="foundationType"
              value={values.foundationType}
              onChange={(e) => onChange('foundationType', e.target.value)}
              className="form-input bg-white"
            >
              <option value="isolated">Isolated Footing</option>
              <option value="raft">Raft Foundation</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section 2: Geometry ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          2. Foundation Geometry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Depth of Foundation, Df (m)"
            id="D"
            value={values.D}
            onChange={(e) => onChange('D', e.target.value)}
            placeholder="e.g. 1.5"
            error={errors.D}
            min="0"
            tooltip="Depth of foundation base below ground level."
          />
          <FormField
            label="Width of Foundation, B (m)"
            id="B"
            value={values.B}
            onChange={(e) => onChange('B', e.target.value)}
            placeholder="e.g. 2.0"
            error={errors.B}
            min="0.001"
            tooltip="Width of the foundation (shorter side)."
          />
        </div>
      </div>

      {/* ── Section 3: Design Parameters ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          3. Soil & Settlement Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Allowable Settlement, S (mm)"
            id="S"
            value={values.S}
            onChange={(e) => onChange('S', e.target.value)}
            placeholder="e.g. 25.0"
            error={errors.S}
            min="0.001"
            tooltip="Permissible settlement criteria in mm."
          />
          <FormField
            label="Corrected SPT Value, N''"
            id="N2"
            value={values.N2}
            onChange={(e) => onChange('N2', e.target.value)}
            placeholder="e.g. 15"
            error={errors.N2}
            min="0"
            tooltip="SPT value corrected for overburden and dilatancy."
          />
          <FormField
            label="Water Table below base, Zw2 (m)"
            id="Zw2"
            value={values.Zw2}
            onChange={(e) => onChange('Zw2', e.target.value)}
            placeholder="e.g. 1.0"
            error={errors.Zw2}
            min="0"
            tooltip="Depth of ground water table below the foundation base level."
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
