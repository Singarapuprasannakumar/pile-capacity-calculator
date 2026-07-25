import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function classifySoil(inputs) {
  try {
    const response = await axios.post(`${API_BASE_URL}/soil/classify`, inputs);
    return response.data;
  } catch (error) {
    console.error('API Error classifying soil:', error);
    throw error;
  }
}
