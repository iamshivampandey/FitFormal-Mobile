import AxiosConfig from "./api";
import API_CONFIG from "./config";

/**
 * Create a new product
 * @param {Object} productData - Product payload (matches PRODUCT_FIELDS_REFERENCE)
 * @returns {Promise} Axios response
 */
export const createProduct = async (productData) => {
  const endpoint = API_CONFIG.ENDPOINTS.CREATE_PRODUCT;
  return AxiosConfig.post(endpoint, productData);
};

/**
 * Update an existing product
 * @param {string|number} productId - ID of the product to update
 * @param {Object} productData - Product payload
 * @returns {Promise} Axios response
 */
export const updateProduct = async (productId, productData) => {
  const baseEndpoint = API_CONFIG.ENDPOINTS.UPDATE_PRODUCT;
  const endpoint = baseEndpoint.replace(":id", String(productId));
  return AxiosConfig.put(endpoint, productData);
};

/**
 * Delete a product by id
 * @param {string|number} productId
 * @returns {Promise} Axios response
 */
export const deleteProduct = async (productId) => {
  const baseEndpoint = API_CONFIG.ENDPOINTS.DELETE_PRODUCT;
  const endpoint = baseEndpoint.replace(":id", String(productId));
  return AxiosConfig.delete(endpoint);
};

/**
 * Fetch products list
 * @param {Object} params - Optional query params (pagination, filters)
 * @returns {Promise} Axios response
 */
export const getProducts = async (params = {}) => {
  const endpoint = API_CONFIG.ENDPOINTS.GET_PRODUCTS;
  return AxiosConfig.get(endpoint, { params });
};

/**
 * Get single product by id
 * @param {string|number} productId
 * @returns {Promise} Axios response
 */
export const getProductById = async (productId) => {
  const baseEndpoint = API_CONFIG.ENDPOINTS.GET_PRODUCT;
  const endpoint = baseEndpoint.replace(":id", String(productId));
  return AxiosConfig.get(endpoint);
};

/**
 * Fetch all brands for dropdowns
 * @returns {Promise} Axios response
 */
export const getAllBrands = async () => {
  const endpoint = API_CONFIG.ENDPOINTS.GET_ALL_BRANDS;
  return AxiosConfig.get(endpoint);
};

/**
 * Fetch all categories for dropdowns
 * @returns {Promise} Axios response
 */
export const getAllCategories = async () => {
  const endpoint = API_CONFIG.ENDPOINTS.GET_ALL_CATEGORIES;
  return AxiosConfig.get(endpoint);
};

/**
 * Fetch all product types for dropdowns
 * @returns {Promise} Axios response
 */
export const getAllProductTypes = async () => {
  const endpoint = API_CONFIG.ENDPOINTS.GET_ALL_PRODUCT_TYPES;
  return AxiosConfig.get(endpoint);
};



