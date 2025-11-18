import AxiosConfig from "./api";
import API_CONFIG from "./config";

/**
 * Create a new product
 * @param {Object} productData - Product payload (matches PRODUCT_FIELDS_REFERENCE)
 * @returns {Promise} Axios response
 */
export const createProduct = async (productData) => {
  const endpoint = API_CONFIG.ENDPOINTS.CREATE_PRODUCT || "/api/products";
  return AxiosConfig.post(endpoint, productData);
};

/**
 * Update an existing product
 * @param {string|number} productId - ID of the product to update
 * @param {Object} productData - Product payload
 * @returns {Promise} Axios response
 */
export const updateProduct = async (productId, productData) => {
  const baseEndpoint = API_CONFIG.ENDPOINTS.UPDATE_PRODUCT || "/api/products/:id";
  const endpoint = baseEndpoint.replace(":id", String(productId));
  return AxiosConfig.put(endpoint, productData);
};


