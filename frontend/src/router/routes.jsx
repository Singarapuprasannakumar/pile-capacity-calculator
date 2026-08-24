import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import PileCapacity from '../pages/PileCapacity';
import SBC6403 from '../pages/SBC6403';
import FootingRaft from '../pages/FootingRaft';
import SoilClassification from '../pages/SoilClassification';
import UnderReamedPile from '../pages/UnderReamedPile';
import FoundationTools from '../pages/FoundationTools';
import Projects from '../pages/Projects';
import CreateProject from '../pages/CreateProject';
import ProjectWorkspace from '../pages/ProjectWorkspace';
import BoreholeWorkspace from '../pages/BoreholeWorkspace';
import Antigravity from '../pages/Antigravity';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pile-capacity" element={<PileCapacity />} />
        <Route path="sbc" element={<SBC6403 />} />
        <Route path="footing-raft" element={<FootingRaft />} />
        <Route path="soil-classification" element={<SoilClassification />} />
        <Route path="under-reamed-pile" element={<UnderReamedPile />} />
        <Route path="foundation/:toolId" element={<FoundationTools />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<CreateProject />} />
        <Route path="projects/:uuid" element={<ProjectWorkspace />} />
        <Route path="projects/:uuid/boreholes/:boreholeUuid" element={<BoreholeWorkspace />} />
        <Route path="antigravity" element={<Antigravity />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

