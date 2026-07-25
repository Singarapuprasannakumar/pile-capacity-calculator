import API from './pileApi';

/**
 * POST /sbc/calculate
 * @param {object} payload
 * @returns {Promise}
 */
export const calculateSbc = (payload) => API.post('/sbc/calculate', payload);
