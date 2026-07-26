import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, AlertCircle, Save, Database, Trash2, Archive, 
  Layers, FileText, CheckCircle2, TrendingUp, HelpCircle, FileSpreadsheet,
  AlertTriangle, PlaySquare, Compass, ShieldAlert, Landmark, HardHat
} from 'lucide-react';
import { 
  getBorehole, updateBorehole, deleteBorehole, 
  listSoilLayers, createSoilLayer, updateSoilLayer, deleteSoilLayer, bulkSaveSoilLayers, getStrataWarnings,
  listSptRecords, createSptRecord, deleteSptRecord,
  listGroundwaterLogs, createGroundwaterLog, deleteGroundwaterLog
} from '../api/boreholeApi';
import BoreholeSidebar from '../components/boreholes/BoreholeSidebar';
import SoilLayerEditor from '../components/boreholes/SoilLayerEditor';
import SoilLayerDialog from '../components/boreholes/SoilLayerDialog';
import SPTTable from '../components/boreholes/SPTTable';
import GroundwaterPanel from '../components/boreholes/GroundwaterPanel';
import BoreLogPreview from '../components/boreholes/BoreLogPreview';

const BoreholeWorkspace = () => {
  const { uuid: projectUuid, boreholeUuid } = useParams();
  const navigate = useNavigate();

  const [borehole, setBorehole] = useState(null);
  const [layers, setLayers] = useState([]);
  const [sptRecords, setSptRecords] = useState([]);
  const [gwLogs, setGwLogs] = useState([]);
  const [warnings, setWarnings] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Borehole Form State
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    ground_level: '0.0',
    termination_depth: '0.0',
    groundwater_depth: '',
    drilling_method: '',
    status: 'Draft',
    remarks: ''
  });
  const [updatingBorehole, setUpdatingBorehole] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Layers Dialog Modal state
  const [isLayerDialogOpen, setIsLayerDialogOpen] = useState(false);
  const [editingLayer, setEditingLayer] = useState(null);

  const fetchBoreholeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bh = await getBorehole(boreholeUuid);
      setBorehole(bh);
      
      setEditForm({
        name: bh.name || '',
        location: bh.location || '',
        ground_level: bh.ground_level !== null ? String(bh.ground_level) : '0.0',
        termination_depth: bh.termination_depth !== null ? String(bh.termination_depth) : '0.0',
        groundwater_depth: bh.groundwater_depth !== null ? String(bh.groundwater_depth) : '',
        drilling_method: bh.drilling_method || '',
        status: bh.status || 'Draft',
        remarks: bh.remarks || ''
      });

      // Load sub-items
      const [layersList, sptList, gwList, warnList] = await Promise.all([
        listSoilLayers(boreholeUuid),
        listSptRecords(boreholeUuid),
        listGroundwaterLogs(boreholeUuid),
        getStrataWarnings(boreholeUuid)
      ]);

      setLayers(layersList);
      setSptRecords(sptList);
      setGwLogs(gwList);
      setWarnings(warnList);
    } catch (err) {
      console.error(err);
      setError("Failed to load borehole workspace details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoreholeData();
  }, [boreholeUuid]);

  // Refresh Warnings separately when layers update
  const refreshWarningsAndLayers = async () => {
    try {
      const [layersList, warnList] = await Promise.all([
        listSoilLayers(boreholeUuid),
        getStrataWarnings(boreholeUuid)
      ]);
      setLayers(layersList);
      setWarnings(warnList);
    } catch (err) {
      console.error("Error refreshing strata warnings:", err);
    }
  };

  const handleUpdateBorehole = async (e) => {
    e.preventDefault();
    setUpdatingBorehole(true);
    setUpdateSuccess(false);
    try {
      const payload = {
        name: editForm.name.trim(),
        location: editForm.location.trim() || null,
        ground_level: parseFloat(editForm.ground_level) || 0.0,
        termination_depth: parseFloat(editForm.termination_depth) || 0.0,
        groundwater_depth: editForm.groundwater_depth.trim() !== '' ? parseFloat(editForm.groundwater_depth) : null,
        drilling_method: editForm.drilling_method.trim() || null,
        status: editForm.status,
        remarks: editForm.remarks.trim() || null
      };
      await updateBorehole(boreholeUuid, payload);
      setUpdateSuccess(true);
      
      // Refresh details
      const updatedBh = await getBorehole(boreholeUuid);
      setBorehole(updatedBh);
    } catch (err) {
      console.error(err);
      alert("Failed to save borehole parameters.");
    } finally {
      setUpdatingBorehole(false);
    }
  };

  // Layers Dialog Save
  const handleSaveLayer = async (payload) => {
    try {
      if (editingLayer) {
        // Edit layer properties
        await updateSoilLayer(boreholeUuid, editingLayer.uuid, payload);
      } else {
        // Create new
        await createSoilLayer(boreholeUuid, payload);
      }
      setIsLayerDialogOpen(false);
      setEditingLayer(null);
      await refreshWarningsAndLayers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save strata layer.");
    }
  };

  // Bulk Save Soil Layers (for splits, merges, swaps)
  const handleSaveBulkLayers = async (newLayersList) => {
    try {
      await bulkSaveSoilLayers(boreholeUuid, newLayersList);
      await refreshWarningsAndLayers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to re-sequence strata layers list.");
    }
  };

  const handleDeleteLayer = async (layerUuid) => {
    if (!window.confirm("Are you sure you want to delete this soil layer?")) return;
    try {
      await deleteSoilLayer(boreholeUuid, layerUuid);
      await refreshWarningsAndLayers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete strata layer.");
    }
  };

  // SPT Actions
  const handleAddSpt = async (payload) => {
    try {
      await createSptRecord(boreholeUuid, payload);
      const sptList = await listSptRecords(boreholeUuid);
      setSptRecords(sptList);
    } catch (err) {
      console.error(err);
      alert("Failed to record SPT test.");
    }
  };

  const handleDeleteSpt = async (sptUuid) => {
    if (!window.confirm("Delete this SPT blow count record?")) return;
    try {
      await deleteSptRecord(boreholeUuid, sptUuid);
      const sptList = await listSptRecords(boreholeUuid);
      setSptRecords(sptList);
    } catch (err) {
      console.error(err);
      alert("Failed to delete SPT record.");
    }
  };

  // Groundwater Actions
  const handleAddGw = async (payload) => {
    try {
      await createGroundwaterLog(boreholeUuid, payload);
      const gwList = await listGroundwaterLogs(boreholeUuid);
      setGwLogs(gwList);
    } catch (err) {
      console.error(err);
      alert("Failed to save groundwater depth monitoring entry.");
    }
  };

  const handleDeleteGw = async (logUuid) => {
    if (!window.confirm("Delete this water table observation log entry?")) return;
    try {
      await deleteGroundwaterLog(boreholeUuid, logUuid);
      const gwList = await listGroundwaterLogs(boreholeUuid);
      setGwLogs(gwList);
    } catch (err) {
      console.error(err);
      alert("Failed to delete groundwater entry.");
    }
  };

  // CSV Exports
  const handleExportBoreholeCsv = () => {
    if (!borehole) return;
    const headers = ["Property", "Value"];
    const rows = [
      ["Borehole Name", borehole.name],
      ["UUID", borehole.uuid],
      ["Drilling Method", borehole.drilling_method || "N/A"],
      ["Ground level Elevation (m)", borehole.ground_level],
      ["Termination Depth (m)", borehole.termination_depth],
      ["Status", borehole.status],
      ["Remarks", borehole.remarks || "N/A"]
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${borehole.name}_metadata.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLayersCsv = () => {
    if (layers.length === 0) return;
    const headers = ["Order", "From Depth (m)", "To Depth (m)", "Soil Type", "USCS Class", "IS 1498 Class", "Unit Weight (kN/m³)", "Cohesion (kPa)", "Friction Angle (deg)", "Moisture (%)", "Description"];
    const rows = layers.map(l => [
      l.layer_order,
      l.from_depth,
      l.to_depth,
      l.soil_type,
      l.uscs_classification || "N/A",
      l.is_1498_classification || "N/A",
      l.unit_weight || "N/A",
      l.cohesion || "N/A",
      l.friction_angle || "N/A",
      l.moisture_content || "N/A",
      `"${l.description || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${borehole.name}_strata_layers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <span className="text-sm font-semibold">Loading borehole workspace...</span>
      </div>
    );
  }

  if (error || !borehole) {
    return (
      <div className="flex items-center gap-2.5 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl max-w-2xl mx-auto mt-10">
        <AlertCircle size={24} />
        <div>
          <h4 className="font-bold">Error</h4>
          <p className="text-sm mt-1">{error || "Borehole not found"}</p>
          <Link to={`/projects/${projectUuid}`} className="inline-block mt-3 text-sm font-semibold underline">Back to workspace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/projects/${projectUuid}`)}
          className="p-2 border border-gray-100 hover:bg-gray-55 hover:text-gray-800 rounded-xl text-gray-400 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider block w-max">
            {borehole.name} Log
          </span>
          <h1 className="text-xl font-black text-gray-800 mt-1">Borehole Investigation Workspace</h1>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        
        {/* Left Sub-Sidebar navigation */}
        <div className="w-full md:w-60 space-y-4">
          <BoreholeSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            warningsCount={warnings.length}
          />
          
          {/* Warnings list card alert */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-yellow-800 font-bold text-xs uppercase tracking-wider leading-none">
                <AlertTriangle size={14} className="text-yellow-600" />
                <span>Strata Integrity Warnings</span>
              </div>
              <ul className="text-[10px] text-yellow-700 font-semibold space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx} className="list-disc list-inside leading-tight">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right workspace contents */}
        <div className="flex-1 w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          
          {/* TAB 1: Overview and Properties Update */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Borehole Properties</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  Update primary elevations and monitoring datum definitions.
                </p>
              </div>

              <form onSubmit={handleUpdateBorehole} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Borehole Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Drilling Method</label>
                    <input
                      type="text"
                      value={editForm.drilling_method}
                      onChange={(e) => setEditForm(prev => ({ ...prev, drilling_method: e.target.value }))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status Workflow</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Validated">Validated</option>
                      <option value="Approved">Approved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ground Level (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.ground_level}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ground_level: e.target.value }))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Termination Depth (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.termination_depth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, termination_depth: e.target.value }))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Groundwater Level Depth (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.groundwater_depth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, groundwater_depth: e.target.value }))}
                      placeholder="Optional"
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Location description</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Remarks</label>
                    <textarea
                      value={editForm.remarks}
                      onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      rows="3"
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  {updateSuccess && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Borehole parameters updated successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={updatingBorehole}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition disabled:opacity-50 ml-auto"
                  >
                    <Save size={14} />
                    {updatingBorehole ? "Updating..." : "Update Settings"}
                  </button>
                </div>
              </form>

              {/* Future integrations preview hooks */}
              <div className="border-t border-gray-50 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                  Use Strata Data in Calculator Modules (Roadmap Integration)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Pile Capacity', icon: HardHat },
                    { label: 'SBC (IS 6403)', icon: Landmark },
                    { label: 'Settlement Analysis', icon: Layers },
                    { label: 'Under-Reamed Pile', icon: Database }
                  ].map((calc, idx) => {
                    const Icon = calc.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 border border-gray-100 rounded-2xl flex flex-col justify-between gap-3 bg-gray-50/20 opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center">
                            <Icon size={16} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 leading-none">{calc.label}</span>
                        </div>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-wide leading-none">
                          Disabled (v2.4 Hook)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Soil Layers list and Live Preview side-by-side! */}
          {activeTab === 'layers' && (
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-4">
                <SoilLayerEditor
                  layers={layers}
                  onSaveLayers={handleSaveBulkLayers}
                  onAddClick={() => {
                    setEditingLayer(null);
                    setIsLayerDialogOpen(true);
                  }}
                  onEditClick={(l) => {
                    setEditingLayer(l);
                    setIsLayerDialogOpen(true);
                  }}
                  onDeleteClick={handleDeleteLayer}
                />
              </div>

              {/* Live strata preview column card */}
              <div className="w-full xl:w-80 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 sticky top-6">
                <BoreLogPreview
                  layers={layers}
                  groundwaterDepth={borehole.groundwater_depth}
                  groundLevel={borehole.ground_level}
                />
              </div>
            </div>
          )}

          {/* TAB 3: SPT blow count logs */}
          {activeTab === 'spt' && (
            <SPTTable
              sptRecords={sptRecords}
              onAddRecord={handleAddSpt}
              onDeleteRecord={handleDeleteSpt}
            />
          )}

          {/* TAB 4: Groundwater Level observations */}
          {activeTab === 'groundwater' && (
            <GroundwaterPanel
              logs={gwLogs}
              onAddLog={handleAddGw}
              onDeleteLog={handleDeleteGw}
            />
          )}

          {/* TAB 5: Visual Profile Log & Export center */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4 gap-4">
                <div>
                  <h3 className="text-md font-bold text-gray-800">Visual Soil Profile rendering</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    Print or export strata logs sequence.
                  </p>
                </div>
                
                {/* Export triggers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBoreholeCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-extrabold rounded-lg uppercase tracking-wider transition"
                  >
                    <FileText size={14} />
                    Borehole CSV
                  </button>
                  <button
                    onClick={handleExportLayersCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-extrabold rounded-lg uppercase tracking-wider transition"
                  >
                    <FileSpreadsheet size={14} />
                    Layers CSV
                  </button>
                </div>
              </div>

              {/* Visual log preview stack */}
              <div className="py-6">
                <BoreLogPreview
                  layers={layers}
                  groundwaterDepth={borehole.groundwater_depth}
                  groundLevel={borehole.ground_level}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Soil Layers Dialog Modal */}
      {isLayerDialogOpen && (
        <SoilLayerDialog
          layer={editingLayer}
          layersCount={layers.length}
          onClose={() => setIsLayerDialogOpen(false)}
          onSave={handleSaveLayer}
        />
      )}
    </div>
  );
};

export default BoreholeWorkspace;
