import axios from 'axios';

const ROOT_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : ''; // Relative for deployed production requests

// Boreholes CRUD
export const listBoreholes = async (projectUuid) => {
  const response = await axios.get(`${ROOT_BASE}/projects/${projectUuid}/boreholes`);
  return response.data;
};

export const createBorehole = async (projectUuid, boreholeData) => {
  const response = await axios.post(`${ROOT_BASE}/projects/${projectUuid}/boreholes`, boreholeData);
  return response.data;
};

export const getBorehole = async (uuid) => {
  const response = await axios.get(`${ROOT_BASE}/boreholes/${uuid}`);
  return response.data;
};

export const updateBorehole = async (uuid, boreholeData) => {
  const response = await axios.put(`${ROOT_BASE}/boreholes/${uuid}`, boreholeData);
  return response.data;
};

export const deleteBorehole = async (uuid) => {
  const response = await axios.delete(`${ROOT_BASE}/boreholes/${uuid}`);
  return response.data;
};

// Soil Layers CRUD
export const listSoilLayers = async (boreholeUuid) => {
  const response = await axios.get(`${ROOT_BASE}/boreholes/${boreholeUuid}/layers`);
  return response.data;
};

export const createSoilLayer = async (boreholeUuid, layerData) => {
  const response = await axios.post(`${ROOT_BASE}/boreholes/${boreholeUuid}/layers`, layerData);
  return response.data;
};

export const updateSoilLayer = async (boreholeUuid, layerUuid, layerData) => {
  const response = await axios.put(`${ROOT_BASE}/boreholes/${boreholeUuid}/layers/${layerUuid}`, layerData);
  return response.data;
};

export const deleteSoilLayer = async (boreholeUuid, layerUuid) => {
  const response = await axios.delete(`${ROOT_BASE}/boreholes/${boreholeUuid}/layers/${layerUuid}`);
  return response.data;
};

export const bulkSaveSoilLayers = async (boreholeUuid, layersList) => {
  const response = await axios.post(`${ROOT_BASE}/boreholes/${boreholeUuid}/layers/bulk`, layersList);
  return response.data;
};

export const getStrataWarnings = async (boreholeUuid) => {
  const response = await axios.get(`${ROOT_BASE}/boreholes/${boreholeUuid}/warnings`);
  return response.data;
};

// SPT Records CRUD
export const listSptRecords = async (boreholeUuid) => {
  const response = await axios.get(`${ROOT_BASE}/boreholes/${boreholeUuid}/spt`);
  return response.data;
};

export const createSptRecord = async (boreholeUuid, sptData) => {
  const response = await axios.post(`${ROOT_BASE}/boreholes/${boreholeUuid}/spt`, sptData);
  return response.data;
};

export const updateSptRecord = async (boreholeUuid, sptUuid, sptData) => {
  const response = await axios.put(`${ROOT_BASE}/boreholes/${boreholeUuid}/spt/${sptUuid}`, sptData);
  return response.data;
};

export const deleteSptRecord = async (boreholeUuid, sptUuid) => {
  const response = await axios.delete(`${ROOT_BASE}/boreholes/${boreholeUuid}/spt/${sptUuid}`);
  return response.data;
};

// Groundwater Logs CRUD
export const listGroundwaterLogs = async (boreholeUuid) => {
  const response = await axios.get(`${ROOT_BASE}/boreholes/${boreholeUuid}/groundwater`);
  return response.data;
};

export const createGroundwaterLog = async (boreholeUuid, gwData) => {
  const response = await axios.post(`${ROOT_BASE}/boreholes/${boreholeUuid}/groundwater`, gwData);
  return response.data;
};

export const deleteGroundwaterLog = async (boreholeUuid, logUuid) => {
  const response = await axios.delete(`${ROOT_BASE}/boreholes/${boreholeUuid}/groundwater/${logUuid}`);
  return response.data;
};
