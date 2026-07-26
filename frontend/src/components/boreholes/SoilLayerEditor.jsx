import React, { useState } from 'react';
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, Split, Combine, CheckCircle2, AlertTriangle } from 'lucide-react';

const SoilLayerEditor = ({ layers, onSaveLayers, onAddClick, onEditClick, onDeleteClick }) => {
  const [splitLayer, setSplitLayer] = useState(null);
  const [splitDepth, setSplitDepth] = useState('');

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...layers];
    // Swap order values
    const tempOrder = updated[index].layer_order;
    updated[index].layer_order = updated[index - 1].layer_order;
    updated[index - 1].layer_order = tempOrder;
    onSaveLayers(updated);
  };

  const handleMoveDown = (index) => {
    if (index === layers.length - 1) return;
    const updated = [...layers];
    // Swap order values
    const tempOrder = updated[index].layer_order;
    updated[index].layer_order = updated[index + 1].layer_order;
    updated[index + 1].layer_order = tempOrder;
    onSaveLayers(updated);
  };

  const handleSplitSubmit = (e) => {
    e.preventDefault();
    if (!splitLayer) return;
    const depth = parseFloat(splitDepth);
    if (isNaN(depth) || depth <= splitLayer.from_depth || depth >= splitLayer.to_depth) {
      alert(`Split depth must be strictly between ${splitLayer.from_depth}m and ${splitLayer.to_depth}m.`);
      return;
    }

    // Clone layers list
    const updated = [];
    let orderIndex = 1;

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];
      if (l.uuid === splitLayer.uuid) {
        // Part 1
        updated.push({
          ...l,
          to_depth: depth,
          layer_order: orderIndex++
        });
        // Part 2
        updated.push({
          ...l,
          from_depth: depth,
          layer_order: orderIndex++,
          description: `${l.description || ''} (Lower strata)`
        });
      } else {
        updated.push({
          ...l,
          layer_order: orderIndex++
        });
      }
    }

    onSaveLayers(updated);
    setSplitLayer(null);
    setSplitDepth('');
  };

  const handleMerge = (index) => {
    if (index === layers.length - 1) {
      alert("Cannot merge the bottom layer downwards.");
      return;
    }
    const l1 = layers[index];
    const l2 = layers[index + 1];
    if (!window.confirm(`Merge layer '${l1.soil_type}' with '${l2.soil_type}'? Depth bounds will be ${l1.from_depth}m to ${l2.to_depth}m.`)) return;

    const updated = [];
    let orderIndex = 1;

    for (let i = 0; i < layers.length; i++) {
      if (i === index) {
        // Merged layer
        updated.push({
          ...l1,
          to_depth: l2.to_depth,
          soil_type: `${l1.soil_type}/${l2.soil_type}`,
          description: `${l1.description || ''}; merged with ${l2.description || ''}`,
          layer_order: orderIndex++
        });
      } else if (i === index + 1) {
        // Skip next layer as it is merged
        continue;
      } else {
        updated.push({
          ...layers[i],
          layer_order: orderIndex++
        });
      }
    }

    onSaveLayers(updated);
  };

  return (
    <div className="space-y-4">
      {/* Table Action Controls */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h4 className="text-sm font-bold text-gray-800">Strata Layers Sequence</h4>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold rounded-lg uppercase tracking-wider transition"
        >
          <Plus size={14} />
          Add Layer
        </button>
      </div>

      {/* Split Modal Overlay */}
      {splitLayer && (
        <div className="fixed inset-0 bg-gray-900/35 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xl w-full max-w-sm">
            <h4 className="text-sm font-extrabold text-gray-800">Split Strata Layer</h4>
            <p className="text-xs text-gray-400 mt-1">
              Splits layer '{splitLayer.soil_type}' ({splitLayer.from_depth}m to {splitLayer.to_depth}m).
            </p>
            <form onSubmit={handleSplitSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Split Depth (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={splitDepth}
                  onChange={(e) => setSplitDepth(e.target.value)}
                  placeholder={`Between ${splitLayer.from_depth} and ${splitLayer.to_depth}`}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSplitLayer(null)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-extrabold rounded-lg uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-extrabold rounded-lg uppercase tracking-wider"
                >
                  Split Strata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layers list table */}
      {layers.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-100 rounded-2xl text-xs text-gray-400 font-bold uppercase tracking-wider">
          No soil layers defined. Click 'Add Layer' to start.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4 w-28">Depths (m)</th>
                <th className="py-3 px-4 w-32">Soil Type / Class</th>
                <th className="py-3 px-4 w-40">Engineering Params</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600 font-semibold">
              {layers.map((l, index) => {
                const thickness = l.to_depth - l.from_depth;
                return (
                  <tr key={l.uuid} className="hover:bg-gray-50/30">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                      {l.layer_order}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-gray-700">{l.from_depth.toFixed(2)} – {l.to_depth.toFixed(2)} m</span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Thk: {thickness.toFixed(2)} m</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-100 block" style={{ backgroundColor: l.color }} />
                        <span className="font-bold text-gray-700 capitalize">{l.soil_type}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {l.uscs_classification && (
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded text-[9px] font-bold">USCS: {l.uscs_classification}</span>
                        )}
                        {l.is_1498_classification && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded text-[9px] font-bold">IS: {l.is_1498_classification}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span>γ: {l.unit_weight ? `${l.unit_weight} kN/m³` : 'N/A'}</span>
                        <span>c: {l.cohesion ? `${l.cohesion} kPa` : 'N/A'}</span>
                        <span>φ: {l.friction_angle ? `${l.friction_angle}°` : 'N/A'}</span>
                        <span>w: {l.moisture_content ? `${l.moisture_content}%` : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Swap order controls */}
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-30"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === layers.length - 1}
                          title="Move Down"
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-30"
                        >
                          <ArrowDown size={13} />
                        </button>

                        <span className="w-px h-4 bg-gray-100 mx-1 block" />

                        {/* Split Strata */}
                        <button
                          onClick={() => setSplitLayer(l)}
                          title="Split Stratum Layer"
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                          <Split size={13} />
                        </button>

                        {/* Merge Layer */}
                        <button
                          onClick={() => handleMerge(index)}
                          disabled={index === layers.length - 1}
                          title="Merge Downwards"
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-30"
                        >
                          <Combine size={13} />
                        </button>

                        <span className="w-px h-4 bg-gray-100 mx-1 block" />

                        <button
                          onClick={() => onEditClick(l)}
                          title="Edit Properties"
                          className="p-1.5 hover:bg-gray-50 text-blue-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(l.uuid)}
                          title="Delete Strata Layer"
                          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SoilLayerEditor;
