import AxiosConfig from "./api";
import API_CONFIG from "./config";

/**
 * Get all tailor items/categories
 * @returns {Promise} Axios response with tailor items array
 */
export const getTailorItems = async () => {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.GET_TAILOR_ITEMS || "/api/tailor-items";
    const response = await AxiosConfig.get(endpoint);
    return response;
  } catch (error) {
    console.error('Tailor Items API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get tailor item prices for a business
 * @param {number} businessId - Business ID
 * @returns {Promise} Axios response with item prices array
 */
export const getTailorItemPrices = async (businessId) => {
  try {
    const endpoint = (API_CONFIG.ENDPOINTS.GET_TAILOR_ITEM_PRICES || "/api/tailor-item-prices/business/:businessId")
      .replace(':businessId', businessId);
    const response = await AxiosConfig.get(endpoint);
    return response;
  } catch (error) {
    console.error('Tailor Item Prices API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save tailor item prices (batch)
 * @param {Object} payload - Payload with businessId and itemPrices array
 * @returns {Promise} Axios response
 */
export const saveTailorItemPricesBatch = async (payload) => {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SAVE_TAILOR_ITEM_PRICES_BATCH || "/api/tailor-item-prices/batch";
    const response = await AxiosConfig.post(endpoint, payload);
    return response;
  } catch (error) {
    console.error('Save Tailor Item Prices Batch API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save a single tailor item price
 * @param {Object} payload - Item price payload
 * @returns {Promise} Axios response
 */
export const saveTailorItemPrice = async (payload) => {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SAVE_TAILOR_ITEM_PRICES || "/api/tailor-item-prices";
    const response = await AxiosConfig.post(endpoint, payload);
    return response;
  } catch (error) {
    console.error('Save Tailor Item Price API Error:', error.response?.data || error.message);
    throw error;
  }
};

