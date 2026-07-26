import React from 'react';
import PageTitle from '../components/common/PageTitle';
import UnderReamedPileCalculator from '../components/underReamed/UnderReamedPileCalculator';

const UnderReamedPile = () => {
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Under-Reamed Pile Design" 
        subtitle="Bored concrete piles with multi-bulbs in expansive clay / black cotton soils (IS 2911 Part 3)" 
      />
      <UnderReamedPileCalculator />
    </div>
  );
};

export default UnderReamedPile;
