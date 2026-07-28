import API from './pileApi';

/**
 * POST /soil/classify
 * @param {object} inputs
 * @returns {Promise}
 */
export async function classifySoil(inputs) {
  try {
    const response = await API.post('/soil/classify', inputs);
    return response.data;
  } catch (error) {
    console.error('API Error classifying soil:', error);
    throw error;
  }
}
