import React from 'react';
import PageTitle from '../components/common/PageTitle';
import FootingRaftCalculator from '../components/footing/FootingRaftCalculator';

const FootingRaft = () => {
  return (
    <div>
      <PageTitle 
        title="Footing & Raft Design" 
        subtitle="Compute Net Safe Bearing Pressure for Isolated Footings and Raft Foundations" 
      />
      <FootingRaftCalculator />
    </div>
  );
};

export default FootingRaft;
