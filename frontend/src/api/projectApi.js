import API from './pileApi';

export const listProjects = async (search = '', status = '', sortBy = '') => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  if (sortBy) params.sort_by = sortBy;
  
  const response = await API.get('/projects', { params });
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await API.post('/projects', projectData);
  return response.data;
};

export const getProject = async (uuid) => {
  const response = await API.get(`/projects/${uuid}`);
  return response.data;
};

export const updateProject = async (uuid, projectData) => {
  const response = await API.put(`/projects/${uuid}`, projectData);
  return response.data;
};

export const deleteProject = async (uuid) => {
  const response = await API.delete(`/projects/${uuid}`);
  return response.data;
};

export const updateSiteInfo = async (uuid, siteData) => {
  const response = await API.put(`/projects/${uuid}/site-info`, siteData);
  return response.data;
};

export const saveCalculation = async (uuid, calcData) => {
  const response = await API.post(`/projects/${uuid}/calculations`, calcData);
  return response.data;
};

export const getCalculations = async (uuid) => {
  const response = await API.get(`/projects/${uuid}/calculations`);
  return response.data;
};

export const saveReport = async (uuid, reportData) => {
  const response = await API.post(`/projects/${uuid}/reports`, reportData);
  return response.data;
};

export const getReports = async (uuid) => {
  const response = await API.get(`/projects/${uuid}/reports`);
  return response.data;
};

export const deleteReport = async (uuid, reportId) => {
  const response = await API.delete(`/projects/${uuid}/reports/${reportId}`);
  return response.data;
};

export const getActivities = async (uuid) => {
  const response = await API.get(`/projects/${uuid}/activities`);
  return response.data;
};
