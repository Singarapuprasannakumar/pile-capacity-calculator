import API from './pileApi';

// Boreholes CRUD
export const listBoreholes = async (projectUuid) => {
  const response = await API.get(`/projects/${projectUuid}/boreholes`);
  return response.data;
};

export const createBorehole = async (projectUuid, boreholeData) => {
  const response = await API.post(`/projects/${projectUuid}/boreholes`, boreholeData);
  return response.data;
};

export const getBorehole = async (uuid) => {
  const response = await API.get(`/boreholes/${uuid}`);
  return response.data;
};

export const updateBorehole = async (uuid, boreholeData) => {
  const response = await API.put(`/boreholes/${uuid}`, boreholeData);
  return response.data;
};

export const deleteBorehole = async (uuid) => {
  const response = await API.delete(`/boreholes/${uuid}`);
  return response.data;
};

// Soil Layers CRUD
export const listSoilLayers = async (boreholeUuid) => {
  const response = await API.get(`/boreholes/${boreholeUuid}/layers`);
  return response.data;
};

export const createSoilLayer = async (boreholeUuid, layerData) => {
  const response = await API.post(`/boreholes/${boreholeUuid}/layers`, layerData);
  return response.data;
};

export const updateSoilLayer = async (boreholeUuid, layerUuid, layerData) => {
  const response = await API.put(`/boreholes/${boreholeUuid}/layers/${layerUuid}`, layerData);
  return response.data;
};

export const deleteSoilLayer = async (boreholeUuid, layerUuid) => {
  const response = await API.delete(`/boreholes/${boreholeUuid}/layers/${layerUuid}`);
  return response.data;
};

export const bulkSaveSoilLayers = async (boreholeUuid, layersList) => {
  const response = await API.post(`/boreholes/${boreholeUuid}/layers/bulk`, layersList);
  return response.data;
};

export const getStrataWarnings = async (boreholeUuid) => {
  const response = await API.get(`/boreholes/${boreholeUuid}/warnings`);
  return response.data;
};

// SPT Records CRUD
export const listSptRecords = async (boreholeUuid) => {
  const response = await API.get(`/boreholes/${boreholeUuid}/spt`);
  return response.data;
};

export const createSptRecord = async (boreholeUuid, sptData) => {
  const response = await API.post(`/boreholes/${boreholeUuid}/spt`, sptData);
  return response.data;
};

export const updateSptRecord = async (boreholeUuid, sptUuid, sptData) => {
  const response = await API.put(`/boreholes/${boreholeUuid}/spt/${sptUuid}`, sptData);
  return response.data;
};

export const deleteSptRecord = async (boreholeUuid, sptUuid) => {
  const response = await API.delete(`/boreholes/${boreholeUuid}/spt/${sptUuid}`);
  return response.data;
};

// Groundwater Logs CRUD
export const listGroundwaterLogs = async (boreholeUuid) => {
  const response = await API.get(`/boreholes/${boreholeUuid}/groundwater`);
  return response.data;
};

export const createGroundwaterLog = async (boreholeUuid, gwData) => {
  const response = await API.post(`/boreholes/${boreholeUuid}/groundwater`, gwData);
  return response.data;
};

export const deleteGroundwaterLog = async (boreholeUuid, logUuid) => {
  const response = await API.delete(`/boreholes/${boreholeUuid}/groundwater/${logUuid}`);
  return response.data;
};
