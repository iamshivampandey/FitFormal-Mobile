import AxiosConfig from './api';
import API_CONFIG from './config';

/**
 * Get customer's saved delivery addresses
 * @returns {Promise} Axios response with addresses array
 */
export const getMyDeliveryAddresses = async () => {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.GET_MY_DELIVERY_ADDRESSES || '/api/my-delivery-addresses';
    const response = await AxiosConfig.get(endpoint);
    console.log('Get My Delivery Addresses API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Get My Delivery Addresses API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save a new delivery address
 * @param {number|string} userId - The user ID
 * @param {Object} addressData - The address data to save
 * @returns {Promise} Axios response with saved address
 */
export const saveDeliveryAddress = async (userId, addressData) => {
  try {
    const baseEndpoint = API_CONFIG.ENDPOINTS.SAVE_DELIVERY_ADDRESS || '/api/delivery-addresses/user';
    const endpoint = `${baseEndpoint}/${userId}`;
    console.log('Save Delivery Address API Request:', endpoint, addressData);
    const response = await AxiosConfig.post(endpoint, addressData);
    console.log('Save Delivery Address API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Save Delivery Address API Error:', error.response?.data || error.message);
    throw error;
  }
};

