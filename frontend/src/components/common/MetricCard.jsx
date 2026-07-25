import React from 'react';

const MetricCard = ({ label, value, icon: Icon, className = '', color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const iconColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center justify-between ${className}`}>
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconColor}`}>
          <Icon className="w-6 h-6 shrink-0" />
        </div>
      )}
    </div>
  );
};

export default React.memo(MetricCard);
