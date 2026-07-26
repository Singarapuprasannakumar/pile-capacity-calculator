import axios from 'axios';

// Align with current API server configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/projects'
  : '/projects'; // Relative for deployed production API requests

export const listProjects = async (search = '', status = '', sortBy = '') => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  if (sortBy) params.sort_by = sortBy;
  
  const response = await axios.get(API_BASE_URL, { params });
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(API_BASE_URL, projectData);
  return response.data;
};

export const getProject = async (uuid) => {
  const response = await axios.get(`${API_BASE_URL}/${uuid}`);
  return response.data;
};

export const updateProject = async (uuid, projectData) => {
  const response = await axios.put(`${API_BASE_URL}/${uuid}`, projectData);
  return response.data;
};

export const deleteProject = async (uuid) => {
  const response = await axios.delete(`${API_BASE_URL}/${uuid}`);
  return response.data;
};

export const updateSiteInfo = async (uuid, siteData) => {
  const response = await axios.put(`${API_BASE_URL}/${uuid}/site-info`, siteData);
  return response.data;
};

export const saveCalculation = async (uuid, calcData) => {
  const response = await axios.post(`${API_BASE_URL}/${uuid}/calculations`, calcData);
  return response.data;
};

export const getCalculations = async (uuid) => {
  const response = await axios.get(`${API_BASE_URL}/${uuid}/calculations`);
  return response.data;
};

export const saveReport = async (uuid, reportData) => {
  const response = await axios.post(`${API_BASE_URL}/${uuid}/reports`, reportData);
  return response.data;
};

export const getReports = async (uuid) => {
  const response = await axios.get(`${API_BASE_URL}/${uuid}/reports`);
  return response.data;
};

export const deleteReport = async (uuid, reportId) => {
  const response = await axios.delete(`${API_BASE_URL}/${uuid}/reports/${reportId}`);
  return response.data;
};

export const getActivities = async (uuid) => {
  const response = await axios.get(`${API_BASE_URL}/${uuid}/activities`);
  return response.data;
};
