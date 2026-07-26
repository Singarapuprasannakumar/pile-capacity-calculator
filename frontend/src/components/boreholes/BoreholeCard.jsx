import React from 'react';
import { Database, FolderOpen, Archive, Trash2, Calendar, ClipboardList } from 'lucide-react';

const BoreholeCard = ({ borehole, onOpen, onArchive, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Validated': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'Archived': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-100 hover:border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h4 className="text-md font-bold text-gray-800 leading-tight">
                {borehole.name}
              </h4>
              <span className="text-[10px] font-semibold text-gray-400 font-mono tracking-wider">
                ID: {borehole.uuid.substring(0, 8)}...
              </span>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${getStatusColor(borehole.status)}`}>
            {borehole.status}
          </span>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-semibold text-gray-600">
          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ground Level</span>
            <span className="text-sm font-bold text-gray-700 mt-0.5 block">{borehole.ground_level.toFixed(2)} m</span>
          </div>
          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Termination</span>
            <span className="text-sm font-bold text-gray-700 mt-0.5 block">{borehole.termination_depth.toFixed(2)} m</span>
          </div>
          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Layers Count</span>
            <span className="text-sm font-bold text-gray-700 mt-0.5 block">{borehole.layers_count} strata</span>
          </div>
          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SPT Records</span>
            <span className="text-sm font-bold text-gray-700 mt-0.5 block">{borehole.spt_count} runs</span>
          </div>
        </div>

        {/* Location / Remarks */}
        {borehole.location && (
          <p className="text-xs text-gray-400 font-medium mt-3 italic line-clamp-1">
            Loc: {borehole.location}
          </p>
        )}
      </div>

      {/* Card Action footer */}
      <div className="border-t border-gray-50 pt-3 flex items-center justify-between gap-1.5 mt-2">
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold rounded-xl uppercase tracking-wider transition"
        >
          <FolderOpen size={14} />
          Workspace
        </button>

        {borehole.status !== 'Archived' && (
          <button
            onClick={onArchive}
            title="Archive Borehole"
            className="p-2 border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition"
          >
            <Archive size={14} />
          </button>
        )}

        <button
          onClick={onDelete}
          title="Delete Borehole"
          className="p-2 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default BoreholeCard;
