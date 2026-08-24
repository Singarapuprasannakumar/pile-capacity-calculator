import API from './pileApi';

export const calculateNq = async (data) => {
  try {
    const response = await API.post(`/nq/calculate`, data);
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
