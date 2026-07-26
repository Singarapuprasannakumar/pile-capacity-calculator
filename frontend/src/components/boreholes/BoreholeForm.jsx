import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const BoreholeForm = ({ borehole, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ground_level: '0.0',
    termination_depth: '0.0',
    groundwater_depth: '',
    drilling_method: '',
    status: 'Draft',
    remarks: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (borehole) {
      setFormData({
        name: borehole.name || '',
        location: borehole.location || '',
        ground_level: borehole.ground_level !== null ? String(borehole.ground_level) : '0.0',
        termination_depth: borehole.termination_depth !== null ? String(borehole.termination_depth) : '0.0',
        groundwater_depth: borehole.groundwater_depth !== null ? String(borehole.groundwater_depth) : '',
        drilling_method: borehole.drilling_method || '',
        status: borehole.status || 'Draft',
        remarks: borehole.remarks || ''
      });
    }
  }, [borehole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Borehole Name is required.");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim() || null,
        ground_level: parseFloat(formData.ground_level) || 0.0,
        termination_depth: parseFloat(formData.termination_depth) || 0.0,
        groundwater_depth: formData.groundwater_depth.trim() !== '' ? parseFloat(formData.groundwater_depth) : null,
        drilling_method: formData.drilling_method.trim() || null,
        status: formData.status,
        remarks: formData.remarks.trim() || null
      };
      await onSave(payload);
    } catch (err) {
      console.error(err);
      alert("Failed to save borehole parameters.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-md font-bold text-gray-800">
            {borehole ? `Edit Borehole: ${borehole.name}` : "Create New Borehole Investigation"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Row 1: Name and Drilling Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Borehole Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. BH-1"
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Drilling Method
                </label>
                <input
                  type="text"
                  name="drilling_method"
                  value={formData.drilling_method}
                  onChange={handleChange}
                  placeholder="e.g. Wash Boring, Rotary"
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
              </div>
            </div>

            {/* Row 2: Location and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Location / Description
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Block A Corner"
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Status Workflow
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full text-sm font-bold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Validated">Validated</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Row 3: Elevations & Depths */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Ground Level (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="ground_level"
                  value={formData.ground_level}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Termination Depth (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="termination_depth"
                  value={formData.termination_depth}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Water Table Depth (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="groundwater_depth"
                  value={formData.groundwater_depth}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Engineering Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Geotechnical notes..."
                rows="3"
                className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-gray-50/50"
              />
            </div>
          </div>

          {/* Modal Footer */}
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
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Borehole"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoreholeForm;
