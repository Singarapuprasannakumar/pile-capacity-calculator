import React from 'react';
import BoreholeCard from './BoreholeCard';

const BoreholeList = ({ boreholes, onOpen, onArchive, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boreholes.map(b => (
        <BoreholeCard
          key={b.uuid}
          borehole={b}
          onOpen={() => onOpen(b.uuid)}
          onArchive={() => onArchive(b.uuid)}
          onDelete={() => onDelete(b.uuid)}
        />
      ))}
    </div>
  );
};

export default BoreholeList;
