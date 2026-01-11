import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { strings } from '../../utils/string/strings';
import CustomButton from '../../components/CustomButton';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import * as Images from '../../utils/images';

interface UserRole {
  id: string;
  title: string;
  description: string;
  icon: ImageSourcePropType;
  benefits: string[];
  color: string;
}

const RoleSelection: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSellerSubRole, setSelectedSellerSubRole] = useState<string | null>(null);
  const [showSellerSubRoles, setShowSellerSubRoles] = useState(false);
  const insets = useSafeAreaInsets();

  const mainRoles: UserRole[] = [
    {
      id: 'Customer',
      title: 'Customer',
      description: 'Buy formal fabric and get custom clothing',
      icon: Images.person_icon,
      benefits: [
        'Browse and purchase formal fabrics online',
        'Book home measurement service',
        'Choose from tailor + shop packages',
        'Track your orders and deliveries',
        'Get premium formal wear at best prices'
      ],
      color: '#4CAF50'
    },
    {
      id: 'Seller',
      title: 'Seller',
      description: 'Sell products or provide services',
      icon: Images.shopping_bag,
      benefits: [
        'Choose your seller type below',
        'Shop Owner, Tailor, or Tailor + Shop',
        'Manage your business online',
        'Grow your customer base',
        'Track your earnings'
      ],
      color: '#FF9800'
    },
    {
      id: 'MeasurementBoy',
      title: 'Measurement Boy',
      description: 'Provide measurement services for customers',
      icon: Images.person_icon,
      benefits: [
        'Visit customer homes for measurements',
        'Take accurate body measurements',
        'Manage your measurement appointments',
        'Earn from measurement services',
        'Flexible work schedule'
      ],
      color: '#00BCD4'
    }
  ];

  const sellerSubRoles: UserRole[] = [
    {
      id: 'Seller',
      title: 'Shop Owner',
      description: 'Sell formal fabrics and accessories',
      icon: Images.shopping_bag,
      benefits: [
        'List and sell formal fabrics online',
        'Manage your product inventory',
        'Accept and process customer orders',
        'Track sales and revenue',
        'Grow your business reach'
      ],
      color: '#FF9800'
    },
    {
      id: 'Tailor',
      title: 'Tailor',
      description: 'Provide measurement and stitching services',
      icon: Images.scissor_icon,
      benefits: [
        'Visit customer homes for measurements',
        'Stitch custom formal wear',
        'Manage your appointments',
        'Earn from stitching services',
        'Build your customer base'
      ],
      color: '#2196F3'
    },
    {
      id: 'Taylorseller',
      title: 'Tailor + Shop',
      description: 'Complete end-to-end formal wear service',
      icon: Images.shopping_bag,
      benefits: [
        'Bring fabric samples to customers',
        'Take measurements at home',
        'Deliver finished clothing',
        'Offer complete formal wear solutions',
        'Higher earning potential'
      ],
      color: '#9C27B0'
    }
  ];

  const handleRoleSelection = (roleId: string) => {
    console.log('Selected role:', roleId);
    
    if (roleId === 'Seller') {
      // Show seller sub-roles
      setShowSellerSubRoles(true);
      setSelectedRole('Seller');
      setSelectedSellerSubRole(null);
    } else {
      // For Customer or Measurement Boy, proceed normally
      setShowSellerSubRoles(false);
      setSelectedRole(roleId);
      setSelectedSellerSubRole(null);
    }
  };

  const handleSellerSubRoleSelection = (subRoleId: string) => {
    console.log('Selected seller sub-role:', subRoleId);
    setSelectedSellerSubRole(subRoleId);
  };

  const handleBackToMainRoles = () => {
    setShowSellerSubRoles(false);
    setSelectedRole(null);
    setSelectedSellerSubRole(null);
  };

  const handleContinue = () => {
    // Determine which role to use
    let finalRole = selectedRole;
    let finalRoleData = mainRoles.find(role => role.id === selectedRole);
    
    if (selectedRole === 'Seller' && selectedSellerSubRole) {
      finalRole = selectedSellerSubRole;
      finalRoleData = sellerSubRoles.find(role => role.id === selectedSellerSubRole);
    }
    
    if (finalRole) {
      navigation.navigate('SignUp', { 
        userRole: finalRole,
        roleData: finalRoleData
      });
    }
  };

  const renderRoleCard = (role: UserRole) => {
    const isSelected = selectedRole === role.id;
    
    return (
      <TouchableOpacity
        key={role.id}
        style={[
          styles.roleCard,
          isSelected && styles.selectedRoleCard,
          { borderColor: isSelected ? Colors.warmBrownColor : Colors.inputBorderColor }
        ]}
        onPress={() => handleRoleSelection(role.id)}
        activeOpacity={0.8}
      >
        <View style={styles.roleHeader}>
          <View style={[styles.iconContainer, { backgroundColor:  Colors.warmBrownColor }]}>
            <Image source={role.icon} style={styles.roleIcon} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, isSelected && { color:  Colors.warmBrownColor }]}>
              {role.title}
            </Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
          </View>
        </View>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>What you get:</Text>
          {role.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.checkIconContainer}>
                <Text style={styles.benefitBullet}>✓</Text>
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor:  Colors.warmBrownColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>
              Select how you'd like to use Fit Formal's formal wear ecosystem
            </Text>
          </View>

          {/* Role Cards */}
          {!showSellerSubRoles ? (
            <View style={styles.rolesContainer}>
              {mainRoles.map(renderRoleCard)}
            </View>
          ) : (
            <View style={styles.rolesContainer}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backToMainButton}
                onPress={handleBackToMainRoles}
              >
                <Image source={Images.arrow_left} style={styles.backArrowIcon} />
                <Text style={styles.backToMainText}>Back to Roles</Text>
              </TouchableOpacity>
              
              {/* Seller Sub-Roles */}
              <Text style={styles.subRolesTitle}>Choose Your Seller Type</Text>
              {sellerSubRoles.map((subRole) => {
                const isSelected = selectedSellerSubRole === subRole.id;
                return (
                  <TouchableOpacity
                    key={subRole.id}
                    style={[
                      styles.roleCard,
                      isSelected && styles.selectedRoleCard,
                      { borderColor: isSelected ? Colors.warmBrownColor : Colors.inputBorderColor }
                    ]}
                    onPress={() => handleSellerSubRoleSelection(subRole.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.roleHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: Colors.warmBrownColor }]}>
                        <Image source={subRole.icon} style={styles.roleIcon} />
                      </View>
                      <View style={styles.roleInfo}>
                        <Text style={[styles.roleTitle, isSelected && { color: Colors.warmBrownColor }]}>
                          {subRole.title}
                        </Text>
                        <Text style={styles.roleDescription}>{subRole.description}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.benefitsContainer}>
                      <Text style={styles.benefitsTitle}>What you get:</Text>
                      {subRole.benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                          <View style={styles.checkIconContainer}>
                            <Text style={styles.benefitBullet}>✓</Text>
                          </View>
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                    
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: Colors.warmBrownColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>About Our Ecosystem</Text>
            <Text style={styles.infoText}>
              Fit Formal connects customers with tailors and fabric shops to create a complete formal wear solution. 
              Whether you're buying fabric, getting measurements, or providing services - we've got you covered.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title="Continue to Sign Up"
          onPress={handleContinue}
          disabled={!selectedRole || (selectedRole === 'Seller' && !selectedSellerSubRole)}
          style={styles.continueButton}
        />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: GILROY_BOLD,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: GILROY_REGULAR,
  },
  rolesContainer: {
    marginBottom: 30,
  },
  roleCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedRoleCard: {
    backgroundColor: Colors.inputBackground,
    transform: [{ scale: 1.02 }],
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  roleIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.whiteColor,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 5,
    fontFamily: GILROY_BOLD,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: GILROY_REGULAR,
  },
  benefitsContainer: {
    marginTop: 10,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    fontFamily: GILROY_SEMIBOLD,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitBullet: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
    fontFamily: GILROY_REGULAR,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  infoContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    fontFamily: GILROY_SEMIBOLD,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: GILROY_REGULAR,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorderColor,
  },
  continueButton: {
    marginBottom: 15,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '500',
    fontFamily: GILROY_MEDIUM,
  },
  backToMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backArrowIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: Colors.warmBrownColor,
  },
  backToMainText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  subRolesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    fontFamily: GILROY_BOLD,
  },
});

export default RoleSelection;
