import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Search, Filter, ArrowUpDown, Loader2, AlertCircle } from 'lucide-react';
import PageTitle from '../components/common/PageTitle';
import ProjectCard from '../components/projects/ProjectCard';
import EmptyProjects from '../components/projects/EmptyProjects';
import ProjectDeleteDialog from '../components/projects/ProjectDeleteDialog';
import { listProjects, deleteProject } from '../api/projectApi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('modified');

  // Deletion State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjectsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProjects(searchQuery, statusFilter, sortBy);
      setProjects(data);
    } catch (err) {
      console.error("Error loading projects list:", err);
      setError("Failed to fetch projects database. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsList();
  }, [searchQuery, statusFilter, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.uuid);
      // Remove from list
      setProjects(prev => prev.filter(p => p.uuid !== deleteTarget.uuid));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle 
          title="Project Workspace" 
          subtitle="Manage, organize, and track geotechnical calculations by engineering project" 
        />
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <FolderPlus size={18} />
          New Project
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, client, location, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-250 rounded-xl text-sm focus:outline-none bg-white font-medium text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-250 rounded-xl text-sm focus:outline-none bg-white font-medium text-gray-700"
            >
              <option value="modified">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Project Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <span className="text-sm font-semibold">Loading projects database...</span>
        </div>
      ) : projects.length === 0 ? (
        <EmptyProjects />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
            <ProjectCard
              key={proj.uuid}
              project={proj}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <ProjectDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        projectName={deleteTarget?.name}
      />
    </div>
  );
};

export default Projects;
