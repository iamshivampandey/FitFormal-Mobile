import axios from "axios";
import StorageService from "../../services/storage.service";
import API_CONFIG from "./config";

// Create axios instance with base configuration
const AxiosConfig = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
AxiosConfig.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await StorageService.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging (remove in production)
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common response scenarios
AxiosConfig.interceptors.response.use(
  (response) => {
    // Log successful response (remove in production)
    console.log(`API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`API Error: ${status} - ${error.config.url}`, data);
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear storage and redirect to login
          console.log('Unauthorized access - clearing storage');
          await StorageService.clearStorage();
          // You can add navigation logic here if needed
          break;
        case 403:
          console.log('Forbidden access');
          break;
        case 404:
          console.log('Resource not found');
          break;
        case 500:
          console.log('Server error');
          break;
        default:
          console.log(`Error status: ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default AxiosConfig;
