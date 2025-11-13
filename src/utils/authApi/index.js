import AxiosConfig from "../api";
import StorageService from "../../services/storage.service";
import { getFrontendRoleId, getBackendRoleName } from "../constants/roles";

/**
 * Sign up a new user with email and password
 * @param {Object} params - Signup parameters
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @param {string} params.firstName - User first name
 * @param {string} params.lastName - User last name
 * @param {string} params.phoneNumber - User phone number
 * @param {string} params.age - User age (optional)
 * @param {string} params.roleName - User role frontend name (e.g., 'customer', 'shop', 'tailor', 'tailor_shop')
 * @returns {Promise} Response from the server
 */
export const signUpWithEmailAndPassword = async (params) => {
  try {
    // Convert frontend role name to backend role ID
    const roleId = getFrontendRoleId(params.roleName || 'customer');
    
    const payload = {
      email: params.email,
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
      phoneNumber: params.phoneNumber,
      roleName: roleId, // Send role ID instead of string
    };

    console.log("Signup payload:", payload);
    console.log("Role mapping:", params.roleName, "->", roleId);
    
    const response = await AxiosConfig.post("/api/auth/signup", payload);

    // Store user data if signup is successful
    if (response.data && response.data.token) {
      await StorageService.saveToken(response.data.token);
      
      // Add age to user data before storing (backend might not store it)
      const userDataWithAge = {
        ...response.data,
        user: {
          ...response.data.user,
          age: params.age || '',
        }
      };
      
      await StorageService.saveUser(userDataWithAge);
      // Store the frontend role name
      await StorageService.saveRole(params.roleName || 'customer');
    }
    
    return response;
  } catch (error) {
    console.log("signUp error", JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

/**
 * Sign in an existing user with email and password
 * @param {Object} params - Login parameters
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @returns {Promise} Response from the server
 */
export const signInWithEmailAndPassword = async (params) => {
  try {
    const payload = {
      email: params.email,
      password: params.password,
    };

    console.log("Login payload:", payload);

    const response = await AxiosConfig.post("/api/auth/login", payload);
    
    console.log("Login response received:", {
      hasData: !!response.data,
      hasToken: !!response.data?.token,
      hasUser: !!response.data?.user,
      responseKeys: response.data ? Object.keys(response.data) : []
    });

    // Store user data if login is successful
    if (response.data && response.data.token) {
      console.log("✓ Token found, saving to storage...");
      await StorageService.saveToken(response.data.token);
      console.log("✓ Token saved successfully");
      
      await StorageService.saveUser(response.data);
      console.log("✓ User data saved successfully");
      
      // Save role if available in response (convert role ID to frontend role name)
      if (response.data.user && response.data.user.roleName) {
        const roleId = response.data.user.roleName;
        // Convert backend role ID to frontend role name
        const frontendRoleName = getBackendRoleName(roleId);
        console.log("✓ Role mapping from backend:", roleId, "->", frontendRoleName);
        await StorageService.saveRole(frontendRoleName);
        console.log("✓ Role saved successfully:", frontendRoleName);
      } else {
        console.warn("⚠️ No role found in response, using default 'customer'");
        await StorageService.saveRole('customer');
      }
      
      // Verify storage
      const savedToken = await StorageService.getToken();
      const savedRole = await StorageService.getRole();
      console.log("✓ Verification - Token saved:", !!savedToken);
      console.log("✓ Verification - Role saved:", savedRole);
    } else {
      console.error("✗ No token in response! Response structure:", response.data);
    }
    
    return response;
  } catch (error) {
    console.log("signIn error", JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

/**
 * Logout user and clear storage
 * @returns {Promise<boolean>}
 */
export const logoutUser = async () => {
  try {
    await StorageService.clearStorage();
    return true;
  } catch (error) {
    console.log("logout error", error);
    return false;
  }
};

/**
 * Verify OTP for user verification
 * @param {Object} params - OTP verification parameters
 * @param {string} params.email - User email
 * @param {string} params.otp - OTP code
 * @returns {Promise} Response from the server
 */
export const verifyOTP = async (params) => {
  try {
    const payload = {
      email: params.email,
      otp: params.otp,
    };

    console.log("OTP verification payload:", payload);

    const response = await AxiosConfig.post("/api/auth/verify-otp", payload);
    
    return response;
  } catch (error) {
    console.log("OTP verification error", JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};

/**
 * Resend OTP for user verification
 * @param {Object} params - Resend OTP parameters
 * @param {string} params.email - User email
 * @returns {Promise} Response from the server
 */
export const resendOTP = async (params) => {
  try {
    const payload = {
      email: params.email,
    };

    console.log("Resend OTP payload:", payload);

    const response = await AxiosConfig.post("/api/auth/resend-otp", payload);
    
    return response;
  } catch (error) {
    console.log("Resend OTP error", JSON.stringify(error.response?.data || error.message));
    throw error;
  }
};
