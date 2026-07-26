import React from 'react';
import { MapPin, Briefcase, Calendar, Info, Settings, Trash2 } from 'lucide-react';

const ProjectHeader = ({ project, activeTab, onTabChange }) => {
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

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Upper Info Banner */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {project.project_number}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-medium border rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-800 mt-2">
              {project.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl line-clamp-1">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <span><span className="font-semibold text-gray-700">Client:</span> {project.client_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span><span className="font-semibold text-gray-700">Location:</span> {project.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="px-6 bg-gray-50/30 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'site-info', label: 'Site Information' },
          { id: 'calculations', label: 'Calculations History' },
          { id: 'reports', label: 'Reports Center' },
          { id: 'activities', label: 'Activity Logs' },
          { id: 'settings', label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectHeader;
