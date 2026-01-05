import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import { getAllTailors } from '../../utils/api/businessApi';

interface Tailor {
  id: number;
  businessId?: number;
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
  isActive?: boolean;
}

const FindTailorsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tailors, setTailors] = useState<Tailor[]>([]);

  // Load tailors data
  const loadTailors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTailors({ businessType: 'tailor' });
      const tailorsData = response?.data?.data || response?.data || [];
      
      console.log('Tailors data:', tailorsData);
      setTailors(tailorsData);
    } catch (error: any) {
      console.error('Error loading tailors:', error);
      Alert.alert('Error', 'Failed to load tailors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and focus
  useEffect(() => {
    loadTailors();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTailors();
    }, [loadTailors])
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTailors();
    setRefreshing(false);
  };

  // Handle book now
  const handleBookNow = (tailor: Tailor) => {
    const businessId = tailor.businessId || tailor.id;
    if (!businessId) {
      Alert.alert('Error', 'Business information is missing');
      return;
    }
    
    navigation.navigate('TailorDetail', { businessId });
  };

  // Get location display
  const getLocationDisplay = (tailor: Tailor): string => {
    if (tailor.city && tailor.state) {
      return `${tailor.city}, ${tailor.state}`;
    } else if (tailor.city) {
      return tailor.city;
    } else if (tailor.address) {
      return tailor.address;
    }
    return 'City not specified';
  };

  // Get experience display
  const getExperienceDisplay = (tailor: Tailor): string => {
    if (tailor.yearsOfExperience) {
      return `${tailor.yearsOfExperience} years experience`;
    }
    return 'Not specified';
  };

  // Render tailor card
  const renderTailorCard = (tailor: Tailor) => {
    const isActive = tailor.isActive !== false; // Default to true if not specified
    const rating = tailor.rating || 4.5;
    const reviewCount = tailor.reviewCount || 50;

    return (
      <View key={tailor.id || tailor.businessId} style={styles.tailorCard}>
        {/* Active Badge */}
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}

        {/* Tailor Image */}
        <View style={styles.imageContainer}>
          {tailor.businessLogo ? (
            <Image
              source={{ uri: tailor.businessLogo }}
              style={styles.tailorImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="person" size={60} color={Colors.grey} />
            </View>
          )}
        </View>

        {/* Tailor Info */}
        <View style={styles.tailorInfo}>
          <Text style={styles.tailorName} numberOfLines={1}>
            {tailor.businessName}
          </Text>
          <Text style={styles.ownerName} numberOfLines={1}>
            by {tailor.ownerName || tailor.businessName}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= Math.floor(rating) ? 'star' : 'star-outline'}
                size={16}
                color="#FFB800"
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.ratingText}>
              {rating.toFixed(1)} • {reviewCount}+ reviews
            </Text>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <Icon name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {getLocationDisplay(tailor)}
            </Text>
          </View>

          {/* Experience */}
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{getExperienceDisplay(tailor)}</Text>
          </View>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookNow(tailor)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Tailors</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.warmBrownColor} />
          <Text style={styles.loadingText}>Loading tailors...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Find Tailors</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tailors List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.warmBrownColor}
          />
        }
      >
        {tailors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={64} color={Colors.grey} />
            <Text style={styles.emptyText}>No tailors found</Text>
            <Text style={styles.emptySubtext}>
              Check back later for available tailors in your area
            </Text>
          </View>
        ) : (
          tailors.map((tailor) => renderTailorCard(tailor))
        )}
      </ScrollView>
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
  filterButton: {
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
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  tailorCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeBadgeText: {
    color: Colors.whiteColor,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.borderLight,
  },
  tailorImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  tailorInfo: {
    padding: 16,
  },
  tailorName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginLeft: 8,
    flex: 1,
  },
  bookButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
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
  bookButtonText: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    textAlign: 'center',
  },
});

export default FindTailorsScreen;

