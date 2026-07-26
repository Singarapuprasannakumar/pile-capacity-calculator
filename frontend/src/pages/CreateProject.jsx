import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import PageTitle from '../components/common/PageTitle';
import ProjectForm from '../components/projects/ProjectForm';
import { createProject } from '../api/projectApi';

const CreateProject = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (projectData) => {
    setSubmitting(true);
    setError(null);
    try {
      const newUuid = await createProject(projectData);
      // Navigate directly to the opened project workspace
      navigate(`/projects/${newUuid}`);
    } catch (err) {
      console.error("Error creating project:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to create project. Please verify that the project number is unique.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-150 rounded-xl transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageTitle 
          title="Create New Project" 
          subtitle="Define general site metadata, consultant and key parameters" 
        />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <ProjectForm
        onSubmit={handleFormSubmit}
        isSubmitting={submitting}
        submitLabel="Create Project & Open Workspace"
      />
    </div>
  );
};

export default CreateProject;
