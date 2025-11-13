/**
 * API Configuration
 * 
 * Update these values based on your environment:
 * - Development: Use your local backend URL (e.g., http://localhost:5000)
 * - Production: Use your production backend URL
 * 
 * For Android Emulator, use 10.0.2.2 instead of localhost
 * For iOS Simulator, use localhost or your computer's IP address
 */

const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL: 'http://localhost:5000',
  
  // Alternative URLs for different environments
  // Uncomment the one you need:
  
  // For Android Emulator:
  // BASE_URL: 'http://10.0.2.2:5000',
  
  // For Physical Device (replace with your computer's IP):
  // BASE_URL: 'http://192.168.1.100:5000',
  
  // For Production:
  // BASE_URL: 'https://your-production-api.com',
  
  // API timeout in milliseconds
  TIMEOUT: 30000,
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // User endpoints
    GET_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    
    // Product endpoints
    GET_PRODUCTS: '/api/products',
    GET_PRODUCT: '/api/products/:id',
    CREATE_PRODUCT: '/api/products',
    UPDATE_PRODUCT: '/api/products/:id',
    DELETE_PRODUCT: '/api/products/:id',
    
    // Measurement endpoints
    GET_MEASUREMENTS: '/api/measurements',
    CREATE_MEASUREMENT: '/api/measurements',
    UPDATE_MEASUREMENT: '/api/measurements/:id',
    
    // Order endpoints
    GET_ORDERS: '/api/orders',
    CREATE_ORDER: '/api/orders',
    UPDATE_ORDER: '/api/orders/:id',
  },
};

export default API_CONFIG;

