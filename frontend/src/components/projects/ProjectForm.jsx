import React, { useState } from 'react';
import { FolderPlus, AlertCircle, Save } from 'lucide-react';

const ProjectForm = ({ initialData, onSubmit, isSubmitting, submitLabel = "Save Project" }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    project_number: initialData?.project_number || '',
    client_name: initialData?.client_name || '',
    consultant: initialData?.consultant || '',
    location: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Draft',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Project Name is required";
    if (!formData.project_number.trim()) newErrors.project_number = "Project Number is required";
    if (!formData.client_name.trim()) newErrors.client_name = "Client Name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    
    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors.latitude = "Latitude must be a valid number";
    }
    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors.longitude = "Longitude must be a valid number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const formattedData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.api && (
        <div className="flex items-center gap-2 p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <AlertCircle size={18} />
          <span>{errors.api}</span>
        </div>
      )}

      {/* General Project Parameters Card */}
      <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-2">General Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Project Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SPK High-Rise Residency"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          {/* Project Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Project Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="project_number"
              value={formData.project_number}
              onChange={handleChange}
              disabled={!!initialData?.project_number} // Lock key project identifier on edits
              placeholder="e.g. PRJ-2026-001"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${initialData?.project_number ? 'bg-gray-50 text-gray-500 border-gray-200' : errors.project_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.project_number && <span className="text-xs text-red-500">{errors.project_number}</span>}
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Client Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="e.g. SPK Infra Ltd"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${errors.client_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.client_name && <span className="text-xs text-red-500">{errors.client_name}</span>}
          </div>

          {/* Consultant */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Consultant Engineer</label>
            <input
              type="text"
              name="consultant"
              value={formData.consultant}
              onChange={handleChange}
              placeholder="e.g. Design Tech Consultants"
              className="px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Location */}
          <div className="md:col-span-1 flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Visakhapatnam, AP"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
          </div>

          {/* Latitude */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 17.6868"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${errors.latitude ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.latitude && <span className="text-xs text-red-500">{errors.latitude}</span>}
          </div>

          {/* Longitude */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 83.2185"
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 ${errors.longitude ? 'border-red-500 focus:ring-red-200' : 'border-gray-250 focus:ring-blue-100'}`}
            />
            {errors.longitude && <span className="text-xs text-red-500">{errors.longitude}</span>}
          </div>
        </div>

        {/* Status & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Project Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief description of the structure, scope of work, etc."
              rows={2}
              className="px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-sm transition"
        >
          <Save size={18} />
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
