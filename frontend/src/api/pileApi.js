import axios from 'axios';

// Get API base from environment variable
let API_BASE = import.meta.env.VITE_API_URL || '/api';
if (API_BASE && API_BASE !== '/api') {
  API_BASE = API_BASE.replace(/\/$/, '');
}

// Log the resolved API base URL during startup
console.log("API Base URL:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request logging interceptor
API.interceptors.request.use(
  (config) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    console.log(">>> API Request:", {
      url: `${config.baseURL || ''}${config.url}`,
      origin: origin,
      payload: config.data
    });
    return config;
  },
  (error) => {
    console.error(">>> API Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// Response logging interceptor
API.interceptors.response.use(
  (response) => {
    console.log("<<< API Response:", {
      status: response.status,
      headers: response.headers,
      body: response.data
    });
    return response;
  },
  (error) => {
    let message = 'An unexpected network error occurred.';
    let type = 'Unknown Error';

    // 1. Check if user is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      type = 'Network unavailable';
      message = 'Your device is not connected to the internet. Please check your network connection.';
    }
    // 2. Server responded with a status code (4xx / 5xx)
    else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      console.log("<<< API Response Error:", {
        status: status,
        headers: error.response.headers,
        body: data
      });

      if (status === 422) {
        type = 'Validation error';
        if (data?.detail && Array.isArray(data.detail)) {
          message = data.detail
            .map((d) => `${d.loc?.slice(1).join(' → ') ?? 'field'}: ${d.msg}`)
            .join('\n');
        } else if (data?.detail) {
          message = String(data.detail);
        } else {
          message = 'Input data validation failed. Please check the values entered.';
        }
      } else if (status === 500) {
        type = '500 Internal Server Error';
        message = 'Internal Server Error. The backend encountered an unexpected condition. Please check server logs.';
      } else if (status === 404) {
        type = '404 Not Found';
        message = `Requested resource was not found. Please verify the API URL: ${API_BASE}`;
      } else {
        type = `HTTP ${status} Error`;
        message = data?.detail || data?.message || error.response.statusText || 'Server responded with an error status.';
      }
    }
    // 3. Request was made but no response was received (Timeout or CORS block)
    else if (error.request) {
      const isTimeout = error.code === 'ECONNABORTED';
      console.log("<<< API Response Error (No Response):", error.message);
      
      if (isTimeout) {
        type = 'Connection timeout';
        message = 'Connection timeout. The backend is taking too long to respond (exceeded 30 seconds).';
      } else {
        type = 'CORS blocked / Server offline';
        message = 'CORS blocked or Server offline. The request was blocked by the browser CORS policy or the backend service is currently offline.';
      }
    }
    // 4. Request setup failure
    else {
      type = 'Request configuration error';
      message = error.message || 'Failed to setup request parameters.';
    }

    // Wrap the error with full diagnostic detail
    error.friendlyMessage = `[${type}] ${message}`;
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
