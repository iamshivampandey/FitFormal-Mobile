import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@user',
  TOKEN: '@token',
  ROLE: '@role',
};

class StorageService {
  // Save user data
  async saveUser(userData) {
    try {
      // userData should already be a string (JSON stringified)
      const dataToSave = typeof userData === 'string' ? userData : JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, dataToSave);
      console.log('[Storage] ✓ User data saved successfully');
      return true;
    } catch (error) {
      console.error('[Storage] ✗ Error saving user data:', error);
      return false;
    }
  }

  // Get user data
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      console.log('[Storage] Retrieved user data:', userData ? 'Data found' : 'No data');
      return userData;
    } catch (error) {
      console.error('[Storage] ✗ Error getting user data:', error);
      return null;
    }
  }

  // Save token
  async saveToken(token) {
    try {
      console.log('[Storage] Saving token...', token ? `(${token.substring(0, 20)}...)` : 'null');
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      console.log('[Storage] ✓ Token saved successfully');
      return true;
    } catch (error) {
      console.error('[Storage] ✗ Error saving token:', error);
      return false;
    }
  }

  // Get token
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('[Storage] Retrieved token:', token ? `(${token.substring(0, 20)}...)` : 'null');
      return token;
    } catch (error) {
      console.error('[Storage] ✗ Error getting token:', error);
      return null;
    }
  }

  // Save user role
  async saveRole(role) {
    try {
      console.log('[Storage] Saving role:', role);
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, role);
      console.log('[Storage] ✓ Role saved successfully');
      return true;
    } catch (error) {
      console.error('[Storage] ✗ Error saving role:', error);
      return false;
    }
  }

  // Get user role
  async getRole() {
    try {
      const role = await AsyncStorage.getItem(STORAGE_KEYS.ROLE);
      console.log('[Storage] Retrieved role:', role);
      return role;
    } catch (error) {
      console.error('[Storage] ✗ Error getting role:', error);
      return null;
    }
  }

  // Clear all storage
  async clearStorage() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.ROLE,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }
}

export default new StorageService();

