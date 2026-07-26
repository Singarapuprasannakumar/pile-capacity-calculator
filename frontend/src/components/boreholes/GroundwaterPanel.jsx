import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

const GroundwaterPanel = ({ logs, onAddLog, onDeleteLog }) => {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [depth, setDepth] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = parseFloat(depth);
    if (isNaN(d) || d < 0) {
      alert("Water table depth must be a positive number.");
      return;
    }

    const payload = {
      measured_date: date,
      water_depth: d,
      remarks: remarks.trim() || null
    };

    onAddLog(payload);
    setDepth('');
    setRemarks('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h4 className="text-sm font-bold text-gray-800">Groundwater Table Monitoring Logs</h4>
      </div>

      {/* Log Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 items-end">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Observation Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Water Depth below GL (m)</label>
          <input
            type="number"
            step="0.01"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder="e.g. 3.25"
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Notes / Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Stabilized level"
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition h-[38px]"
        >
          <Plus size={14} />
          Record observation
        </button>
      </form>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-100 rounded-2xl text-xs text-gray-400 font-bold uppercase tracking-wider">
          No groundwater records logged. Record water table levels above.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-55 text-gray-400 border-b border-gray-100 font-extrabold uppercase tracking-wider">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Water Level Depth (m)</th>
                <th className="py-2.5 px-4">Remarks / Conditions</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-bold">
              {logs.map(log => (
                <tr key={log.uuid} className="hover:bg-gray-50/20">
                  <td className="py-3 px-4 text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{log.measured_date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-blue-600">{log.water_depth.toFixed(2)} m</td>
                  <td className="py-3 px-4 font-semibold text-gray-500">
                    {log.remarks || <span className="text-gray-400 font-normal italic">None</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteLog(log.uuid)}
                      className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition"
                      title="Delete water log entry"
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

export default GroundwaterPanel;
