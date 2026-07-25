import React from 'react';
import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';

const Settings = () => {
  return (
    <div>
      <PageTitle title="Settings" subtitle="System preferences and engineering design configurations" />
      <EmptyState
        title="Settings & System Configurations"
        description="The Settings panel is coming soon. It will allow you to configure system defaults (metric vs imperial units, default safety factors, default soil parameters), company branding logos, signature blocks for PDF exports, and database sync setups."
        codeName="Preferences"
      />
    </div>
  );
};

export default Settings;
