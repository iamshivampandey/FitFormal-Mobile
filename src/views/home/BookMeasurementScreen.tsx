import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';

const { width } = Dimensions.get('window');

interface Tailor {
  id: string;
  name: string;
  rating: number;
  distance: string;
  specialization: string;
  experienceYears: number;
  priceRange: string;
  availability: string;
  completedBookings: number;
}

const BookMeasurementScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTailor, setSelectedTailor] = useState<string | null>(null);

  const tailors: Tailor[] = [
    {
      id: '1',
      name: 'John Smith',
      rating: 4.8,
      distance: '1.2 km',
      specialization: 'Formal Suits',
      experienceYears: 15,
      priceRange: '$$',
      availability: 'Available Today',
      completedBookings: 250,
    },
    {
      id: '2',
      name: 'Michael Johnson',
      rating: 4.9,
      distance: '2.5 km',
      specialization: 'Shirt & Blazers',
      experienceYears: 10,
      priceRange: '$$$',
      availability: 'Available Tomorrow',
      completedBookings: 180,
    },
    {
      id: '3',
      name: 'David Williams',
      rating: 4.7,
      distance: '3.1 km',
      specialization: 'Complete Formal Wear',
      experienceYears: 20,
      priceRange: '$$',
      availability: 'Available Today',
      completedBookings: 420,
    },
    {
      id: '4',
      name: 'Robert Brown',
      rating: 4.6,
      distance: '1.8 km',
      specialization: 'Trouser Specialist',
      experienceYears: 8,
      priceRange: '$',
      availability: 'Available Today',
      completedBookings: 150,
    },
    {
      id: '5',
      name: 'James Wilson',
      rating: 4.9,
      distance: '2.8 km',
      specialization: 'Wedding Suits',
      experienceYears: 18,
      priceRange: '$$$',
      availability: 'Available Tomorrow',
      completedBookings: 320,
    },
    {
      id: '6',
      name: 'William Martinez',
      rating: 4.7,
      distance: '1.5 km',
      specialization: 'Business Formals',
      experienceYears: 12,
      priceRange: '$$',
      availability: 'Available Today',
      completedBookings: 280,
    },
  ];

  const filteredTailors = tailors.filter(
    (tailor) =>
      tailor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tailor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookMeasurement = () => {
    if (!selectedTailor) {
      Alert.alert('No Tailor Selected', 'Please select a tailor to continue.');
      return;
    }

    const tailor = tailors.find((t) => t.id === selectedTailor);
    Alert.alert(
      'Booking Confirmed!',
      `You have selected ${tailor?.name} for measurement booking.\n\nLocation selection and appointment timing will be added soon.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderTailor = (tailor: Tailor) => {
    const isSelected = selectedTailor === tailor.id;
    
    return (
      <TouchableOpacity
        key={tailor.id}
        style={[
          styles.tailorCard,
          isSelected && styles.selectedTailorCard,
        ]}
        onPress={() => setSelectedTailor(tailor.id)}
        activeOpacity={0.7}
      >
        {/* Tailor Avatar */}
        <View style={styles.tailorAvatar}>
          <Text style={styles.tailorAvatarText}>{tailor.name.charAt(0)}</Text>
        </View>

        {/* Tailor Info */}
        <View style={styles.tailorInfo}>
          <View style={styles.tailorHeader}>
            <Text style={styles.tailorName}>{tailor.name}</Text>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ Selected</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.tailorSpecialization}>{tailor.specialization}</Text>
          
          <View style={styles.tailorDetails}>
            <Text style={styles.tailorRating}>⭐ {tailor.rating}</Text>
            <Text style={styles.tailorDistance}>📍 {tailor.distance}</Text>
            <Text style={styles.tailorExperience}>⏱ {tailor.experienceYears} yrs</Text>
          </View>

          <View style={styles.tailorFooter}>
            <Text style={styles.tailorPrice}>{tailor.priceRange}</Text>
            <Text style={styles.tailorBookings}>
              {tailor.completedBookings} bookings
            </Text>
            <Text
              style={[
                styles.availability,
                tailor.availability.includes('Today') && styles.availableToday,
              ]}
            >
              {tailor.availability}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Measurement</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tailors by name or specialization..."
          placeholderTextColor={Colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>ℹ️</Text>
        <Text style={styles.infoBannerText}>
          Select a tailor to book your measurement appointment
        </Text>
      </View>

      {/* Tailors List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>
          Available Tailors ({filteredTailors.length})
        </Text>
        
        {filteredTailors.length > 0 ? (
          filteredTailors.map(renderTailor)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>No tailors found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {selectedTailor && (
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookMeasurement}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Continue to Book</Text>
            <Text style={styles.bookButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorderColor,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: GILROY_REGULAR,
  },
  searchButton: {
    padding: 10,
  },
  searchIcon: {
    fontSize: 18,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmBrownColor + '15',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warmBrownColor,
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontFamily: GILROY_REGULAR,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
    fontFamily: GILROY_BOLD,
  },
  tailorCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.inputBorderColor,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedTailorCard: {
    borderColor: Colors.warmBrownColor,
    borderWidth: 2,
    backgroundColor: Colors.warmBrownColor + '08',
  },
  tailorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tailorAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  tailorInfo: {
    flex: 1,
  },
  tailorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tailorName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    fontFamily: GILROY_BOLD,
  },
  selectedBadge: {
    backgroundColor: Colors.warmBrownColor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: Colors.whiteColor,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  tailorSpecialization: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 10,
    fontFamily: GILROY_REGULAR,
  },
  tailorDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tailorRating: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 15,
    fontFamily: GILROY_REGULAR,
  },
  tailorDistance: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 15,
    fontFamily: GILROY_REGULAR,
  },
  tailorExperience: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  tailorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tailorPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginRight: 10,
    fontFamily: GILROY_BOLD,
  },
  tailorBookings: {
    fontSize: 12,
    color: Colors.grey,
    marginRight: 10,
    fontFamily: GILROY_REGULAR,
  },
  availability: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey,
    fontFamily: GILROY_SEMIBOLD,
  },
  availableToday: {
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    fontFamily: GILROY_SEMIBOLD,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorderColor,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bookButton: {
    backgroundColor: Colors.warmBrownColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.warmBrownColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bookButtonText: {
    color: Colors.whiteColor,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: GILROY_BOLD,
  },
  bookButtonIcon: {
    color: Colors.whiteColor,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default BookMeasurementScreen;

