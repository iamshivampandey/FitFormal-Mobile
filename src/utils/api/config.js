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

import { Platform } from 'react-native';

const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL:
    Platform.OS === 'android'
      ? 'http://10.0.2.2:5000' // Android emulator: forward to host machine
      : 'http://localhost:5000',
  
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
    GET_ALL_BRANDS: '/api/products/getAllBrands',
    GET_ALL_PRODUCT_TYPES: '/api/products/getAllProductTypes',
    GET_ALL_CATEGORIES: '/api/products/getAllCategories',
    
    // Measurement endpoints
    GET_MEASUREMENTS: '/api/measurements',
    CREATE_MEASUREMENT: '/api/measurements',
    UPDATE_MEASUREMENT: '/api/measurements/:id',
    
    // Order endpoints
    GET_ORDERS: '/api/orders',
    CREATE_ORDER: '/api/orders',
    UPDATE_ORDER: '/api/orders/:id',
    
    // Business / seller profile endpoints
    SAVE_BUSINESS_INFO: '/api/business',
    CREATE_UPDATE_BUSINESS: '/api/business',
    GET_BUSINESS_INFO: '/api/business/user/:userId',
    UPDATE_BUSINESS_INFO: '/api/business/:businessId',
    
    // Tailor items endpoints
    GET_TAILOR_ITEMS: '/api/tailor-items',
    GET_TAILOR_ITEM_PRICES: '/api/tailor-item-prices/business/:businessId',
    SAVE_TAILOR_ITEM_PRICES: '/api/tailor-item-prices',
    SAVE_TAILOR_ITEM_PRICES_BATCH: '/api/tailor-item-prices/batch',
  },
};

export default API_CONFIG;

