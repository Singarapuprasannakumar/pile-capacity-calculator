import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ProjectDeleteDialog = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 transform scale-100 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 rounded-lg bg-red-50">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold">Delete Project</h3>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{projectName}"</span>? This project will be moved to the archive and will no longer show up on your dashboard.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              All linked trial calculations and saved reports will be hidden, but can be restored later by an administrator.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
            >
              <Trash2 size={16} />
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDeleteDialog;
