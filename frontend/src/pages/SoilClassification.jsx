import React from 'react';
import PageTitle from '../components/common/PageTitle';
import SoilClassificationCalculator from '../components/soil/SoilClassificationCalculator';

const SoilClassification = () => {
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Soil Classification" 
        subtitle="Unified Soil Classification System (USCS) and IS 1498:1970 Soil Classification & Engineering Suitability Properties" 
      />
      <SoilClassificationCalculator />
    </div>
  );
};

export default SoilClassification;
