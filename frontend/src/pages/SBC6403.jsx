import React from 'react';
import PageTitle from '../components/common/PageTitle';
import SBCCalculator from '../components/sbc/SBCCalculator';

const SBC6403 = () => {
  return (
    <div>
      <PageTitle 
        title="Safe Bearing Capacity" 
        subtitle="IS 6403:1981 Shallow Foundation Bearing Capacity Evaluation" 
      />
      <SBCCalculator />
    </div>
  );
};

export default SBC6403;
