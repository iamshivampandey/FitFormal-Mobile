import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../utils/colors';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import StorageService from '../../services/storage.service';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../utils/authApi';
import { getBackendRoleName } from '../../utils/constants/roles';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import * as Images from '../../utils/images';

const { width } = Dimensions.get('window');

interface UserData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleName?: number | string;
}

export default function Profile({ navigation }: any): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { signOut, userRole } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User data states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  
  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [ageError, setAgeError] = useState('');
  
  // Calculate tab bar height
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await StorageService.getUser();
      const userRole = await StorageService.getRole();
      
      if (userData) {
        const data = JSON.parse(userData);
        console.log('📦 Loaded user data from storage:', JSON.stringify(data));
        
        // Extract user info from API response structure
        // Response: { user: {...}, roles: [...], token: "..." }
        const user = data.user || data; // Support both new and old formats
        
        // Check if user object exists and has required fields
        if (!user || typeof user !== 'object') {
          console.error('❌ Invalid user data structure:', user);
          Alert.alert('Error', 'Invalid user data. Please login again.');
          setLoading(false);
          return;
        }
        
        setEmail(user.email || '');
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setPhoneNumber(user.phoneNumber || '');
        
        // Set role display name
        if (userRole) {
          // Use role from storage (already mapped to frontend role)
          setRole(getRoleDisplayName(userRole));
          console.log('✓ Role from storage:', userRole);
        } else if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
          // Get from roles array in new API format
          const primaryRole = data.roles[0];
          const roleName = primaryRole.name; // "Seller", "Customer", etc.
          
          // Map to frontend role
          let mappedRole = roleName.toLowerCase();
          if (roleName === 'Seller') {
            mappedRole = 'shop';
          }
          
          setRole(getRoleDisplayName(mappedRole));
          console.log('✓ Role from API response:', roleName, '→', mappedRole);
        } else if (user.roleName) {
          // Fallback to old format
          const roleName = typeof user.roleName === 'number' 
            ? getBackendRoleName(user.roleName)
            : user.roleName;
          setRole(getRoleDisplayName(roleName));
          console.log('✓ Role from user.roleName:', roleName);
        }
        
        console.log('✅ Profile loaded:', {
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A',
          email: user.email || 'N/A',
          phone: user.phoneNumber || 'N/A',
          role: role || 'N/A'
        });
      } else {
        console.warn('⚠️ No user data found in storage');
        Alert.alert('No Data', 'Please login again to load your profile.');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'customer': '👤 Customer',
      'shop': '🏪 Shop Owner',
      'tailor': '✂️ Tailor',
      'tailor_shop': '🏪✂️ Tailor + Shop',
      'admin': '⚙️ Administrator',
      'seller': '🏪 Seller', // Map API "Seller" as well
    };
    return roleMap[role.toLowerCase()] || role;
  };

  const validateInputs = (): boolean => {
    let valid = true;

    if (firstName.trim() === '') {
      setFirstNameError('First name is required');
      valid = false;
    } else {
      setFirstNameError('');
    }

    if (lastName.trim() === '') {
      setLastNameError('Last name is required');
      valid = false;
    } else {
      setLastNameError('');
    }

    if (phoneNumber.trim() === '') {
      setPhoneError('Phone number is required');
      valid = false;
    } else if (phoneNumber.length < 10) {
      setPhoneError('Invalid phone number');
      valid = false;
    } else {
      setPhoneError('');
    }


    return valid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setSaving(true);

    try {
      // Get current user data
      const currentUserData = await StorageService.getUser();
      const currentUser = currentUserData ? JSON.parse(currentUserData) : {};

      // Update user data
      const updatedUserData = {
        ...currentUser,
        user: {
          ...currentUser.user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
        },
      };

      // Save to storage
      await StorageService.saveUser(updatedUserData);

      // TODO: Send to backend API
      // const response = await updateUserProfile(updatedUserData);

      setSaving(false);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      setSaving(false);
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadUserData(); // Reload original data
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              await StorageService.clearStorage();
              signOut();
              
              // Navigate to root navigator and reset to AuthStackNavigation
              const rootNavigator = navigation.getParent()?.getParent();
              if (rootNavigator) {
                rootNavigator.reset({
                  index: 0,
                  routes: [{ name: 'AuthStackNavigation' }],
                });
              } else {
                // Fallback: navigate without reset
                navigation.navigate('AuthStackNavigation' as never);
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.warmBrownColor} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#8B6F47', '#654321', '#4A3319']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              {/* Avatar with Shadow */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarShadow}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F5F5F5']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                </View>
                {/* Edit Avatar Badge */}
                <TouchableOpacity style={styles.editAvatarBadge}>
                  <Image source={Images.edit_icon} style={styles.editAvatarIcon} />
                </TouchableOpacity>
              </View>
              
              {/* User Info */}
              <Text style={styles.userName}>{firstName} {lastName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.userRole}>{role}</Text>
              </View>
              {!!email && <Text style={styles.userEmail}>{email}</Text>}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.statCardGradient}
              >
                <Image source={Images.shopping_cart_icon} style={styles.statIconImage} />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.statCardGradient}
              >
                <Image source={Images.shopping_bag} style={styles.statIconImage} />
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.statCardGradient}
              >
                <Image source={Images.revenue_icon} style={styles.statIconImage} />
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Profile Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIconCircle}>
                  <Image source={Images.person_icon} style={styles.cardIconImage} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Personal Information</Text>
                  <Text style={styles.cardSubtitle}>Update your basic details</Text>
                </View>
              </View>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  <Image source={Images.edit_icon} style={styles.editAvatarIcon} />
                  </TouchableOpacity>
              )}
            </View>

            <View style={styles.formContainer}>
              <CustomInput
                placeholder="First Name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstNameError('');
                  setFirstName(text);
                }}
                error={firstNameError}
                editable={isEditing}
              />

              <CustomInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={(text) => {
                  setLastNameError('');
                  setLastName(text);
                }}
                error={lastNameError}
                editable={isEditing}
              />        
              
              <CustomInput
                placeholder="Email"
                value={email}
                editable={false}
                keyboardType="email-address"
              />

              <CustomInput
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneError('');
                  setPhoneNumber(text);
                }}
                error={phoneError}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            {/* Action Buttons */}
            {isEditing && (
              <View style={styles.actionButtons}>
                <CustomButton
                  title="Save Changes"
                  onPress={handleSave}
                  loading={saving}
                  style={styles.saveButton}
                />
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Business Information - only for non-customer roles */}
          {userRole !== 'customer' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <View style={styles.cardIconCircle}>
                    <Image source={Images.shopping_bag} style={styles.cardIconImage} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Business Information</Text>
                    <Text style={styles.cardSubtitle}>
                      Key details for your shop or tailoring business
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.businessRow}>
                <Text style={styles.businessLabel}>Business Role</Text>
                <Text style={styles.businessValue}>
                  {role || getRoleDisplayName(userRole)}
                </Text>
              </View>
              <View style={styles.businessRow}>
                <Text style={styles.businessLabel}>Primary Contact</Text>
                <Text style={styles.businessValue}>
                  {firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : 'Not set'}
                </Text>
              </View>
              <View style={styles.businessRow}>
                <Text style={styles.businessLabel}>Business Email</Text>
                <Text style={styles.businessValue}>{email || 'Not set'}</Text>
              </View>
              <View style={styles.businessRow}>
                <Text style={styles.businessLabel}>Contact Number</Text>
                <Text style={styles.businessValue}>{phoneNumber || 'Not set'}</Text>
              </View>
            </View>
          )}

          {/* Account Actions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIconCircle}>
                  <Image source={Images.gear_icon} style={styles.cardIconImage} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Account Settings</Text>
                  <Text style={styles.cardSubtitle}>Manage your account & preferences</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <View style={styles.actionIconContainer}>
                  <Image source={Images.unlock_icon} style={styles.actionIconImage} />
                </View>
                <Text style={styles.actionItemText}>Change Password</Text>
              </View>
              <Text style={styles.actionItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <View style={styles.actionIconContainer}>
                  <Image source={Images.security_icon} style={styles.actionIconImage} />
                </View>
                <Text style={styles.actionItemText}>Privacy Settings</Text>
              </View>
              <Text style={styles.actionItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <View style={styles.actionIconContainer}>
                  <Image source={Images.support_icon} style={styles.actionIconImage} />
                </View>
                <Text style={styles.actionItemText}>Help & Support</Text>
              </View>
              <Text style={styles.actionItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <View style={styles.actionIconContainer}>
                  {/* TODO: Replace with dedicated info_icon when available */}
                  <Image source={Images.about_icon} style={styles.actionIconImage} />
                </View>
                <Text style={styles.actionItemText}>About</Text>
              </View>
              <Text style={styles.actionItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={['#FEE2E2', '#FECACA']}
              style={styles.logoutGradient}
            >
              <Image source={Images.logout_icon} style={styles.logoutIconImage} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* App Version */}
          {/* <Text style={styles.versionText}>FitFormal v1.0.0</Text> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  
  // Header Gradient
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  
  // Avatar
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#654321',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  editAvatarIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.whiteColor,
  },
  
  // User Info
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.whiteColor,
    marginBottom: 8,
    fontFamily: GILROY_BOLD,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  userRole: {
    fontSize: 15,
    color: Colors.whiteColor,
    fontFamily: GILROY_MEDIUM,
  },
  userEmail: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: GILROY_REGULAR,
  },
  
  // Content
  content: {
    padding: 20,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 16,
  },
  statIconImage: {
    width: 22,
    height: 22,
    marginBottom: 6,
    tintColor: Colors.warmBrownColor,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 4,
    fontFamily: GILROY_BOLD,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  
  // Card
  card: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardIconImage: {
    width: 22,
    height: 22,
    tintColor: Colors.warmBrownColor,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.warmBrownColor,
    shadowColor: Colors.warmBrownColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  
  // Form
  formContainer: {
    gap: 16,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.warmBrownColor,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.whiteColor,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  // Business info
  businessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  businessLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  businessValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  
  // Action Items
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconImage: {
    width: 22,
    height: 22,
    tintColor: Colors.warmBrownColor,
  },
  actionItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_MEDIUM,
  },
  actionItemArrow: {
    fontSize: 28,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  
  // Logout Button
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    height: 50,
  },
  logoutGradient: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoutIconImage: {
    width: 20,
    height: 20,
    tintColor: '#DC2626',
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: GILROY_BOLD,
  },
  
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: GILROY_REGULAR,
  },
});
