import React from 'react';
import { Database, Plus } from 'lucide-react';

const EmptyBoreholes = ({ onCreateClick }) => {
  return (
    <div className="p-12 bg-blue-50/20 border border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
        <Database size={24} />
      </div>
      <h4 className="text-md font-bold text-gray-800">No Borehole Logs Found</h4>
      <p className="text-sm text-gray-500 max-w-md mt-2">
        Create your first borehole log to start mapping soil stratigraphy, SPT blow counts, and groundwater readings.
      </p>
      <button
        onClick={onCreateClick}
        className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition"
      >
        <Plus size={14} />
        Add Borehole Log
      </button>
    </div>
  );
};

export default EmptyBoreholes;
