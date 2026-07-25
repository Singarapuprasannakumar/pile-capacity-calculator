import React from 'react';
import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';

const Projects = () => {
  return (
    <div>
      <PageTitle title="Saved Projects" subtitle="Manage foundation design projects, clients, and design files" />
      <EmptyState
        title="Saved Projects Database"
        description="The Saved Projects database module is coming soon. You will be able to organize multiple calculations, store engineering site data, assign designs to specific client files, and reload calculations instantly."
        codeName="Project Database"
      />
    </div>
  );
};

export default Projects;
