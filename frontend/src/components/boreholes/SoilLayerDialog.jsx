import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const SoilLayerDialog = ({ layer, layersCount, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    from_depth: '0.0',
    to_depth: '2.0',
    layer_order: '1',
    soil_type: 'clay',
    description: '',
    uscs_classification: '',
    is_1498_classification: '',
    aashto_classification: '',
    unit_weight: '',
    cohesion: '',
    friction_angle: '',
    moisture_content: '',
    permeability: '',
    color: '#8d6e63'
  });

  useEffect(() => {
    if (layer) {
      setFormData({
        from_depth: String(layer.from_depth),
        to_depth: String(layer.to_depth),
        layer_order: String(layer.layer_order),
        soil_type: layer.soil_type || 'clay',
        description: layer.description || '',
        uscs_classification: layer.uscs_classification || '',
        is_1498_classification: layer.is_1498_classification || '',
        aashto_classification: layer.aashto_classification || '',
        unit_weight: layer.unit_weight !== null ? String(layer.unit_weight) : '',
        cohesion: layer.cohesion !== null ? String(layer.cohesion) : '',
        friction_angle: layer.friction_angle !== null ? String(layer.friction_angle) : '',
        moisture_content: layer.moisture_content !== null ? String(layer.moisture_content) : '',
        permeability: layer.permeability !== null ? String(layer.permeability) : '',
        color: layer.color || '#8d6e63'
      });
    } else {
      // Default order is layersCount + 1
      setFormData(prev => ({
        ...prev,
        layer_order: String(layersCount + 1),
        // If there are existing layers, start depth is the max to_depth
        from_depth: '0.0'
      }));
    }
  }, [layer, layersCount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Front-end Geotechnical validation limits
    const from_d = parseFloat(formData.from_depth);
    const to_d = parseFloat(formData.to_depth);
    if (isNaN(from_d) || from_d < 0) {
      alert("Start depth must be greater than or equal to 0.0m.");
      return;
    }
    if (isNaN(to_d) || to_d <= from_d) {
      alert("End depth must be strictly greater than start depth.");
      return;
    }

    const unit_w = formData.unit_weight.trim() !== '' ? parseFloat(formData.unit_weight) : null;
    if (unit_w !== null && unit_w <= 0) {
      alert("Unit weight must be strictly positive (> 0 kN/m³).");
      return;
    }

    const coh = formData.cohesion.trim() !== '' ? parseFloat(formData.cohesion) : null;
    if (coh !== null && coh < 0) {
      alert("Cohesion must be greater than or equal to 0.0 kPa.");
      return;
    }

    const phi = formData.friction_angle.trim() !== '' ? parseFloat(formData.friction_angle) : null;
    if (phi !== null && (phi < 0 || phi > 90)) {
      alert("Internal friction angle must be between 0° and 90°.");
      return;
    }

    const moisture = formData.moisture_content.trim() !== '' ? parseFloat(formData.moisture_content) : null;
    if (moisture !== null && (moisture < 0 || moisture > 100)) {
      alert("Moisture content percentage must be between 0% and 100%.");
      return;
    }

    const payload = {
      from_depth: from_d,
      to_depth: to_d,
      layer_order: parseInt(formData.layer_order) || 1,
      soil_type: formData.soil_type,
      description: formData.description.trim() || null,
      uscs_classification: formData.uscs_classification.trim() || null,
      is_1498_classification: formData.is_1498_classification.trim() || null,
      aashto_classification: formData.aashto_classification.trim() || null,
      unit_weight: unit_w,
      cohesion: coh,
      friction_angle: phi,
      moisture_content: moisture,
      permeability: formData.permeability.trim() !== '' ? parseFloat(formData.permeability) : null,
      color: formData.color
    };

    onSave(payload);
  };

  const predefinedColors = [
    { label: 'Clay (CH)', hex: '#8d6e63' },
    { label: 'Silt (ML)', hex: '#a1887f' },
    { label: 'Sand (SP)', hex: '#ffeb3b' },
    { label: 'Sandy Clay (SC)', hex: '#c5e1a5' },
    { label: 'Gravel (GP)', hex: '#90a4ae' },
    { label: 'Organic (OH)', hex: '#5d4037' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-md font-bold text-gray-800">
            {layer ? "Edit Strata Layer Parameters" : "Add Soil Strata Layer"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Depths & Order */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">From Depth (m)</label>
                <input
                  type="number"
                  step="0.01"
                  name="from_depth"
                  value={formData.from_depth}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">To Depth (m)</label>
                <input
                  type="number"
                  step="0.01"
                  name="to_depth"
                  value={formData.to_depth}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Layer Order Index</label>
                <input
                  type="number"
                  name="layer_order"
                  value={formData.layer_order}
                  onChange={handleChange}
                  className="w-full text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Classification and Types */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Soil Category type</label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleChange}
                  className="w-full text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                >
                  <option value="clay">Clay</option>
                  <option value="silt">Silt</option>
                  <option value="sand">Sand</option>
                  <option value="gravel">Gravel</option>
                  <option value="peat">Peat / Organic</option>
                  <option value="rock">Weathered Rock</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">USCS Group Symbol</label>
                <input
                  type="text"
                  name="uscs_classification"
                  value={formData.uscs_classification}
                  onChange={handleChange}
                  placeholder="e.g. CH, SP-SM"
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">IS 1498 classification</label>
                <input
                  type="text"
                  name="is_1498_classification"
                  value={formData.is_1498_classification}
                  onChange={handleChange}
                  placeholder="e.g. CH, MI"
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AASHTO classification</label>
                <input
                  type="text"
                  name="aashto_classification"
                  value={formData.aashto_classification}
                  onChange={handleChange}
                  placeholder="e.g. A-7-6"
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Geotechnical Parameters */}
            <div>
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1 mb-2">
                Geotechnical Parameters (Nullable)
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Bulk Weight γ (kN/m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="unit_weight"
                    value={formData.unit_weight}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Cohesion c (kPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="cohesion"
                    value={formData.cohesion}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Friction angle φ (°)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="friction_angle"
                    value={formData.friction_angle}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Moisture content w (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="moisture_content"
                    value={formData.moisture_content}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Permeability k (cm/s)</label>
                  <input
                    type="number"
                    step="1e-6"
                    name="permeability"
                    value={formData.permeability}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Visual Soil Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Stiff red clayey silt with gravelly lens"
                className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Color selection */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Display Color Rendering</label>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {predefinedColors.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: c.hex }))}
                    className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[10px] font-bold transition ${
                      formData.color === c.hex
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c.hex }} />
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="#8d6e63"
                  className="w-24 text-xs font-mono font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-extrabold rounded-xl uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition"
            >
              <Save size={14} />
              Save Layer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoilLayerDialog;
