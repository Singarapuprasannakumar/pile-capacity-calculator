import React from 'react';
import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';

const Reports = () => {
  return (
    <div>
      <PageTitle title="Reports" subtitle="Unified engineering calculation report repository" />
      <EmptyState
        title="Engineering Reports Hub"
        description="The unified Reports module is coming soon. It will aggregate reports generated from all active calculators (Pile Capacity, SBC, Footings, Soil Classification) and allow bulk downloading, PDF previews, and customization of company branding headers."
        codeName="Reporting Hub"
      />
    </div>
  );
};

export default Reports;
