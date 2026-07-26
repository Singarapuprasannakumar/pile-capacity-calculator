import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function calculateUnderReamedPile(inputs) {
  try {
    const response = await axios.post(`${API_BASE_URL}/under-reamed/calculate`, inputs);
    return response.data;
  } catch (error) {
    console.error('API Error calculating under-reamed pile capacity:', error);
    throw error;
  }
}
