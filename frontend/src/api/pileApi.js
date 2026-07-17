import axios from 'axios';

// Get API base from environment variable
let API_BASE = import.meta.env.VITE_API_URL || '/api';
if (API_BASE && API_BASE !== '/api') {
  API_BASE = API_BASE.replace(/\/$/, '');
}

const API = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

/**
 * Response interceptor – normalises every error into a human-readable message.
 * Priority order:
 *  1. FastAPI validation detail array → joined list
 *  2. Backend detail string
 *  3. Backend message string
 *  4. HTTP status text (e.g. "404 Not Found")
 *  5. Network-level message (e.g. "Backend service unavailable.")
 *  6. Generic fallback
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Backend service unavailable.';

    if (error.response) {
      // Server returned a response (4xx / 5xx)
      const data = error.response.data;
      const status = error.response.status;

      if (data?.detail) {
        // FastAPI validation errors come as an array
        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((d) => `${d.loc?.slice(1).join(' → ') ?? 'field'}: ${d.msg}`)
            .join('\n');
        } else {
          message = String(data.detail);
        }
      } else if (data?.message) {
        message = String(data.message);
      } else if (typeof data === 'string' && data.length > 0) {
        message = data;
      } else {
        message = `Server responded with ${status} ${error.response.statusText || ''}`.trim();
      }
    } else if (error.request) {
      // Request was made but no response received (network / CORS / server down)
      const isTimeout = error.code === 'ECONNABORTED';
      if (isTimeout) {
        message = 'Request timed out. The backend is taking too long to respond.';
      } else {
        message = 'Backend service unavailable.';
      }
    } else {
      // Something went wrong setting up the request
      message = error.message || message;
    }

    // Attach the human-readable message so components can display it directly
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

/**
 * POST /calculate
 * @param {{ diameter: number, layers: object[], tip: object }} payload
 * @returns {Promise<AxiosResponse<{layerResults, Qp, Qu, Qa}>>}
 */
export const calculateCapacity = (payload) => API.post('/calculate', payload);

export default API;
