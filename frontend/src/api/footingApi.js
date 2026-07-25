import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function calculateFooting(inputs) {
  try {
    const response = await axios.post(`${API_BASE_URL}/footing/calculate`, inputs);
    return response.data;
  } catch (error) {
    console.error('API Error calculating footing/raft:', error);
    throw error;
  }
}
