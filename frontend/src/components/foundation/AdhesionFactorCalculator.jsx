import React, { useState, useEffect } from 'react';
import { calculateAdhesionFactor } from '../../api/adhesionFactorApi';
import AdhesionResults from './AdhesionResults';
import { Calculator, AlertCircle, Loader2 } from 'lucide-react';

const AdhesionFactorCalculator = ({ initialCohesion = '' }) => {
  const [cohesion, setCohesion] = useState(initialCohesion);
  const [pileType, setPileType] = useState('concrete');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        </div>
      )}
    </div>
  );
};

export default AdhesionFactorCalculator;
