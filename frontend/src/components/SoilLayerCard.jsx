import FormField from './FormField';
import Tooltip from './Tooltip';

/**
 * Renders the form for a single soil layer.
 * Props:
 *  - index      : number (0-based)
 *  - layer      : object (current layer values)
 *  - onChange   : fn(index, field, value)
 *  - errors     : object (field→message)
 *  - diameter   : number (pile diameter, used to compute L/D)
 */
const SoilLayerCard = ({ index, layer, onChange, errors = {}, diameter }) => {
  const isClay = layer.soilType === 'clay';
  const isSand = layer.soilType === 'sand';

  // Compute L/D ratio: use cumulative depth (layer thickness) / diameter
  const thickness = parseFloat(layer.thickness) || 0;
  const d = parseFloat(diameter) || 1;
  const ld = thickness / d;
  const ldLow = ld < 15; // true → L/D < 15

  const set = (field) => (e) => onChange(index, field, e.target.value);

  const soilColors = {
    clay: 'from-amber-50 to-orange-50 border-amber-200',
    sand: 'from-yellow-50 to-amber-50 border-yellow-200',
    '': 'from-slate-50 to-slate-50 border-slate-200',
  };
  const colorClass = soilColors[layer.soilType] || soilColors[''];

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-5 transition-all duration-300 animate-fade-in`}
    >
      {/* Layer Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Layer {index + 1}</h3>
            {layer.soilType && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isClay
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {isClay ? '🏔 Clay' : '🏜 Sand'}
              </span>
            )}
          </div>
        </div>
        {isSand && (
          <div
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              ldLow
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            L/D {ldLow ? '< 15' : '≥ 15'} &nbsp;({ld.toFixed(2)})
          </div>
        )}
      </div>

      {/* Row 1: Soil Type + Thickness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Soil Type */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`layer-${index}-type`} className="form-label">
            Soil Type
          </label>
          <select
            id={`layer-${index}-type`}
            value={layer.soilType}
            onChange={set('soilType')}
            className={`form-select ${errors.soilType ? 'border-red-400' : ''}`}
          >
            <option value="">Select soil type…</option>
            <option value="clay">Clay</option>
            <option value="sand">Sand</option>
          </select>
          {errors.soilType && (
            <p className="text-xs text-red-500">{errors.soilType}</p>
          )}
        </div>

        {/* Thickness */}
        <FormField
          id={`layer-${index}-thickness`}
          label="Layer Thickness (m)"
          value={layer.thickness}
          onChange={set('thickness')}
          placeholder="e.g. 5.0"
          min={0}
          error={errors.thickness}
          tooltip="Vertical thickness of this soil stratum in metres."
        />
      </div>

      {/* ── CLAY fields ── */}
      {isClay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <FormField
            id={`layer-${index}-alpha`}
            label="Alpha (α)"
            value={layer.alpha}
            onChange={set('alpha')}
            placeholder="0 – 1"
            min={0}
            max={1}
            error={errors.alpha}
            tooltip="Adhesion factor (α) used in the α-method for clay shaft resistance. Typically 0.3–1.0 depending on cohesion."
          />
          <FormField
            id={`layer-${index}-cohesion`}
            label="Avg. Cohesion (kN/m²)"
            value={layer.cohesion}
            onChange={set('cohesion')}
            placeholder="e.g. 50"
            min={0}
            error={errors.cohesion}
            tooltip="Average undrained shear strength (Cu) of the clay layer. Used to compute unit shaft friction qs = α × Cu."
          />
        </div>
      )}

      {/* ── SAND fields ── */}
      {isSand && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* K and Phi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id={`layer-${index}-K`}
              label="K (Lateral Pressure Coeff.)"
              value={layer.K}
              onChange={set('K')}
              placeholder="e.g. 0.8"
              min={0}
              error={errors.K}
              tooltip="Coefficient of lateral earth pressure K = σh / σv. Ranges from K0 to about 1.4 depending on pile installation method."
            />
            <FormField
              id={`layer-${index}-phi`}
              label="Phi (φ) – Friction Angle (°)"
              value={layer.phi}
              onChange={set('phi')}
              placeholder="e.g. 30"
              min={0}
              max={45}
              error={errors.phi}
              tooltip="Interface friction angle between pile and soil (δ). Often taken as 0.75φ or from direct shear tests."
            />
          </div>

          {/* L/D < 15 → Overburden at Top & Bottom */}
          {ldLow && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <FormField
                id={`layer-${index}-ovTop`}
                label="Eff. Overburden at Top (kN/m²)"
                value={layer.ovTop}
                onChange={set('ovTop')}
                placeholder="e.g. 0"
                min={0}
                error={errors.ovTop}
                tooltip="Effective vertical stress at the top of this layer. σ'v = Σγ'·z for all layers above."
              />
              <FormField
                id={`layer-${index}-ovBottom`}
                label="Eff. Overburden at Bottom (kN/m²)"
                value={layer.ovBottom}
                onChange={set('ovBottom')}
                placeholder="e.g. 50"
                min={0}
                error={errors.ovBottom}
                tooltip="Effective vertical stress at the bottom of this layer. Used to compute average overburden for shaft friction."
              />
            </div>
          )}

          {/* L/D >= 15 → Bulk Unit Weight, WT Depth, Submerged Unit Weight */}
          {!ldLow && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <FormField
                id={`layer-${index}-bulkUnit`}
                label="Bulk Unit Weight (kN/m³)"
                value={layer.bulkUnit}
                onChange={set('bulkUnit')}
                placeholder="e.g. 18"
                min={0}
                error={errors.bulkUnit}
                tooltip="Total (bulk) unit weight of soil above water table. Typically 17–21 kN/m³ for sand."
              />
              <FormField
                id={`layer-${index}-waterTableDepth`}
                label="Water Table Depth (m)"
                value={layer.waterTableDepth}
                onChange={set('waterTableDepth')}
                placeholder="e.g. 3.0"
                min={0}
                error={errors.waterTableDepth}
                tooltip="Depth from the ground surface to the water table. Used to split the layer into dry and submerged portions."
              />
              <FormField
                id={`layer-${index}-submergedUnit`}
                label="Submerged Unit Weight (kN/m³)"
                value={layer.submergedUnit}
                onChange={set('submergedUnit')}
                placeholder="e.g. 9"
                min={0}
                error={errors.submergedUnit}
                tooltip="Buoyant (effective) unit weight below the water table. γ' = γsat − γw ≈ 8–12 kN/m³."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SoilLayerCard;
