import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, Briefcase, Calendar, FolderOpen, Trash2, ShieldAlert } from 'lucide-react';

const ProjectCard = ({ project, onDelete }) => {
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
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-100 hover:border-blue-150 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top Section */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {project.project_number}
            </span>
            <h4 className="mt-2 text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
              {project.name}
            </h4>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-medium border rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Project Metadata */}
        <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase size={16} className="text-gray-400" />
            <span className="truncate"><span className="font-medium">Client:</span> {project.client_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="truncate"><span className="font-medium">Location:</span> {project.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span><span className="font-medium">Last Modified:</span> {formatDate(project.modified_at)}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50/80 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-600">
          {project.calculations_count} {project.calculations_count === 1 ? 'Calculation' : 'Calculations'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(project)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
          <Link
            to={`/projects/${project.uuid}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <FolderOpen size={14} />
            Open Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
