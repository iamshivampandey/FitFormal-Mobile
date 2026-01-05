import AxiosConfig from "./api";
import StorageService from "../../services/storage.service";

/**
 * Get tailor availability for booking (customer view)
 * @param {number} businessId - Tailor's business ID
 * @returns {Promise} Axios response with availability data
 */
export const getTailorAvailability = async (businessId) => {
  try {
    if (!businessId) {
      throw new Error('Business ID is required');
    }

    const endpoint = `/api/tailor-date-availability/${businessId}`;
    const response = await AxiosConfig.get(endpoint);
    
    console.log('Tailor Availability API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Get Tailor Availability API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get order availability for a business
 * @param {number} [businessId] - Optional business ID, will be fetched from storage if not provided
 * @returns {Promise} Axios response with availability data
 */
export const getOrderAvailability = async (businessId = null) => {
  try {
    let bid = businessId;
    
    if (!bid) {
      // Get business info to extract businessId
      const userData = await StorageService.getUser();
      if (!userData) {
        throw new Error('User not found. Please login again.');
      }

      const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const userId = parsedUser?.user?.id || parsedUser?.id;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      // Try to get businessId from business info
      try {
        const { getBusinessInfo } = await import('./businessApi');
        const businessInfo = await getBusinessInfo(userId);
        bid = businessInfo?.data?.data?.id || businessInfo?.data?.id || businessInfo?.data?.businessId;
      } catch (error) {
        console.warn('Could not fetch business info:', error);
      }
    }

    if (!bid) {
      // Return empty availability if business doesn't exist yet
      return { data: { data: [] } };
    }

    // Use the web API endpoint: /api/tailor-date-availability/${businessId}
    const endpoint = `/api/tailor-date-availability/${bid}`;
    const response = await AxiosConfig.get(endpoint);
    
    console.log('Order Availability API Response:', response?.data);
    
    // Normalize the response data to match our interface
    // Web API returns: { data: [{ Date: "2025-12-17", IsClosed: true/false }] }
    // We need: [{ date: "2025-12-17", isAvailable: true/false }]
    if (response?.data?.data && Array.isArray(response.data.data)) {
      const normalizedData = response.data.data.map(item => {
        const dateValue = item.Date || item.date;
        const normalizedDate = dateValue ? new Date(dateValue).toISOString().split('T')[0] : null;
        const isClosed = item.IsClosed !== undefined ? item.IsClosed : item.isClosed;
        
        // Convert isClosed to isAvailable (isClosed=true means isAvailable=false)
        return {
          date: normalizedDate,
          isAvailable: !isClosed, // Invert: isClosed=false means isAvailable=true
          isClosed: isClosed,
        };
      });
      
      return {
        ...response,
        data: {
          ...response.data,
          data: normalizedData,
        },
      };
    }
    
    return response;
  } catch (error) {
    // If endpoint doesn't exist yet, return empty array
    if (error.response?.status === 404) {
      console.log('Order availability endpoint not found, returning empty data');
      return { data: { data: [] } };
    }
    console.error('Order Availability API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update order availability for a business
 * @param {Object} payload - Availability data
 * @param {Array} payload.availability - Array of availability objects with date and isAvailable
 * @param {number} [businessId] - Optional business ID
 * @returns {Promise} Axios response
 */
export const updateOrderAvailability = async (payload, businessId = null) => {
  try {
    let bid = businessId;
    
    if (!bid) {
      const userData = await StorageService.getUser();
      if (!userData) {
        throw new Error('User not found. Please login again.');
      }

      const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const userId = parsedUser?.user?.id || parsedUser?.id;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      // Try to get businessId from business info
      try {
        const { getBusinessInfo } = await import('./businessApi');
        const businessInfo = await getBusinessInfo(userId);
        bid = businessInfo?.data?.data?.id || businessInfo?.data?.id || businessInfo?.data?.businessId;
      } catch (error) {
        console.warn('Could not fetch business info:', error);
      }
    }

    if (!bid) {
      throw new Error('Business ID not found. Cannot update order availability.');
    }

    // Note: This function is used for batch updates, but web API uses POST for single updates
    // Keeping this for backward compatibility, but updateSingleDayAvailability uses the correct endpoint
    const endpoint = `/api/order-availability/business/${bid}`;
    const response = await AxiosConfig.put(endpoint, payload);
    
    console.log('Update Order Availability API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Update Order Availability API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Batch update order availability
 * @param {Array} availabilityArray - Array of { date, isAvailable } objects
 * @param {number} [businessId] - Optional business ID
 * @returns {Promise} Axios response
 */
export const batchUpdateOrderAvailability = async (availabilityArray, businessId = null) => {
  try {
    const payload = {
      availability: availabilityArray,
    };
    return await updateOrderAvailability(payload, businessId);
  } catch (error) {
    console.error('Batch Update Order Availability Error:', error);
    throw error;
  }
};

/**
 * Update single day availability
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {boolean} isAvailable - Availability status (true = accepting orders, false = not accepting)
 * @param {number} [businessId] - Optional business ID
 * @returns {Promise} Axios response
 */
export const updateSingleDayAvailability = async (date, isAvailable, businessId = null) => {
  try {
    let bid = businessId;
    
    if (!bid) {
      const userData = await StorageService.getUser();
      if (!userData) {
        throw new Error('User not found. Please login again.');
      }

      const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const userId = parsedUser?.user?.id || parsedUser?.id;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      // Try to get businessId from business info
      try {
        const { getBusinessInfo } = await import('./businessApi');
        const businessInfo = await getBusinessInfo(userId);
        bid = businessInfo?.data?.data?.id || businessInfo?.data?.id || businessInfo?.data?.businessId;
      } catch (error) {
        console.warn('Could not fetch business info:', error);
      }
    }

    if (!bid) {
      throw new Error('Business ID not found. Cannot update order availability.');
    }

    // Convert isAvailable to isClosed (isAvailable=false means isClosed=true)
    // Web API expects: { businessId: number, date: string, isClosed: boolean }
    const isClosed = !isAvailable; // Invert: if not available, then closed
    
    const requestBody = {
      businessId: Number(bid), // Ensure it's a number
      date: date,
      isClosed: isClosed, // true when toggle is OFF, false when toggle is ON
    };

    console.log('API Request:', {
      url: '/api/tailor-date-availability',
      method: 'POST',
      body: requestBody,
    });

    // Use the web API endpoint: POST /api/tailor-date-availability
    const endpoint = `/api/tailor-date-availability`;
    const response = await AxiosConfig.post(endpoint, requestBody);
    
    console.log('Update Single Day Availability API Response:', response?.data);
    return response;
  } catch (error) {
    console.error('Update Single Day Availability Error:', error.response?.data || error.message);
    throw error;
  }
};

