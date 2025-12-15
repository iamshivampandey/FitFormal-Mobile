import AxiosConfig from "./api";
import API_CONFIG from "./config";
import StorageService from "../../services/storage.service";

/**
 * Create or update business info for seller/tailor users
 * 
 * Required fields: userId, businessName, businessEmail, businessPhone
 * Optional fields: gstNumber, panNumber, address, city, state, country, zipCode, businessType
 * 
 * @param {Object} payload - Business information payload
 * @param {number} payload.userId - User ID (required)
 * @param {string} payload.businessName - Business name (required)
 * @param {string} payload.businessEmail - Business email (required)
 * @param {string} payload.businessPhone - Business phone (required)
 * @param {string} [payload.gstNumber] - GST number (optional)
 * @param {string} [payload.panNumber] - PAN number (optional)
 * @param {string} [payload.address] - Business address (optional)
 * @param {string} [payload.city] - City (optional)
 * @param {string} [payload.state] - State (optional)
 * @param {string} [payload.country] - Country (optional)
 * @param {string} [payload.zipCode] - ZIP code (optional)
 * @param {string} [payload.businessType] - Business type (optional)
 * @returns {Promise} Axios response
 */
export const saveBusinessInfo = async (payload) => {
  try {
    // Get userId from stored user data if not provided
    let userId = payload.userId;
    if (!userId) {
      const userData = await StorageService.getUser();
      if (userData) {
        const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
        userId = parsedUser?.user?.id || parsedUser?.id;
      }
    }

    if (!userId) {
      throw new Error('User ID is required. Please ensure you are logged in.');
    }

    // Map the payload to match API requirements
    const apiPayload = {
      userId: userId,
      businessName: payload.businessName || '',
      businessEmail: payload.businessEmail || payload.email || '',
      businessPhone: payload.businessPhone || payload.mobileNumber || '',
      // Optional fields - use empty string if not provided
      gstNumber: payload.gstNumber || '',
      panNumber: payload.panNumber || '',
      address: payload.address || payload.shopAddress || '',
      city: payload.city || payload.workingCity || '',
      state: payload.state || '',
      country: payload.country || '',
      zipCode: payload.zipCode || '',
      businessType: payload.businessType || payload.role || '',
    };

    console.log('Business API Payload:', apiPayload);
    
    const endpoint = API_CONFIG.ENDPOINTS.CREATE_UPDATE_BUSINESS || API_CONFIG.ENDPOINTS.SAVE_BUSINESS_INFO || "/api/business";
    const response = await AxiosConfig.post(endpoint, apiPayload);
    
    console.log('Business API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Business API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get business info for the current user
 * @param {number} [userId] - Optional user ID, will be fetched from storage if not provided
 * @returns {Promise} Axios response with business information
 */
export const getBusinessInfo = async (userId = null) => {
  try {
    let uid = userId;
    
    if (!uid) {
      const userData = await StorageService.getUser();
      if (!userData) {
        throw new Error('User not found. Please login again.');
      }

      const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
      uid = parsedUser?.user?.id || parsedUser?.id;
    }

    if (!uid) {
      throw new Error('User ID not found. Please login again.');
    }

    // Endpoint: GET /api/business/:userId
    const endpoint = `/api/business/${uid}`;
    const response = await AxiosConfig.get(endpoint);
    
    console.log('Business Info API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Business Info API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update business info
 * @param {Object} payload - Business information payload
 * @param {number} businessId - Business ID (required)
 * @returns {Promise} Axios response
 */
export const updateBusinessInfo = async (payload, businessId = null) => {
  try {
    let bid = businessId;
    
    if (!bid) {
      // Try to get businessId from user's business info
      const businessInfo = await getBusinessInfo();
      bid = businessInfo?.data?.data?.id || businessInfo?.data?.id || businessInfo?.data?.businessId;
    }

    if (!bid) {
      throw new Error('Business ID not found. Cannot update business info.');
    }

    const userData = await StorageService.getUser();
    const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
    const userId = parsedUser?.user?.id || parsedUser?.id;

    // Include all fields from payload, not just basic ones
    const apiPayload = {
      userId: userId,
      businessName: payload.businessName || '',
      businessEmail: payload.businessEmail || payload.email || '',
      businessPhone: payload.businessPhone || payload.mobileNumber || '',
      gstNumber: payload.gstNumber || '',
      panNumber: payload.panNumber || '',
      address: payload.address || payload.shopAddress || '',
      city: payload.city || payload.workingCity || '',
      state: payload.state || '',
      country: payload.country || '',
      zipCode: payload.zipCode || '',
      businessType: payload.businessType || payload.role || '',
      // Include additional fields
      ownerName: payload.ownerName || '',
      businessDescription: payload.businessDescription || '',
      alternateNumber: payload.alternateNumber || '',
      googleMapLink: payload.googleMapLink || '',
      gpsLatitude: payload.gpsLatitude || '',
      gpsLongitude: payload.gpsLongitude || '',
      openingTime: payload.openingTime || '',
      closingTime: payload.closingTime || '',
      weeklyOff: payload.weeklyOff || payload.weeklyoff || '',
      businessLogo: payload.businessLogo || '',
      specialization: payload.specialization || '',
      yearsOfExperience: payload.yearsOfExperience || '',
      portfolioPhotos: payload.portfolioPhotos || '',
      certifications: payload.certifications || '',
      serviceTypes: payload.serviceTypes || '',
      tailoringCategories: payload.tailoringCategories || '',
    };

    // Use PUT /business/:businessId endpoint
    // Note: The endpoint should be /business/:businessId (not /api/business/:businessId)
    // If your baseURL doesn't include /api, use /api/business/:businessId instead
    const endpoint = `api/business/${bid}`;
    console.log('Updating business with endpoint:', endpoint, 'and payload:', apiPayload);
    const response = await AxiosConfig.put(endpoint, apiPayload);
    
    console.log('Update Business API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Update Business API Error:', error.response?.data || error.message);
    throw error;
  }
};


