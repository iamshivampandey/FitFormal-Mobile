import AxiosConfig from './api';
import API_CONFIG from './config';

/**
 * Create order (Tailoring flow)
 * Endpoint: /api/createOrder (from user's web backend)
 */
export const createOrder = async (payload) => {
  try {
    // Prefer full URL if set, otherwise use the endpoint path
    const urlToUse = API_CONFIG.CREATE_ORDER_FULL_URL || 
                     API_CONFIG.ENDPOINTS.CREATE_ORDER_TAILOR || 
                     '/api/createOrder';
    
    console.log('Create order endpoint:', urlToUse);
    console.log('Create order payload:', JSON.stringify(payload, null, 2));
    
    const response = await AxiosConfig.post(urlToUse, payload);
    console.log('Create order response:', response?.data);
    return response;
  } catch (error) {
    console.error('Create Order API Error:', error.response?.data || error.message);
    throw error;
  }
};

