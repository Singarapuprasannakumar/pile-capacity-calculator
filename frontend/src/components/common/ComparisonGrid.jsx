import React from 'react';

/**
 * Reusable comparison layout container.
 * Renders stacked list when compareMode is OFF, and 2-column grid when compareMode is ON.
 */
const ComparisonGrid = ({ children, compareMode = false, className = '' }) => {
  const containerClass = compareMode 
    ? "flex flex-col gap-8 w-full max-w-full overflow-hidden" 
    : "flex flex-col gap-10";
    
  return (
    <div className={`${containerClass} ${className}`}>
      {children}
    </div>
  );
};

export default React.memo(ComparisonGrid);
