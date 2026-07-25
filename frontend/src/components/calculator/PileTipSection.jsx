import React from 'react';
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

  if (!lastSoilType) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-500 italic">
        Select a soil type for the last layer to configure tip parameters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Informational Banner */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 font-medium">
        Bearing Layer Type: <span className="font-bold uppercase">{lastSoilType}</span>. End bearing capacity (Qp) calculation method automatically selected.
      </div>

      {isClay && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          <FormField
            id="tip-cohesion"
            label="Cohesion at Tip (kN/m²)"
            value={tipData.cohesion}
            onChange={set('cohesion')}
            placeholder="e.g. 80"
            min={0}
            error={errors.cohesion}
            tooltip="Undrained cohesion (Cu) at the base of the pile. Used to compute unit end bearing qp = Nc × Cu where Nc is typically 9."
          />
        </div>
      )}

      {isSand && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <FormField
            id="tip-overburden"
            label="Eff. Overburden at Tip (kN/m²)"
            value={tipData.overburden}
            onChange={set('overburden')}
            placeholder="e.g. 100"
            min={0}
            error={errors.overburden}
            tooltip="Effective vertical stress (σ'v) at the pile base. Computed as cumulative effective overburden of all layers."
          />
          <FormField
            id="tip-nq"
            label="Bearing Capacity Factor (Nq)"
            value={tipData.nq}
            onChange={set('nq')}
            placeholder="e.g. 40"
            min={1}
            error={errors.nq}
            tooltip="Bearing capacity factor Nq based on friction angle φ. Ranges from about 15 to over 100 depending on φ and design code."
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(PileTipSection);
