import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Calculator, 
  FileText, 
  FolderOpen, 
  Activity,
  Layers3,
  Sparkles,
  Settings,
  Star,
  Download,
  FileDown,
  Trash2,
  Play
} from 'lucide-react';
import PageTitle from '../components/common/PageTitle';
import MetricCard from '../components/common/MetricCard';
import Card from '../components/common/Card';
import { ENGINEERING_MODULES } from '../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const [reportsCount, setReportsCount] = useState(0);
  const [recentCalcs, setRecentCalcs] = useState([]);
  const [lastInputs, setLastInputs] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('reports_generated_count') || '0', 10);
      setReportsCount(count);

      const recent = JSON.parse(localStorage.getItem('recent_calculations') || '[]');
      setRecentCalcs(recent);

      const inputs = JSON.parse(localStorage.getItem('last_pile_calculation_inputs') || 'null');
      setLastInputs(inputs);

      const favs = JSON.parse(localStorage.getItem('favorite_modules') || '[]');
      setFavorites(favs);
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
    }
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    try {
      const updated = favorites.includes(id) 
        ? favorites.filter(favId => favId !== id) 
        : [...favorites, id];
      setFavorites(updated);
      localStorage.setItem('favorite_modules', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving favorite:', err);
    }
  };

  const handleDownloadPDF = async (report, e) => {
    e.preventDefault();
    setPdfLoadingId(report.id);
    try {
      const { generatePDF } = await import('../utils/pdfReport');
      generatePDF(report);
    } catch (err) {
      console.error('Error downloading PDF from dashboard:', err);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleDownloadExcel = async (report, e) => {
    e.preventDefault();
    try {
      const { exportTableToExcel } = await import('../utils/excelExport');
      exportTableToExcel(report);
    } catch (err) {
      console.error('Error downloading Excel from dashboard:', err);
    }
  };

  const clearRecentHistory = () => {
    if (window.confirm('Are you sure you want to clear your recent calculation history?')) {
      try {
        localStorage.removeItem('recent_calculations');
        localStorage.removeItem('last_pile_calculation_inputs');
        setRecentCalcs([]);
        setLastInputs(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalModulesCount = ENGINEERING_MODULES.filter(m => m.id !== 'dashboard' && m.category.includes('Engineering')).length;

  const favoriteModulesList = ENGINEERING_MODULES.filter(
    m => favorites.includes(m.id) && m.id !== 'dashboard'
  );

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Dashboard" 
        subtitle="Civil Engineering Design Suite Overview" 
      />

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Engineering Modules" 
          value={totalModulesCount} 
          icon={Layers3} 
          color="blue" 
        />
        <MetricCard 
          label="Saved Projects" 
          value="0" 
          icon={FolderOpen} 
          color="indigo" 
        />
        <MetricCard 
          label="Reports Generated" 
          value={reportsCount} 
          icon={FileText} 
          color="green" 
        />
        <MetricCard 
          label="Recent Calculations" 
          value={recentCalcs.length} 
          icon={Activity} 
          color="orange" 
        />
      </div>

      {/* ── Resume Last Project / Favorites ── */}
      {(lastInputs || favoriteModulesList.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Last Project Banner */}
          {lastInputs && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Calculator className="w-48 h-48" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/10 uppercase tracking-wide">
                  ⚡ Active Session
                </span>
                <h3 className="text-lg font-bold">Resume Last Calculation</h3>
                <p className="text-xs text-blue-100 font-medium max-w-md">
                  Load your last design containing a pile diameter of <strong>{lastInputs.diameter} m</strong> and <strong>{lastInputs.numLayers} soil layers</strong> back into the Pile Capacity Calculator.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/pile-capacity?resume=true"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 transition rounded-lg text-xs font-bold shadow-sm space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>Resume Project</span>
                </Link>
              </div>
            </div>
          )}

          {/* Favorite Modules */}
          {favoriteModulesList.length > 0 && (
            <Card title="Favorite Modules">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[136px] overflow-y-auto scrollbar-thin">
                {favoriteModulesList.map((mod) => {
                  const Icon = mod.icon;
                  const isReady = mod.status === 'ready';
                  return (
                    <div
                      key={mod.id}
                      onClick={() => isReady && navigate(mod.route)}
                      className={`flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group ${
                        !isReady && 'opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">{mod.title}</span>
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(mod.id, e)}
                        className="text-amber-500 hover:text-slate-400 p-0.5 shrink-0"
                      >
                        <Star className="w-4 h-4 fill-current shrink-0" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Two-Column Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* Left Column: Modules Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Engineering Modules
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENGINEERING_MODULES.filter(m => m.id !== 'dashboard').map((mod) => {
              const Icon = mod.icon;
              const isReady = mod.status === 'ready';
              const isFav = favorites.includes(mod.id);

              return (
                <div 
                  key={mod.id}
                  onClick={() => isReady && navigate(mod.route)}
                  className={`bg-white border rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between h-44 ${
                    isReady 
                      ? 'border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer group' 
                      : 'border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg border ${
                      isReady ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => toggleFavorite(mod.id, e)}
                        className={`p-1 rounded hover:bg-slate-100 transition ${
                          isFav ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                        }`}
                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Star className={`w-4 h-4 shrink-0 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                        isReady 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {isReady ? 'Ready' : 'Coming Soon'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mt-2">
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{mod.title}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">{mod.description}</p>
                  </div>

                  {isReady ? (
                    <div className="flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors pt-3">
                      Open Module <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pt-3">
                      {mod.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/pile-capacity"
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-center transition-all group"
              >
                <Calculator className="w-5 h-5 text-blue-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">New Design</span>
              </Link>
              <Link 
                to="/reports"
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-center transition-all group"
              >
                <FileText className="w-5 h-5 text-green-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">Open Reports</span>
              </Link>
              <Link 
                to="/projects"
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-center transition-all group"
              >
                <FolderOpen className="w-5 h-5 text-indigo-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">Open Projects</span>
              </Link>
              <Link 
                to="/settings"
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-center transition-all group"
              >
                <Settings className="w-5 h-5 text-slate-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">Settings</span>
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card 
            title="Recent Activity" 
            className="flex-1"
            headerRight={
              recentCalcs.length > 0 && (
                <button
                  onClick={clearRecentHistory}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                </button>
              )
            }
          >
            {recentCalcs.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs italic">No recent calculations found</p>
                <p className="text-[10px] max-w-[200px] mt-1">Calculations you perform in the active modules will appear here.</p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentCalcs.map((report, idx) => (
                    <li key={report.id}>
                      <div className="relative pb-6">
                        {idx !== recentCalcs.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3 items-start">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center ring-8 ring-white border border-blue-100">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-800">
                                Pile Design #{report.reportNumber}
                              </p>
                              <span className="text-[9px] text-slate-400">
                                {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              D = {report.diameter}m | L = {report.pileLength}m | Qa = {report.outputs?.Qa ? Number(report.outputs.Qa).toFixed(1) : '—'} kN
                            </p>
                            {/* Direct Action Exports */}
                            <div className="flex items-center space-x-3 mt-2">
                              <button
                                onClick={(e) => handleDownloadPDF(report, e)}
                                disabled={pdfLoadingId === report.id}
                                className="inline-flex items-center text-[10px] font-bold text-blue-600 hover:text-blue-700 transition"
                              >
                                {pdfLoadingId === report.id ? (
                                  <span className="animate-pulse">PDF...</span>
                                ) : (
                                  <>
                                    <FileDown className="w-3 h-3 mr-0.5 shrink-0" />
                                    <span>PDF</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => handleDownloadExcel(report, e)}
                                className="inline-flex items-center text-[10px] font-bold text-green-600 hover:text-green-700 transition"
                              >
                                <Download className="w-3 h-3 mr-0.5 shrink-0" />
                                <span>Excel</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
