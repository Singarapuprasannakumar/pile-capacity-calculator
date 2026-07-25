import React from 'react';
import { Wrench } from 'lucide-react';
import Card from './Card';

const EmptyState = ({ title, description, codeName }) => {
  return (
    <Card className="max-w-2xl mx-auto text-center py-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <Wrench className="w-8 h-8" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {codeName && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {codeName}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-500 max-w-md">
          {description || "We are currently developing this module. It will feature standard engineering equations, validation, and multi-format reports."}
        </p>

        <div className="pt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide animate-pulse">
            🔨 Under Development
          </span>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(EmptyState);
