import React from 'react';
import { ClipboardList, Database, CheckSquare, Calendar, User } from 'lucide-react';

const ProjectStatistics = ({ project, reportsCount, calcsCount }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Review': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'Archived': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Calculations */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Database size={24} />
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Calculations Run</span>
          <span className="text-2xl font-black text-gray-800">{calcsCount}</span>
        </div>
      </div>

      {/* Reports Generated */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <ClipboardList size={24} />
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Saved Reports</span>
          <span className="text-2xl font-black text-gray-800">{reportsCount}</span>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
          <CheckSquare size={24} />
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Project Status</span>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold border rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Date Modified */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
          <Calendar size={24} />
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Last Updated</span>
          <span className="text-sm font-bold text-gray-700 block truncate mt-1">
            {formatDate(project.modified_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatistics;
