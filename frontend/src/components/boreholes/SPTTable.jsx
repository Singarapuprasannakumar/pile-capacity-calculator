import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';

const SPTTable = ({ sptRecords, onAddRecord, onDeleteRecord }) => {
  const [depth, setDepth] = useState('');
  const [nValue, setNValue] = useState('');
  const [correctedN, setCorrectedN] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = parseFloat(depth);
    const n = parseInt(nValue);
    if (isNaN(d) || d < 0) {
      alert("Depth must be a positive number.");
      return;
    }
    if (isNaN(n) || n < 0) {
      alert("N-value must be a non-negative integer.");
      return;
    }

    const payload = {
      depth: d,
      n_value: n,
      corrected_n: correctedN.trim() !== '' ? parseFloat(correctedN) : null
    };

    onAddRecord(payload);
    setDepth('');
    setNValue('');
    setCorrectedN('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h4 className="text-sm font-bold text-gray-800">Standard Penetration Test (SPT) Logs</h4>
      </div>

      {/* Add SPT Record Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 items-end">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Depth of Test (m)</label>
          <input
            type="number"
            step="0.01"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder="e.g. 1.50"
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Raw Blow Count N</label>
          <input
            type="number"
            value={nValue}
            onChange={(e) => setNValue(e.target.value)}
            placeholder="e.g. 12"
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Corrected N'' (Optional)</label>
          <input
            type="number"
            step="0.1"
            value={correctedN}
            onChange={(e) => setCorrectedN(e.target.value)}
            placeholder="e.g. 14.5"
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition h-[38px]"
        >
          <Plus size={14} />
          Log test
        </button>
      </form>

      {/* SPT Records Table */}
      {sptRecords.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-100 rounded-2xl text-xs text-gray-400 font-bold uppercase tracking-wider">
          No SPT records logged. Input depth and blows above to record.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-55 text-gray-400 border-b border-gray-100 font-extrabold uppercase tracking-wider">
                <th className="py-2.5 px-4">Depth (m)</th>
                <th className="py-2.5 px-4">Raw Blow Count (N)</th>
                <th className="py-2.5 px-4">Corrected N-value (N'')</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-bold">
              {sptRecords.map(s => (
                <tr key={s.uuid} className="hover:bg-gray-50/20">
                  <td className="py-3 px-4 text-gray-800">{s.depth.toFixed(2)} m</td>
                  <td className="py-3 px-4 text-blue-600">{s.n_value} blows</td>
                  <td className="py-3 px-4">
                    {s.corrected_n !== null ? (
                      <span className="text-emerald-600">{s.corrected_n.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteRecord(s.uuid)}
                      className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition"
                      title="Delete SPT record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SPTTable;
