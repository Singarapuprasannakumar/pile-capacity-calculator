import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SptSoilCalculator from '../components/foundation/SptSoilCalculator';
import AdhesionFactorCalculator from '../components/foundation/AdhesionFactorCalculator';
import NqCalculator from '../components/foundation/NqCalculator';
import { Layers, Activity, Ruler } from 'lucide-react';
import { getFoundationPreferences, setAdhesionFactor, clearAdhesionFactor } from '../api/foundationPreferencesApi';

const TABS = [
  { id: 'spt', label: 'SPT SOIL', icon: Layers },
  { id: 'adhesion', label: 'ADHESION α', icon: Activity },
  { id: 'nq', label: 'IS:2911 Nq', icon: Ruler },
];

const FoundationAnalysis = () => {
  const [searchParams] = useSearchParams();
  const projectUuid = searchParams.get('project');

  const [activeTab, setActiveTab] = useState('spt');
  
  // Shared state for engineering parameters summary and cross-panel population
  const [sharedCohesion, setSharedCohesion] = useState('');
  const [sharedPhi, setSharedPhi] = useState('');
  
  // Project-level foundation preferences
  const [projectPreferences, setProjectPreferences] = useState(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  useEffect(() => {
    if (projectUuid) {
      setPreferencesLoading(true);
      getFoundationPreferences(projectUuid)
        .then(data => {
          setProjectPreferences(data);
        })
        .catch(err => console.error("Failed to load preferences", err))
        .finally(() => setPreferencesLoading(false));
    } else {
      setProjectPreferences(null);
    }
  }, [projectUuid]);

  const handleTransferCohesion = (cohesion) => {
    setSharedCohesion(cohesion);
    setActiveTab('adhesion');
  };

  const handleTransferPhi = (phi) => {
    setSharedPhi(phi);
    setActiveTab('nq');
  };

  const handleSaveAlpha = async (alphaValue) => {
    if (!projectUuid) return;
    try {
      const updatedPrefs = await setAdhesionFactor(projectUuid, alphaValue, 'foundation-analysis');
      setProjectPreferences(updatedPrefs);
    } catch (err) {
      console.error("Failed to save alpha", err);
      throw err;
    }
  };

  const handleClearAlpha = async () => {
    if (!projectUuid) return;
    try {
      const updatedPrefs = await clearAdhesionFactor(projectUuid);
      setProjectPreferences(updatedPrefs);
    } catch (err) {
      console.error("Failed to clear alpha", err);
      throw err;
    }
  };

  const activeAlphaObj = projectPreferences?.adhesion_factor_active 
    ? { value: projectPreferences.adhesion_factor_value, active: true } 
    : { value: null, active: false };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">
            Foundation Analysis
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
            Foundation Engineering Analysis & Soil Parameters
            {projectUuid ? (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs border border-blue-100 font-semibold">
                Project Bound
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs border border-amber-100 font-semibold">
                No project selected
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Work Area (Left) */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Calculator Panel */}
          <div className="mt-6">
            {activeTab === 'spt' && (
              <SptSoilCalculator 
                onTransferPhi={handleTransferPhi}
                onTransferCohesion={handleTransferCohesion}
              />
            )}
            
            {activeTab === 'adhesion' && (
              <AdhesionFactorCalculator 
                initialCohesion={sharedCohesion}
                projectUuid={projectUuid}
                activeAlphaObj={activeAlphaObj}
                onSaveAlpha={handleSaveAlpha}
                onClearAlpha={handleClearAlpha} 
                preferencesLoading={preferencesLoading}
              />
            )}
            
            {activeTab === 'nq' && (
              <NqCalculator initialPhi={sharedPhi} />
            )}
          </div>
        </div>

        {/* Live Engineering Summary (Right) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sticky top-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Engineering Parameters Summary
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600 font-medium">Cohesion (c)</span>
                <span className="font-semibold text-slate-900">{sharedCohesion !== '' ? `${sharedCohesion} kPa` : '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600 font-medium">Internal Friction (φ)</span>
                <span className="font-semibold text-slate-900">{sharedPhi !== '' ? `${sharedPhi}°` : '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600 font-medium">Global Project α</span>
                <span className="font-semibold text-slate-900">
                  {activeAlphaObj.active ? activeAlphaObj.value.toFixed(2) : <span className="text-slate-400 font-normal">Inactive</span>}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Note:</strong> Values appear here when transferred from the SPT properties estimator or persisted as global project parameters.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default FoundationAnalysis;
