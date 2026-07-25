import React from 'react';

const PageTitle = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs text-slate-500 font-medium mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default React.memo(PageTitle);
