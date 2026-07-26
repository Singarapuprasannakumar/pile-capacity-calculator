import React from 'react';
import { FolderPlus, HardHat } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyProjects = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50 text-blue-600">
        <FolderPlus size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800">No Projects Found</h3>
      <p className="max-w-md mt-2 text-gray-500 text-sm">
        Start organizing your engineering calculations, soil profiles, and design trials under a single workspace. Create your first project to get started.
      </p>
      <div className="mt-6">
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200"
        >
          <FolderPlus size={18} />
          Create First Project
        </Link>
      </div>
    </div>
  );
};

export default EmptyProjects;
