import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import { getOrderAvailability, batchUpdateOrderAvailability, updateSingleDayAvailability } from '../../utils/api/orderAvailabilityApi';
import { getBusinessInfo } from '../../utils/api/businessApi';
import StorageService from '../../services/storage.service';

interface DayAvailability {
  date: string; // ISO date string (YYYY-MM-DD)
  dateObj: Date;
  isAvailable: boolean;
  displayDate: string; // Formatted date for display
  dayName: string; // Day name (Today, Tomorrow, Mon, Tue, etc.)
  totalOrders: number;
}

const OrderAvailabilityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [visibleDays, setVisibleDays] = useState(7); // Start with 7 days
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);
  
  // Calculate tab bar height for proper padding
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  // Generate days starting from today
  const generateDays = useCallback((count: number, existingAvailability: any[] = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysList: DayAvailability[] = [];
    
    // Start from today (i=0) instead of tomorrow (i=1)
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Use local timezone to avoid date shift issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD
      
      // Find existing availability for this date
      // Handle both normalized format (date, isAvailable) and web API format (Date, IsClosed)
      const availabilityItem = existingAvailability.find((av: any) => {
        const avDateStr = av.date || av.Date;
        if (!avDateStr) return false;
        // Compare date strings directly to avoid timezone issues
        const avDateOnly = avDateStr.split('T')[0];
        return avDateOnly === dateStr;
      });
      
      // Format display date
      const dayName = getDayName(date, i);
      const displayDate = formatDisplayDate(date);
      
      // Handle both formats: normalized (isAvailable) and web API (IsClosed)
      // Default: toggle ON (taking orders) if no availability data exists
      let isAvailable = true;
      
      if (availabilityItem) {
        // Date matches: use IsClosed value
        // IsClosed: true → not taking orders (toggle OFF)
        // IsClosed: false → taking orders (toggle ON)
        if (availabilityItem.isAvailable !== undefined) {
          isAvailable = availabilityItem.isAvailable;
        } else if (availabilityItem.IsClosed !== undefined || availabilityItem.isClosed !== undefined) {
          const isClosed = availabilityItem.IsClosed !== undefined ? availabilityItem.IsClosed : availabilityItem.isClosed;
          isAvailable = !isClosed;
        }
      }
      // If no match, isAvailable remains true (default: taking orders)
      
      daysList.push({
        date: dateStr,
        dateObj: date,
        isAvailable: isAvailable,
        displayDate,
        dayName,
        totalOrders: 0,
      });
    }
    
    return daysList;
  }, []);

  // Get day name (Today, Tomorrow, or day name)
  const getDayName = (date: Date, daysFromToday: number): string => {
    if (daysFromToday === 0) {
      return 'Today';
    }
    if (daysFromToday === 1) {
      return 'Tomorrow';
    }
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  };

  // Load availability and orders data
  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get business ID
      const userData = await StorageService.getUser();
      console.log('User data:', userData);
      if (!userData) {
        throw new Error('User not found');
      }

      const parsedUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const userId = parsedUser?.user?.id || parsedUser?.id;
      console.log('User ID:', userId);
      if (!userId) {
        throw new Error('User ID not found');
      }

      let bid: number | null = null;
      try {
        const businessInfo = await getBusinessInfo(userId);
        console.log('Business info:', businessInfo);
        bid = businessInfo?.data?.data?.businessId;
        console.log('Business ID:', bid);
        setBusinessId(bid);
        console.log('Business ID set:', bid);
      } catch (error) {
        console.warn('Business info not found:', error);
      }

      if (!bid) {
        // Generate default days if no business ID
        const defaultDays = generateDays(Math.max(visibleDays, 7), []);
        setDays(defaultDays);
        setLoading(false);
        return;
      }

      // Fetch availability data
      let availabilityData: any[] = [];
      try {
        const availabilityResponse = await getOrderAvailability(bid);
        const rawData = availabilityResponse?.data?.data || availabilityResponse?.data || [];
        
        // Normalize availability data: handle Date (ISO format) and IsClosed (capitalized)
        availabilityData = rawData.map((item: any) => {
          const dateValue = item.Date || item.date;
          // Extract date string directly without timezone conversion
          let normalizedDate = null;
          if (dateValue) {
            // If it's already a string in YYYY-MM-DD format, use it directly
            if (typeof dateValue === 'string' && dateValue.includes('-')) {
              normalizedDate = dateValue.split('T')[0];
            } else {
              // Otherwise parse it safely
              const tempDate = new Date(dateValue);
              const year = tempDate.getFullYear();
              const month = String(tempDate.getMonth() + 1).padStart(2, '0');
              const day = String(tempDate.getDate()).padStart(2, '0');
              normalizedDate = `${year}-${month}-${day}`;
            }
          }
          const isClosed = item.IsClosed !== undefined ? item.IsClosed : item.isClosed;
          
          return {
            date: normalizedDate,
            isClosed: isClosed,
            ...item, // Keep other fields
          };
        });
        
        console.log('✅ Fetched availability data:', availabilityData);
      } catch (error) {
        console.warn('Could not fetch availability, using defaults:', error);
      }

      // Generate days with availability data
      const initialDays = generateDays(Math.max(visibleDays, 7), availabilityData);
      setDays(initialDays);
    } catch (error: any) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'Failed to load availability data');
      // Still generate default days
      const defaultDays = generateDays(Math.max(visibleDays, 7), []);
      setDays(defaultDays);
    } finally {
      setLoading(false);
    }
  }, [visibleDays, generateDays]);

  // Load on mount and focus
  useEffect(() => {
    loadAvailability();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvailability();
    }, [loadAvailability])
  );

  // Toggle availability for a day (real-time API call)
  const toggleAvailability = async (index: number) => {
    if (!businessId) {
      Alert.alert('Error', 'Business information not found. Please complete your business profile first.');
      return;
    }

    const day = days[index];
    const newAvailability = !day.isAvailable;
    
    // Optimistically update UI
    const updatedDays = [...days];
    updatedDays[index].isAvailable = newAvailability;
    setDays(updatedDays);
    setUpdatingIndex(index);

    try {
      // Call API in real-time
      await updateSingleDayAvailability(day.date, newAvailability, businessId);
      console.log(`✓ Updated availability for ${day.date}: ${newAvailability}`);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      // Revert on error
      updatedDays[index].isAvailable = day.isAvailable;
      setDays(updatedDays);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update availability. Please try again.'
      );
    } finally {
      setUpdatingIndex(null);
    }
  };

  // Show more days (up to 60)
  const showMoreDays = () => {
    if (visibleDays < 60) {
      const newVisibleDays = Math.min(visibleDays + 7, 60);
      setVisibleDays(newVisibleDays);
      
      // Reload data with new date range
      loadAvailability();
    }
  };

  // Handle day detail view (placeholder for future implementation)
  const handleDayPress = (day: DayAvailability) => {
    // TODO: Navigate to day detail screen or show modal with order details
    Alert.alert(
      day.dayName,
      `${day.displayDate}\n\nTotal Orders: ${day.totalOrders}\nStatus: ${day.isAvailable ? 'ACTIVE' : 'INACTIVE'}`,
      [{ text: 'OK' }]
    );
  };

  // Get status badge style
  const getStatusStyle = (isAvailable: boolean) => {
    return {
      backgroundColor: isAvailable ? '#D1FAE5' : '#FEE2E2',
      color: isAvailable ? '#065F46' : '#991B1B',
    };
  };

  // Render day row
  const renderDayRow = (day: DayAvailability, index: number) => {
    const statusStyle = getStatusStyle(day.isAvailable);
    const isUpdating = updatingIndex === index;
    
    return (
      <TouchableOpacity
        key={day.date}
        style={styles.dayRow}
        onPress={() => handleDayPress(day)}
        activeOpacity={0.7}
      >
        <View style={styles.dayInfo}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{day.dayName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {day.isAvailable ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>{day.displayDate}</Text>
          <View style={styles.ordersContainer}>
            <Text style={styles.ordersCount}>{day.totalOrders}</Text>
            <Text style={styles.ordersLabel}> orders</Text>
          </View>
        </View>
        
        <View style={styles.dayActions}>
          <Text style={styles.takingOrdersLabel}>Taking Orders</Text>
          {isUpdating ? (
            <ActivityIndicator size="small" color={Colors.warmBrownColor} style={styles.switchLoader} />
          ) : (
            <Switch
              value={day.isAvailable}
              onValueChange={() => toggleAvailability(index)}
              trackColor={{
                false: Colors.borderDark,
                true: Colors.warmBrownColor,
              }}
              thumbColor={Colors.whiteColor}
              ios_backgroundColor={Colors.borderDark}
            />
          )}
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>Orders Per Day</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.warmBrownColor} />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders Per Day</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filter/Dropdown placeholder */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>Last {visibleDays} days</Text>
          <Icon name="chevron-down" size={16} color={Colors.textSecondary} />
        </View>

        {/* Days List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {days.slice(0, visibleDays).map((day, index) => renderDayRow(day, index))}

          {/* Show More Button */}
          {visibleDays < 60 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={showMoreDays}
            >
              <Text style={styles.showMoreText}>Show More Days</Text>
              <Icon name="chevron-down" size={20} color={Colors.warmBrownColor} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginRight: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20, // Base padding, actual paddingBottom is set dynamically
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dayInfo: {
    flex: 1,
    marginRight: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 4,
  },
  ordersContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  ordersCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  ordersLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginLeft: 4,
  },
  dayActions: {
    alignItems: 'flex-end',
  },
  takingOrdersLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginBottom: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  showMoreText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
    marginRight: 6,
  },
  switchLoader: {
    marginVertical: 4,
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
});

export default OrderAvailabilityScreen;

