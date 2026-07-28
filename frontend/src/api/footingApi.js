import API from './pileApi';

/**
 * POST /footing/calculate
 * @param {object} inputs
 * @returns {Promise}
 */
export async function calculateFooting(inputs) {
  try {
    const response = await API.post('/footing/calculate', inputs);
    return response.data;
  } catch (error) {
    console.error('API Error calculating footing/raft:', error);
    throw error;
  }
}
