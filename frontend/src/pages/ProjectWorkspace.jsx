import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, AlertCircle, MapPin, Briefcase, Calendar, ShieldAlert,
  Save, Landmark, Layers, FileSpreadsheet, HardHat, TrendingUp, Info, 
  Trash2, FileText, CheckCircle2, History, AlertTriangle, ExternalLink
} from 'lucide-react';
import PageTitle from '../components/common/PageTitle';
import ProjectHeader from '../components/projects/ProjectHeader';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import ProjectStatistics from '../components/projects/ProjectStatistics';
import ProjectForm from '../components/projects/ProjectForm';
import { 
  getProject, updateProject, updateSiteInfo, getReports, deleteReport, getActivities, getCalculations 
} from '../api/projectApi';

const ProjectWorkspace = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tab: overview, site-info, soil-investigation, calculations, reports, activities, settings
  const [activeTab, setActiveTab] = useState('overview');

  // Site Info form state
  const [siteData, setSiteData] = useState({
    site_name: '',
    site_coordinates: '',
    ground_level: '0.0',
    groundwater_level: '0.0',
    weather: '',
    elevation: '0.0',
    site_notes: ''
  });
  const [savingSite, setSavingSite] = useState(false);
  const [siteSuccess, setSiteSuccess] = useState(false);

  // Settings edit state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const proj = await getProject(uuid);
      setProject(proj);
      
      // Pre-fill site form
      setSiteData({
        site_name: proj.site_name || '',
        site_coordinates: proj.site_coordinates || '',
        ground_level: proj.ground_level !== null ? String(proj.ground_level) : '0.0',
        groundwater_level: proj.groundwater_level !== null ? String(proj.groundwater_level) : '0.0',
        weather: proj.weather || '',
        elevation: proj.elevation !== null ? String(proj.elevation) : '0.0',
        site_notes: proj.site_notes || ''
      });

      // Fetch reports, calculations and activity logs concurrently
      const [reps, calcs, acts] = await Promise.all([
        getReports(uuid),
        getCalculations(uuid),
        getActivities(uuid)
      ]);
      
      setReports(reps);
      setCalculations(calcs);
      setActivities(acts);
    } catch (err) {
      console.error("Error loading project workspace:", err);
      setError("Failed to load project workspace. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [uuid]);

  const handleLaunchModule = (route) => {
    // Navigate to the calculator module with the project UUID in query parameters
    navigate(`${route}?project=${uuid}`);
  };

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    setSavingSite(true);
    setSiteSuccess(false);
    try {
      const payload = {
        ...siteData,
        ground_level: parseFloat(siteData.ground_level) || 0.0,
        groundwater_level: parseFloat(siteData.groundwater_level) || 0.0,
        elevation: parseFloat(siteData.elevation) || 0.0
      };
      await updateSiteInfo(uuid, payload);
      setSiteSuccess(true);
      
      // Refresh project to update modified_at and fetch latest activity logs
      const updatedProj = await getProject(uuid);
      setProject(updatedProj);
      const acts = await getActivities(uuid);
      setActivities(acts);
    } catch (err) {
      console.error("Error saving site info:", err);
      alert("Failed to save site investigation details.");
    } finally {
      setSavingSite(false);
    }
  };

  const handleSettingsSubmit = async (formData) => {
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await updateProject(uuid, formData);
      setSettingsSuccess(true);
      
      // Refresh project & activity
      const updatedProj = await getProject(uuid);
      setProject(updatedProj);
      const acts = await getActivities(uuid);
      setActivities(acts);
    } catch (err) {
      console.error("Error saving project settings:", err);
      alert("Failed to update project settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report from the project history?")) return;
    try {
      await deleteReport(uuid, reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      // Refresh activity
      const acts = await getActivities(uuid);
      setActivities(acts);
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Failed to delete report.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <span className="text-sm font-semibold">Loading project workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center gap-2.5 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl max-w-2xl mx-auto mt-10">
        <AlertCircle size={24} />
        <div>
          <h4 className="font-bold">Error</h4>
          <p className="text-sm mt-1">{error || "Project not found"}</p>
          <Link to="/projects" className="inline-block mt-3 text-sm font-semibold underline">Back to projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Banner Header */}
      <ProjectHeader 
        project={project} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Statistics counters */}
      <ProjectStatistics 
        project={project} 
        reportsCount={reports.length}
        calcsCount={calculations.length} 
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Workspace Local Sidebar */}
        <ProjectSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLaunchModule={handleLaunchModule}
        />

        {/* Tab Content Window */}
        <div className="flex-1 w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Overview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Project Name</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">{project.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Project Number</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">{project.project_number}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Client Name</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">{project.client_name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Consultant Engineer</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">{project.consultant || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Location</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">{project.location}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">Geographical Coordinates</span>
                    <span className="text-sm font-semibold text-gray-700 mt-1">
                      {project.latitude && project.longitude 
                        ? `${project.latitude.toFixed(4)} N, ${project.longitude.toFixed(4)} E` 
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Details Snippet */}
              <div className="border-t border-gray-50 pt-4">
                <h4 className="text-md font-bold text-gray-800">Current Site Investigation Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase block">Site Name</span>
                    <span className="text-sm font-bold text-gray-700 mt-1 block">{project.site_name || 'Not Specified'}</span>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase block">Groundwater Level</span>
                    <span className="text-sm font-bold text-gray-700 mt-1 block">
                      {project.groundwater_level !== null ? `${project.groundwater_level.toFixed(2)} m` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase block">Site Elevation</span>
                    <span className="text-sm font-bold text-gray-700 mt-1 block">
                      {project.elevation !== null ? `${project.elevation.toFixed(2)} m MSL` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Site Information */}
          {activeTab === 'site-info' && (
            <form onSubmit={handleSiteSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Site Investigation Information</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Specify site details. These parameters are accessible by individual design suite calculators.
                </p>
              </div>

              {siteSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Site details updated successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Site Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Site Name</label>
                  <input
                    type="text"
                    value={siteData.site_name}
                    onChange={(e) => setSiteData({ ...siteData, site_name: e.target.value })}
                    placeholder="e.g. Block A Foundation Site"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Site Coordinates */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Site Coordinates</label>
                  <input
                    type="text"
                    value={siteData.site_coordinates}
                    onChange={(e) => setSiteData({ ...siteData, site_coordinates: e.target.value })}
                    placeholder="e.g. 17°41'12.5&quot; N, 83°13'06.6&quot; E"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Ground Level */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Ground Level (m relative to benchmark)</label>
                  <input
                    type="text"
                    value={siteData.ground_level}
                    onChange={(e) => setSiteData({ ...siteData, ground_level: e.target.value })}
                    placeholder="e.g. 0.0"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Groundwater Level */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Groundwater Table Depth (m below ground level)</label>
                  <input
                    type="text"
                    value={siteData.groundwater_level}
                    onChange={(e) => setSiteData({ ...siteData, groundwater_level: e.target.value })}
                    placeholder="e.g. 2.50"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Weather */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Weather/Climate Conditions</label>
                  <input
                    type="text"
                    value={siteData.weather}
                    onChange={(e) => setSiteData({ ...siteData, weather: e.target.value })}
                    placeholder="e.g. Dry / Semi-Arid"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Elevation */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Elevation above MSL (m)</label>
                  <input
                    type="text"
                    value={siteData.elevation}
                    onChange={(e) => setSiteData({ ...siteData, elevation: e.target.value })}
                    placeholder="e.g. 15.00"
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Site Notes */}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Geotechnical Site Notes / Observations</label>
                  <textarea
                    value={siteData.site_notes}
                    onChange={(e) => setSiteData({ ...siteData, site_notes: e.target.value })}
                    placeholder="Include details about rock outcroppings, filled ground, nearby water bodies, etc."
                    rows={3}
                    className="px-3 py-2 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-50 pt-4">
                <button
                  type="submit"
                  disabled={savingSite}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  <Save size={16} />
                  {savingSite ? "Saving..." : "Update Site Details"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Soil Investigation */}
          {activeTab === 'soil-investigation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Soil Investigation (Borehole Logging)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage soil strata profiles, SPT blow counts (N-values), and borehole logs.
                </p>
              </div>

              <div className="p-8 bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Database size={24} />
                </div>
                <h4 className="text-md font-bold text-gray-800">Borehole Stratigraphy Workspace</h4>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  Define multiple boreholes and soil layers. Engineering modules can read this data to automate pile and bearing capacity calculations!
                </p>
                <span className="inline-block mt-4 px-3 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-full uppercase tracking-wider">
                  Upcoming Module (v2.3)
                </span>
              </div>

              {/* Sample logs */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Mock Site Stratigraphy (Trial Pits)</h4>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                        <th className="py-2.5 px-4 font-semibold">Borehole ID</th>
                        <th className="py-2.5 px-4 font-semibold">Strata Depth (m)</th>
                        <th className="py-2.5 px-4 font-semibold">USCS Group Symbol</th>
                        <th className="py-2.5 px-4 font-semibold">Soil Description</th>
                        <th className="py-2.5 px-4 font-semibold">Average N-Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold">BH-1</td>
                        <td className="py-2.5 px-4">0.0 – 3.5m</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">CH</span></td>
                        <td className="py-2.5 px-4">Highly expansive dark gray clay (Black Cotton Soil)</td>
                        <td className="py-2.5 px-4">6</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold">BH-1</td>
                        <td className="py-2.5 px-4">3.5 – 12.0m</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-md text-xs font-semibold">SM</span></td>
                        <td className="py-2.5 px-4">Medium dense silty sand with gravelly lens</td>
                        <td className="py-2.5 px-4">18</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold">BH-2</td>
                        <td className="py-2.5 px-4">0.0 – 4.0m</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">CH</span></td>
                        <td className="py-2.5 px-4">Inorganic clay of high plasticity</td>
                        <td className="py-2.5 px-4">8</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Calculations History */}
          {activeTab === 'calculations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Geotechnical Design Suite Modules</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Launch any module or resume previously run trials. All inputs/results are organized under this project.
                </p>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'pile-capacity', label: 'Pile Capacity Calculator', desc: 'Static axial capacity of bored cast-in-situ concrete piles in clays and sands.', route: '/pile-capacity', icon: TrendingUp },
                  { id: 'sbc', label: 'Safe Bearing Capacity (IS 6403)', desc: 'Strip, square, rectangular, and circular shallow foundation safe capacity calculations.', route: '/sbc', icon: Landmark },
                  { id: 'footing', label: 'Footing & Raft Design', desc: 'Allowable bearing pressure from SPT N-values based on allowable settlement criteria.', route: '/footing-raft', icon: Layers },
                  { id: 'soil-classification', label: 'Soil Classification (IS 1498)', desc: 'Classify grain size distributions and plasticity limit states.', route: '/soil-classification', icon: FileSpreadsheet },
                  { id: 'under-reamed', label: 'Under-Reamed Pile Design', desc: 'Calculate tension and compression capacities of multi-bulb bored piles.', route: '/under-reamed-pile', icon: HardHat }
                ].map(module => {
                  const Icon = module.icon;
                  const count = calculations.filter(c => c.module === module.id).length;
                  return (
                    <div key={module.id} className="border border-gray-100 p-5 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Icon size={20} />
                          </div>
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {count} {count === 1 ? 'Trial' : 'Trials'} Run
                          </span>
                        </div>
                        <h4 className="text-md font-bold text-gray-800 mt-3">{module.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{module.desc}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <button
                          onClick={() => handleLaunchModule(module.route)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                        >
                          Launch Module
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saved calculation trials logs */}
              {calculations.length > 0 && (
                <div className="border-t border-gray-50 pt-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Saved Trial Calculations</h4>
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                          <th className="py-2.5 px-4 font-semibold">Trial ID</th>
                          <th className="py-2.5 px-4 font-semibold">Module</th>
                          <th className="py-2.5 px-4 font-semibold">Date Run</th>
                          <th className="py-2.5 px-4 font-semibold">Version</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {calculations.map(calc => (
                          <tr key={calc.uuid}>
                            <td className="py-2.5 px-4 font-semibold">{calc.calculation_name}</td>
                            <td className="py-2.5 px-4 capitalize">{calc.module.replace('-', ' ')}</td>
                            <td className="py-2.5 px-4">{new Date(calc.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="py-2.5 px-4">{calc.version}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleLaunchModule(calc.module === 'footing' ? '/footing-raft' : calc.module === 'under-reamed' ? '/under-reamed-pile' : `/${calc.module}`)}
                                className="text-xs font-bold text-blue-600 hover:underline"
                              >
                                Resume
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Reports Center */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Unified Report Center</h3>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage exported PDFs, Excel logs, and trial reports generated across all suite calculators.
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-100 rounded-xl">
                  <FileText className="text-gray-300 mb-2" size={40} />
                  <span className="text-sm font-semibold text-gray-500">No reports generated yet.</span>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Run calculations in any module and click "Export to PDF/Excel" to save the report to this repository.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                        <th className="py-3 px-4 font-semibold">Report ID</th>
                        <th className="py-3 px-4 font-semibold">Engineering Module</th>
                        <th className="py-3 px-4 font-semibold">Engineer Name</th>
                        <th className="py-3 px-4 font-semibold">Date Exported</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {reports.map(rep => (
                        <tr key={rep.id}>
                          <td className="py-3 px-4 font-semibold text-blue-600">
                            Report #{rep.report_number}
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {rep.module.replace('-', ' ')}
                          </td>
                          <td className="py-3 px-4">{rep.engineer}</td>
                          <td className="py-3 px-4">
                            {new Date(rep.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 text-right flex items-center justify-end gap-3.5">
                            <button
                              onClick={() => alert(`Review report details:\nID: ${rep.id}\nEngineer: ${rep.engineer}\nResults Summary: ${JSON.stringify(rep.results)}`)}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDeleteReport(rep.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Activity Logs */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Project Activity logs</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Audit trail timeline showing parameter modifications and calculations history.
                </p>
              </div>

              {activities.length === 0 ? (
                <span className="text-sm text-gray-500 font-semibold block text-center py-6">No activity logged.</span>
              ) : (
                <div className="relative border-l-2 border-blue-50 ml-4 pl-6 space-y-6">
                  {activities.map(act => (
                    <div key={act.id} className="relative">
                      {/* Node circle */}
                      <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full" />
                      <div>
                        <span className="text-xs font-bold text-gray-400 block">
                          {new Date(act.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800 mt-1">{act.description}</h4>
                        <span className="text-xs text-gray-500 mt-0.5 block">Triggered by: {act.user_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 7: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Project Settings</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Modify general project details or archive the project workspace.
                </p>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Project details saved successfully.</span>
                </div>
              )}

              <ProjectForm
                initialData={project}
                onSubmit={handleSettingsSubmit}
                isSubmitting={savingSettings}
                submitLabel="Update Project Settings"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
