import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import { getTailorAvailability } from '../../utils/api/orderAvailabilityApi';

interface DateSelectionScreenProps {
  navigation: any;
  route: any;
}

interface AvailabilityData {
  Date?: string;
  date?: string;
  IsClosed?: boolean;
  isClosed?: boolean;
}

interface DayData {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAvailable: boolean;
  isClosed: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DateSelectionScreen: React.FC<DateSelectionScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { businessId, tailorName, selectedItems } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadAvailability();
  }, [businessId]);

  const loadAvailability = async () => {
    if (!businessId) {
      Alert.alert('Error', 'Business information is missing');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const response = await getTailorAvailability(businessId);
      const data = response?.data?.data || response?.data || [];
      setAvailabilityData(data);
    } catch (error: any) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): DayData[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to fill
    const prevMonthDays = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();
    
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = formatDateString(date);
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isAvailable: false,
        isClosed: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDateString(date);
      const availabilityItem = availabilityData.find((item) => {
        const itemDate = item.Date || item.date;
        return itemDate && itemDate.split('T')[0] === dateString;
      });

      const isClosed = availabilityItem 
        ? (availabilityItem.IsClosed !== undefined ? availabilityItem.IsClosed : availabilityItem.isClosed)
        : false;
      
      const isPast = date < today;
      const isAvailable = !isClosed && !isPast;

      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isAvailable,
        isClosed: isClosed || isPast,
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = formatDateString(date);
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isAvailable: false,
        isClosed: true,
      });
    }

    return days;
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const dayName = DAYS[date.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: DayData) => {
    if (!day.isCurrentMonth || !day.isAvailable) {
      return;
    }
    setSelectedDate(day.dateString);
  };

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date for your booking');
      return;
    }

    // TODO: Navigate to next step (measurement or confirmation)
    console.log('Selected date:', selectedDate);
    console.log('Selected items:', selectedItems);
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Date</Text>
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tailor Info */}
        <View style={styles.tailorInfo}>
          <Icon name="person-circle" size={40} color={Colors.warmBrownColor} />
          <View style={styles.tailorDetails}>
            <Text style={styles.tailorLabel}>Booking with</Text>
            <Text style={styles.tailorName}>{tailorName || 'Tailor'}</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
              <Icon name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Icon name="chevron-forward" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day.dateString;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayCellInactive,
                    day.isToday && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                    !day.isAvailable && day.isCurrentMonth && styles.dayCellUnavailable,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  disabled={!day.isCurrentMonth || !day.isAvailable}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.dayTextInactive,
                      day.isToday && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                      !day.isAvailable && day.isCurrentMonth && styles.dayTextUnavailable,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                  {day.isAvailable && !isSelected && (
                    <View style={styles.availableDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Not Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warmBrownColor }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
        </View>

        {/* Selected Date Display */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <View style={styles.selectedDateHeader}>
              <Icon name="calendar" size={24} color={Colors.warmBrownColor} />
              <Text style={styles.selectedDateLabel}>Selected Date</Text>
            </View>
            <Text style={styles.selectedDateText}>{formatDisplayDate(selectedDate)}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action */}
      {selectedDate && (
        <View style={styles.bottomAction}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue with Selected Date</Text>
            <Icon name="arrow-forward" size={20} color={Colors.whiteColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  tailorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
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
  tailorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  tailorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 2,
  },
  tailorName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  calendarContainer: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellToday: {
    backgroundColor: '#FEF3E2',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: Colors.warmBrownColor,
    borderRadius: 8,
  },
  dayCellUnavailable: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  dayTextInactive: {
    color: Colors.grey,
  },
  dayTextToday: {
    color: Colors.warmBrownColor,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  dayTextSelected: {
    color: Colors.whiteColor,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  dayTextUnavailable: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  availableDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  selectedDateContainer: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
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
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginLeft: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomAction: {
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 16,
    borderRadius: 12,
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
  continueButtonText: {
    color: Colors.whiteColor,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
    marginRight: 8,
  },
});

export default DateSelectionScreen;


