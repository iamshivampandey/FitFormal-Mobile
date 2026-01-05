import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import { getTailorDetails } from '../../utils/api/businessApi';

const { width } = Dimensions.get('window');

interface TailorDetailScreenProps {
  navigation: any;
  route: any;
}

interface TailorDetail {
  id: number;
  businessId: number;
  businessName: string;
  ownerName?: string;
  city?: string;
  state?: string;
  address?: string;
  yearsOfExperience?: string | number;
  businessLogo?: string;
  rating?: number;
  reviewCount?: number;
  specialization?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessDescription?: string;
  serviceTypes?: string;
  portfolioPhotos?: string;
  openingTime?: string;
  closingTime?: string;
  cancellationPolicy?: string;
  googleMapLink?: string;
  tailorItemPrices?: string;
}

const TailorDetailScreen: React.FC<TailorDetailScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { businessId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [tailor, setTailor] = useState<TailorDetail | null>(null);

  useEffect(() => {
    loadTailorDetails();
  }, [businessId]);

  const loadTailorDetails = async () => {
    if (!businessId) {
      Alert.alert('Error', 'Business ID is missing');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const response = await getTailorDetails(businessId);
      const tailorData = response?.data?.data || response?.data;
      
      console.log('Tailor details:', tailorData);
      setTailor(tailorData);
    } catch (error: any) {
      console.error('Error loading tailor details:', error);
      Alert.alert('Error', 'Failed to load tailor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!tailor) {
      Alert.alert('Error', 'Tailor information not available');
      return;
    }

    if (!tailor.tailorItemPrices) {
      Alert.alert('Error', 'No items available for this tailor');
      return;
    }

    navigation.navigate('SelectClothes', {
      businessId: tailor.businessId || businessId,
      tailorName: tailor.businessName,
      tailorItemPrices: tailor.tailorItemPrices,
    });
  };

  const getLocationDisplay = (): string => {
    if (!tailor) return 'Not specified';
    if (tailor.city && tailor.state) {
      return `${tailor.city}, ${tailor.state}`;
    } else if (tailor.city) {
      return tailor.city;
    } else if (tailor.address) {
      return tailor.address;
    }
    return 'City not specified';
  };

  const getServices = (): string[] => {
    if (!tailor?.serviceTypes) return [];
    try {
      // If it's a JSON string, parse it
      if (typeof tailor.serviceTypes === 'string') {
        const parsed = JSON.parse(tailor.serviceTypes);
        const services: any[] = Array.isArray(parsed) ? parsed : [];
        // Clean up service names
        return services.map((s: any) => 
          String(s).replace(/&quot;/g, '"')
           .replace(/&amp;/g, '&')
           .replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>')
           .replace(/&#39;/g, "'")
           .trim()
        );
      }
      // If it's already an array
      if (Array.isArray(tailor.serviceTypes)) {
        return (tailor.serviceTypes as any[]).map((s: any) => String(s).trim());
      }
    } catch (e) {
      console.error('Error parsing service types:', e);
      // If parsing fails, try splitting by comma
      if (typeof tailor.serviceTypes === 'string') {
        return tailor.serviceTypes.split(',').map((s: string) => s.trim());
      }
    }
    return [];
  };

  const getPortfolioPhotos = (): string[] => {
    if (!tailor?.portfolioPhotos) return [];
    try {
      // If it's a JSON string, parse it
      if (typeof tailor.portfolioPhotos === 'string') {
        const parsed = JSON.parse(tailor.portfolioPhotos);
        return Array.isArray(parsed) ? parsed : [];
      }
      // If it's already an array
      if (Array.isArray(tailor.portfolioPhotos)) {
        return tailor.portfolioPhotos;
      }
    } catch (e) {
      // If parsing fails, try splitting by comma
      return tailor.portfolioPhotos.split(',').map((s: string) => s.trim());
    }
    return [];
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tailor Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.warmBrownColor} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (!tailor) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tailor Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={Colors.grey} />
          <Text style={styles.errorText}>Tailor not found</Text>
        </View>
      </View>
    );
  }

  const rating = tailor.rating || 4.5;
  const reviewCount = tailor.reviewCount || 120;
  const services = getServices();
  const portfolioPhotos = getPortfolioPhotos();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Name and Owner */}
        <View style={styles.titleSection}>
          <Text style={styles.businessName}>{tailor.businessName}</Text>
          <Text style={styles.ownerName}>by {tailor.ownerName || tailor.businessName}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= Math.floor(rating) ? 'star' : 'star-outline'}
              size={20}
              color="#FFB800"
              style={styles.starIcon}
            />
          ))}
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({reviewCount} reviews)
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Icon name="location" size={18} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{getLocationDisplay()}</Text>
        </View>

        {/* About Section */}
        {tailor.businessDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{tailor.businessDescription}</Text>
          </View>
        )}

        {/* Services Offered */}
        {services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={styles.servicesContainer}>
              {services.map((service, index) => (
                <View key={index} style={styles.serviceChip}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gallery / Portfolio */}
        {portfolioPhotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery / Portfolio</Text>
            <View style={styles.galleryContainer}>
              {portfolioPhotos.map((photo, index) => (
                <View key={index} style={styles.galleryItem}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {tailor.yearsOfExperience && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Experience</Text>
            <Text style={styles.infoCardText}>
              {tailor.yearsOfExperience} years
            </Text>
          </View>
        )}

        {/* Cancellation Policy */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Cancellation Policy</Text>
          <Text style={styles.infoCardText}>
            {tailor.cancellationPolicy || 'Free cancellation up to 24 hours before appointment'}
          </Text>
        </View>

        {/* Measurement History */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Measurement History</Text>
          <Text style={styles.infoCardText}>
            No previous measurements recorded
          </Text>
        </View>

        {/* Extra space for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Book Now Button - Fixed at bottom */}
      <View style={styles.bookNowContainer}>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookNowText}>BOOK NOW</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180, // Space for fixed button + tab bar
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: Colors.whiteColor,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.whiteColor,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.whiteColor,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginLeft: 8,
  },
  section: {
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    lineHeight: 22,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  serviceChip: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_MEDIUM,
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  galleryItem: {
    width: (width - 64) / 3, // 3 columns with padding
    height: (width - 64) / 3,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  bookNowContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 83 : 65, // Position above the tab bar
    left: 0,
    right: 0,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bookNowButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bookNowText: {
    color: Colors.whiteColor,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginTop: 16,
  },
});

export default TailorDetailScreen;

