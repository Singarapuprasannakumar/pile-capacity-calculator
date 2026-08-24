import React, { useState, useEffect } from 'react';
import { calculateAdhesionFactor } from '../../api/adhesionFactorApi';
import AdhesionResults from './AdhesionResults';
import { Calculator, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const AdhesionFactorCalculator = ({ 
  initialCohesion = '',
  projectUuid,
  activeAlphaObj,
  onSaveAlpha,
  onClearAlpha,
  preferencesLoading
}) => {
  const [cohesion, setCohesion] = useState(initialCohesion);
  const [pileType, setPileType] = useState('concrete');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [savingState, setSavingState] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (initialCohesion !== '') {
      setCohesion(initialCohesion);
      if (error) setError(null);
    }
  }, [initialCohesion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cohesion === '' || isNaN(cohesion) || Number(cohesion) < 0) {
      setError('Cohesion cannot be negative. Please enter a valid number.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await calculateAdhesionFactor({ 
        cohesion: parseFloat(cohesion),
        pileType: pileType 
      });
      setResult(data);
    } catch (err) {
      setError(err.detail && typeof err.detail === 'string' ? err.detail : err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAlpha = async () => {
    if (!result) return;
    setSavingState(true);
    setSaveError(null);
    try {
      await onSaveAlpha(result.alpha);
    } catch (err) {
      setSaveError("Failed to save adhesion factor to project.");
    } finally {
      setSavingState(false);
    }
  };

  const handleClear = async () => {
    setSavingState(true);
    setSaveError(null);
    try {
      await onClearAlpha();
    } catch (err) {
      setSaveError("Failed to clear adhesion factor from project.");
    } finally {
      setSavingState(false);
    }
  };

  const isActive = activeAlphaObj?.active;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">ADHESION FACTOR (α) CALCULATOR</h2>
        </div>
        
        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          Based on Tomlinson (1957) - Adhesion factor for piles.
          <br/>The adhesion factor (α) relates the unit skin friction to the undrained shear strength (cohesion) of the soil.
          <br/>α is a dimensionless parameter (0 ≤ α ≤ 1)
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cohesion (c) <span className="text-slate-400 font-normal">(kPa, range 0-150)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={cohesion}
              onChange={(e) => {
                setCohesion(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 50"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">PILE TYPE</label>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="concrete" 
                  checked={pileType === 'concrete'} 
                  onChange={(e) => setPileType(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 font-medium">Concrete pilings</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="all" 
                  checked={pileType === 'all'} 
                  onChange={(e) => setPileType(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 font-medium">All pilings (average)</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center min-w-[140px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="bg-white border rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <AdhesionResults result={result} />
           
           {/* Adhesion Factor Selection UI */}
           <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Adhesion Factor (α) Selection</h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                 <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Calculated α</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{(result.alpha || 0).toFixed(2)}</span>
                 </div>

                 <div className="flex flex-col gap-2 flex-1 items-start sm:items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    {preferencesLoading ? (
                       <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 py-1">
                          <Loader2 className="w-4 h-4 animate-spin"/> Loading...
                       </span>
                    ) : isActive ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Active for Project
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-bold border border-slate-300">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span> Not selected
                       </span>
                    )}
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {projectUuid ? (
                       <>
                        <button
                          onClick={handleConfirmAlpha}
                          disabled={savingState || preferencesLoading}
                          className="flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg transition-colors flex shadow-sm"
                        >
                          {savingState ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
                          Use This α
                        </button>
                        {isActive && (
                          <button
                            onClick={handleClear}
                            disabled={savingState || preferencesLoading}
                            className="flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:text-red-600 text-slate-700 font-bold rounded-lg transition-colors flex shadow-sm"
                          >
                            <XCircle className="w-4 h-4" /> Clear
                          </button>
                        )}
                       </>
                    ) : (
                       <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 border border-amber-200 rounded-lg">
                          No project selected
                       </span>
                    )}
                 </div>
              </div>

              {saveError && (
                 <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    {saveError}
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdhesionFactorCalculator;
