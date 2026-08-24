import API from './pileApi';

export const calculateSptSoil = async (data) => {
  try {
    const response = await API.post(`/spt-soil/calculate`, data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw Math.floor(error.response.status / 100) === 4
        ? error.response.data
        : new Error('Failed to connect to computing server.');
    }
    throw new Error('Network error. Is the server running?');
  }
};
