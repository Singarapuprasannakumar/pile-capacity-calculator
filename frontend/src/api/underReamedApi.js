import API from './pileApi';

/**
 * POST /under-reamed/calculate
 * @param {object} inputs
 * @returns {Promise}
 */
export async function calculateUnderReamedPile(inputs) {
  try {
    const response = await API.post('/under-reamed/calculate', inputs);
    return response.data;
  } catch (error) {
    console.error('API Error calculating under-reamed pile capacity:', error);
    throw error;
  }
}
