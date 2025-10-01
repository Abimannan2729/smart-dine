import axios from 'axios';

// Get base URL from environment variables or use default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for FormData uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      tokenValue: token,
      tokenType: typeof token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      isFormData: config.data instanceof FormData
    });
    
    if (token) {
      const authHeader = `Bearer ${token}`;
      console.log('Setting Authorization header:', authHeader.substring(0, 30) + '...');
      config.headers.Authorization = authHeader;
    } else {
      console.log('No token found, not setting Authorization header');
    }
    
    // Handle FormData uploads - remove Content-Type to let browser set boundary
    if (config.data instanceof FormData) {
      console.log('FormData detected, removing Content-Type header to allow multipart boundary');
      delete config.headers['Content-Type'];
    }
    
    // Log final headers being sent
    console.log('Final request headers:', {
      Authorization: config.headers.Authorization ? String(config.headers.Authorization).substring(0, 30) + '...' : 'not set',
      'Content-Type': config.headers['Content-Type'] || 'auto-detected'
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      error: error.message
    });
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;