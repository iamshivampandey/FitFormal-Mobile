/**
 * Role Constants
 * Maps frontend role names to backend role IDs
 */

export const ROLE_IDS = {
  ADMIN: 1,
  CUSTOMER: 2,
  SELLER: 3,        // Shop/Seller
  TAILOR: 4,
  TAYLORSELLER: 5,  // Tailor + Shop
};

export const ROLE_NAMES = {
  1: 'admin',
  2: 'customer',
  3: 'shop',          // Maps to 'shop' in frontend
  4: 'tailor',
  5: 'tailor_shop',   // Maps to 'tailor_shop' in frontend
};

// Frontend to Backend role mapping
export const getFrontendRoleId = (frontendRole) => {
  const roleMap = {
    'customer': ROLE_IDS.CUSTOMER,
    'shop': ROLE_IDS.SELLER,
    'tailor': ROLE_IDS.TAILOR,
    'tailor_shop': ROLE_IDS.TAYLORSELLER,
    'admin': ROLE_IDS.ADMIN,
  };
  return roleMap[frontendRole] || ROLE_IDS.CUSTOMER;
};

// Backend to Frontend role mapping
export const getBackendRoleName = (roleId) => {
  return ROLE_NAMES[roleId] || 'customer';
};

export default {
  ROLE_IDS,
  ROLE_NAMES,
  getFrontendRoleId,
  getBackendRoleName,
};

