import React, { useState } from 'react';
import { calculateNq } from '../../api/nqApi';
import NqResults from './NqResults';
import { Calculator, AlertCircle, Loader2 } from 'lucide-react';

const NqCalculator = () => {
  const [phi, setPhi] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phi === '' || isNaN(phi) || Number(phi) <= 0) {
      setError('φ must be positive. Please enter a valid number.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await calculateNq({ phi: parseFloat(phi) });
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
          <h2 className="text-lg font-bold text-slate-800">IS:2911 Nq CALCULATOR</h2>
        </div>
        
        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          Based on IS:2911 Part I-1979 - Fig 16.6<br/>
          Bearing Capacity Factor (Nq) for Driven Piles<br/>
          Note: Nq is a dimensionless bearing capacity factor.<br/>
          Valid range: φ' = 20° to 45°
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Angle of internal friction (φ') <span className="text-slate-400 font-normal">(degrees, 20-45)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={phi}
              onChange={(e) => {
                setPhi(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 35"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
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
           <NqResults result={result} />
        </div>
      )}
    </div>
  );
};

export default NqCalculator;
