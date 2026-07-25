import React from 'react';
import PageTitle from '../components/common/PageTitle';
import PileCalculator from '../components/calculator/PileCalculator';

const PileCapacity = () => {
  return (
    <div>
      <PageTitle 
        title="Pile Capacity Calculator" 
        subtitle="Compute shaft resistance, end bearing, and allowable capacity for multi-layer soil profiles." 
      />
      <PileCalculator />
    </div>
  );
};

export default PileCapacity;
