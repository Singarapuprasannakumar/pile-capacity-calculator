import FormField from './FormField';

/**
 * Section 3 – Pile Tip inputs.
 * Automatically adapts based on the last soil layer's type.
 * Props:
 *  - tipData    : object (current tip values)
 *  - onChange   : fn(field, value)
 *  - lastSoilType : 'clay' | 'sand' | ''
 *  - errors     : object
 */
const PileTipSection = ({ tipData, onChange, lastSoilType, errors = {} }) => {
  const set = (field) => (e) => onChange(field, e.target.value);
  const isClay = lastSoilType === 'clay';
  const isSand = lastSoilType === 'sand';

  const detectedLabel =
    lastSoilType === 'clay'
      ? '🏔 Clay'
      : lastSoilType === 'sand'
      ? '🏜 Sand'
      : '—';

  return (
    <div className="flex flex-col gap-5">
      {/* Detected Tip Soil */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-slate-600">
          Pile tip is resting in{' '}
          <span className="font-semibold text-slate-800">{detectedLabel}</span>{' '}
          (auto-detected from last layer)
        </span>
      </div>

      {!lastSoilType && (
        <p className="text-sm text-slate-500 italic text-center py-4">
          Add at least one soil layer to configure pile tip parameters.
        </p>
      )}

      {/* Clay Tip Fields */}
      {isClay && (
        <div className="animate-fade-in">
          <FormField
            id="tip-cohesion"
            label="Cohesion at Pile Tip (kN/m²)"
            value={tipData.cohesion}
            onChange={set('cohesion')}
            placeholder="e.g. 80"
            min={0}
            error={errors.cohesion}
            tooltip="Undrained shear strength at the pile tip level. End bearing Qp = 9 × Cu × Ap (Skempton's method for clay)."
          />
        </div>
      )}

      {/* Sand Tip Fields */}
      {isSand && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="tip-overburden"
              label="Effective Overburden at Tip (kN/m²)"
              value={tipData.overburden}
              onChange={set('overburden')}
              placeholder="Computed automatically on calculate..."
              min={0}
              disabled={true}
              error={errors.overburden}
              tooltip="Effective vertical stress σ'v at the pile tip depth. Automatically computed by the backend based on soil layer parameters and critical depth Dc."
            />
            <FormField
              id="tip-nq"
              label="Nq – Bearing Capacity Factor"
              value={tipData.nq}
              onChange={set('nq')}
              placeholder="Computed automatically on calculate..."
              min={0}
              disabled={true}
              error={errors.nq}
              tooltip="Dimensionless bearing capacity factor Nq for pile tip in sand. Automatically calculated by the backend using the Reissner-Vesic bearing capacity theory based on the friction angle of the last sand layer."
            />
          </div>
          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
            ℹ️ <strong>Auto-calculation:</strong> The effective stress at the tip and Nq are automatically computed by the backend using the defined soil profile layers. Any user inputs entered here will be ignored, and values will update upon clicking <strong>Calculate Capacity</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

export default PileTipSection;
