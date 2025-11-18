import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../utils/colors';
import StorageService from '../../services/storage.service';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../utils/authApi';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import * as Images from '../../utils/images';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps): React.JSX.Element {
  const { signOut } = useAuth();

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
              const rootNavigator = navigation.getParent()?.getParent()?.getParent();
              if (rootNavigator) {
                rootNavigator.reset({
                  index: 0,
                  routes: [{ name: 'AuthStackNavigation' }],
                });
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={Images.arrow_left} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#654321', '#8B6F47']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Active Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Wishlist</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Addresses</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Orders & Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders & Activity</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <LinearGradient
                  colors={['#654321', '#8B6F47']}
                  style={styles.iconContainer}
                >
                  <Image source={Images.shopping_cart_icon} style={styles.settingIcon} />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>My Orders</Text>
                  <Text style={styles.settingItemSubtext}>Track and manage orders</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>12</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <LinearGradient
                  colors={['#4A3319', '#654321']}
                  style={styles.iconContainer}
                >
                  <Image source={Images.shopping_bag} style={styles.settingIcon} />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Wishlist</Text>
                  <Text style={styles.settingItemSubtext}>Saved items and favorites</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <LinearGradient
                  colors={['#8B6F47', '#A68966']}
                  style={styles.iconContainer}
                >
                  <Image source={Images.home_icon} style={styles.settingIcon} />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Delivery Addresses</Text>
                  <Text style={styles.settingItemSubtext}>Manage shipping addresses</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <LinearGradient
                  colors={['#654321', '#8B6F47']}
                  style={styles.iconContainer}
                >
                  <Image source={Images.revenue_icon} style={styles.settingIcon} />
                </LinearGradient>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Payment Methods</Text>
                  <Text style={styles.settingItemSubtext}>Cards and payment options</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.person_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Edit Profile</Text>
                  <Text style={styles.settingItemSubtext}>Update personal information</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.gear_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Change Password</Text>
                  <Text style={styles.settingItemSubtext}>Update your security</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.gear_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Privacy Settings</Text>
                  <Text style={styles.settingItemSubtext}>Control your privacy</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.gear_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Notifications</Text>
                  <Text style={styles.settingItemSubtext}>Push and email alerts</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.home_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Language & Region</Text>
                  <Text style={styles.settingItemSubtext}>English (United States)</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.search_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Help Center</Text>
                  <Text style={styles.settingItemSubtext}>FAQs and support</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.home_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>Terms & Policies</Text>
                  <Text style={styles.settingItemSubtext}>Legal information</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainerPlain}>
                  <Image source={Images.home_icon} style={styles.settingIconPlain} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingItemText}>About FitFormal</Text>
                  <Text style={styles.settingItemSubtext}>Version 1.0.0</Text>
                </View>
              </View>
              <Image source={Images.arrow_left} style={styles.arrowIcon} />
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
              <Image source={Images.back_icon} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>FitFormal v1.0.0 • Made with care for formal wear</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  
  // Stats Card
  statsCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: GILROY_MEDIUM,
    textAlign: 'center',
  },
  
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    fontFamily: GILROY_BOLD,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.whiteColor,
  },
  iconContainerPlain: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingIconPlain: {
    width: 24,
    height: 24,
    tintColor: Colors.warmBrownColor,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 3,
  },
  settingItemSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  badge: {
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textSecondary,
    transform: [{ rotate: '180deg' }],
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutIcon: {
    width: 22,
    height: 22,
    tintColor: '#DC2626',
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: GILROY_BOLD,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 20,
    fontFamily: GILROY_REGULAR,
  },
});

