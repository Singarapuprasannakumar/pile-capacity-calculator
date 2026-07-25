import React from 'react';
import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';

const UnderReamedPile = () => {
  return (
    <div>
      <PageTitle title="Under-Reamed Pile Design" subtitle="Bored cast-in-situ concrete piles with bulbs in expansive soils" />
      <EmptyState
        title="Under-Reamed Pile Calculator"
        description="This module is coming soon. It will calculate the uplift, lateral, and compression capacity of single and multi-bulb under-reamed piles in expansive clay (black cotton soil) per standard design criteria."
        codeName="IS 2911 (Part III)"
      />
    </div>
  );
};

export default UnderReamedPile;
