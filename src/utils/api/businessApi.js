import AxiosConfig from "./api";
import API_CONFIG from "./config";

/**
 * Save or update business info for seller/tailor users
 * @param {Object} payload - Business information payload
 * @returns {Promise} Axios response
 */
export const saveBusinessInfo = async (payload) => {
  const endpoint = API_CONFIG.ENDPOINTS.SAVE_BUSINESS_INFO || "/api/business/saveBusinessInfo";
  return AxiosConfig.post(endpoint, payload);
};


