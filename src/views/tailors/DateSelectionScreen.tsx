import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import { getTailorAvailability } from '../../utils/api/orderAvailabilityApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import StorageService from '../../services/storage.service';
import { getMyDeliveryAddresses, saveDeliveryAddress } from '../../utils/api/deliveryAddressApi';

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
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type MeasurementSlot = {
  id: string;
  label: string;
  isAvailable: boolean;
};

type AddressType = 'Home' | 'Work' | 'Office';

type DeliveryAddress = {
  id: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType;
  googleMapLink?: string;
};

const ADDRESS_MODE = {
  LIST: 'list',
  FORM: 'form',
} as const;
type AddressMode = (typeof ADDRESS_MODE)[keyof typeof ADDRESS_MODE];

const ADDRESS_TYPE = {
  HOME: 'Home',
  OFFICE: 'Office',
} as const;

const ADDRESS_MODAL_MODE = {
  MEASUREMENT: 'measurement',
  DELIVERY: 'delivery',
} as const;
type AddressModalMode = (typeof ADDRESS_MODAL_MODE)[keyof typeof ADDRESS_MODAL_MODE];

const DEFAULT_MEASUREMENT_SLOTS: MeasurementSlot[] = [
  { id: '08:00-10:00', label: '8am-\n10am', isAvailable: true },
  { id: '10:00-12:00', label: '10am-\n12pm', isAvailable: true },
  { id: '12:00-14:00', label: '12pm-\n2pm', isAvailable: true },
  { id: '14:00-16:00', label: '2pm-\n4pm', isAvailable: true },
  { id: '16:00-18:00', label: '4pm-\n6pm', isAvailable: true },
  { id: '18:00-20:00', label: '6pm-\n8pm', isAvailable: true },
  { id: '20:00-22:00', label: '8pm-\n10pm', isAvailable: true },
];

const DateSelectionScreen: React.FC<DateSelectionScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { businessId, tailorName, selectedItems } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<AddressModalMode>(ADDRESS_MODAL_MODE.MEASUREMENT);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedMeasurementAddressId, setSelectedMeasurementAddressId] = useState<string | null>(null);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>(ADDRESS_MODE.LIST);

  // Address form
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAltPhone, setAddrAltPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrType, setAddrType] = useState<AddressType>(ADDRESS_TYPE.HOME);
  const [addrGmap, setAddrGmap] = useState('');

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAvailability();
  }, [businessId]);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const response = await getMyDeliveryAddresses();
      const data = response?.data?.data ?? response?.data ?? [];
      const rawList = Array.isArray(data) ? data : [];

      const mapped: DeliveryAddress[] = rawList.map((a: any, idx: number) => {
        const id = String(
          a.deliveryAddressId ?? 
          a.DeliveryAddressId ?? 
          a.id ?? 
          a.Id ?? 
          a.addressId ?? 
          a.AddressId ?? 
          a._id ?? 
          `${idx}`
        );
        const fullName = String(a.fullName ?? a.FullName ?? a.name ?? a.Name ?? '').trim();
        const phoneNumber = String(a.phoneNumber ?? a.PhoneNumber ?? a.mobileNumber ?? a.MobileNumber ?? '').trim();
        const alternatePhone = String(
          a.alternatePhone ??
            a.AlternatePhone ??
            a.alternateNumber ??
            a.AlternateNumber ??
            ''
        ).trim();
        const addressLine1 = String(
          a.addressLine1 ?? a.AddressLine1 ?? a.address1 ?? a.Address1 ?? a.address ?? a.Address ?? ''
        ).trim();
        const addressLine2 = String(a.addressLine2 ?? a.AddressLine2 ?? a.address2 ?? a.Address2 ?? '').trim();
        const landmark = String(a.landmark ?? a.Landmark ?? '').trim();
        const city = String(a.city ?? a.City ?? '').trim();
        const state = String(a.state ?? a.State ?? '').trim();
        const pincode = String(a.pincode ?? a.Pincode ?? a.zipCode ?? a.ZipCode ?? '').trim();
        const addressTypeRaw = String(a.addressType ?? a.AddressType ?? a.type ?? a.Type ?? 'Home');
        const addressType: AddressType =
          addressTypeRaw.toLowerCase() === 'office'
            ? ADDRESS_TYPE.OFFICE
            : addressTypeRaw.toLowerCase() === 'work'
              ? 'Work'
              : ADDRESS_TYPE.HOME;
        const googleMapLink = String(a.googleMapLink ?? a.GoogleMapLink ?? a.mapLink ?? a.MapLink ?? '').trim();

        return {
          id,
          fullName,
          phoneNumber,
          alternatePhone: alternatePhone || undefined,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          landmark: landmark || undefined,
          city,
          state,
          pincode,
          addressType,
          googleMapLink: googleMapLink || undefined,
        };
      });

      setAddresses(mapped);
      await StorageService.saveDeliveryAddresses(mapped);
      return;
    } catch (e) {
      console.warn('Failed to load addresses from API, falling back to cache:', e);
    }

    try {
      const raw = await StorageService.getDeliveryAddresses();
      if (!raw) {
        setAddresses([]);
        return;
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setAddresses(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.warn('Failed to load cached addresses:', e);
      setAddresses([]);
    }
  };

  const persistAddresses = async (next: DeliveryAddress[]) => {
    setAddresses(next);
    await StorageService.saveDeliveryAddresses(next);
  };

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
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const prevMonthDays = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();
    
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const remainingDays = 42 - days.length;
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

  const formatDisplayDateLong = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const dayName = DAYS_LONG[date.getDay()];
    return `${dayName}, ${month} ${day}, ${year}`;
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
    // Open slot modal immediately when date is selected
    setIsSlotModalVisible(true);
  };

  const resetAddressForm = () => {
    setAddrFullName('');
    setAddrPhone('');
    setAddrAltPhone('');
    setAddrLine1('');
    setAddrLine2('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrType(ADDRESS_TYPE.HOME);
    setAddrGmap('');
    setAddressErrors({});
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!addrFullName.trim()) errors.fullName = 'Full name is required';
    if (!addrPhone.trim()) errors.phoneNumber = 'Phone number is required';
    if (addrPhone.trim() && addrPhone.trim().length !== 10) errors.phoneNumber = 'Phone number must be 10 digits';
    if (!addrLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
    if (!addrCity.trim()) errors.city = 'City is required';
    if (!addrState.trim()) errors.state = 'State is required';
    if (!addrPincode.trim()) errors.pincode = 'Pincode is required';
    if (addrPincode.trim() && addrPincode.trim().length !== 6) errors.pincode = 'Pincode must be 6 digits';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveNewAddress = async (): Promise<boolean> => {
    if (!validateAddressForm()) return false;

    try {
      // Get userId from storage
      const userDataStr = await StorageService.getUser();
      console.log('userDataStr', userDataStr);
      if (!userDataStr) {
        Alert.alert('Error', 'User session not found. Please login again.');
        return false;
      }
      const userData = JSON.parse(userDataStr);
      const userId = userData?.user?.id || userData?.userId || userData?.Id || userData?.UserId;
      
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return false;
      }

      // Prepare the payload for API
      const payload = {
        fullName: addrFullName.trim(),
        phoneNumber: addrPhone.trim(),
        alternatePhone: addrAltPhone.trim() || undefined,
        addressLine1: addrLine1.trim(),
        addressLine2: addrLine2.trim() || undefined,
        landmark: addrLandmark.trim() || undefined,
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        addressType: addrType,
        googleMapLink: addrGmap.trim() || undefined,
      };

      // Call API to save address (userId in URL path)
      // const response = await saveDeliveryAddress(userId, payload);
      
      // Extract saved address from response (data is now an object, not array)
      // const savedAddress = response?.data?.data || response?.data || {};
      
      // Extract the ID (deliveryAddressId from API response)
      // const addressId = String(
      //   savedAddress?.deliveryAddressId || 
      //   savedAddress?.DeliveryAddressId || 
      //   savedAddress?.id || 
      //   savedAddress?.Id || 
      //   `local-${Date.now()}`
      // );

      const addressId = '50002';

      // Create address object with API response ID
      const newAddress: DeliveryAddress = {
        id: addressId,
        fullName: addrFullName.trim(),
        phoneNumber: addrPhone.trim(),
        alternatePhone: addrAltPhone.trim() || undefined,
        addressLine1: addrLine1.trim(),
        addressLine2: addrLine2.trim() || undefined,
        landmark: addrLandmark.trim() || undefined,
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        addressType: addrType,
        googleMapLink: addrGmap.trim() || undefined,
      };

      // Update local state and cache
      const updated = [...addresses, newAddress];
      await persistAddresses(updated);

      // Set as selected address
      if (addressModalMode === ADDRESS_MODAL_MODE.MEASUREMENT) {
        setSelectedMeasurementAddressId(newAddress.id);
      } else {
        setSelectedDeliveryAddressId(newAddress.id);
      }

      resetAddressForm();
      Alert.alert('Success', 'Address saved successfully!');
      return true;
    } catch (error: any) {
      console.error('Failed to save address:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save address. Please try again.');
      return false;
    }
  };

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date for your booking');
      return;
    }

    if (!selectedSlotId) {
      Alert.alert('Select Measurement Slot', 'Please select a measurement time slot');
      return;
    }

    if (!selectedMeasurementAddressId) {
      Alert.alert('Select Measurement Address', 'Please select a measurement address');
      return;
    }

    if (!selectedDeliveryAddressId) {
      Alert.alert('Select Delivery Address', 'Please select a delivery address');
      return;
    }

    navigation.navigate('TailorBookingReview', {
      businessId,
      tailorName,
      selectedItems,
      selectedDate,
      selectedSlotId,
      measurementAddressId: selectedMeasurementAddressId,
      deliveryAddressId: selectedDeliveryAddressId,
    });
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

  const selectedAddressId = addressModalMode === ADDRESS_MODAL_MODE.MEASUREMENT 
    ? selectedMeasurementAddressId 
    : selectedDeliveryAddressId;

  const setSelectedAddressId = (id: string) => {
    if (addressModalMode === ADDRESS_MODAL_MODE.MEASUREMENT) {
      setSelectedMeasurementAddressId(id);
    } else {
      setSelectedDeliveryAddressId(id);
    }
  };

  const addressModalTitle = addressModalMode === ADDRESS_MODAL_MODE.MEASUREMENT 
    ? 'Measurement Address' 
    : 'Delivery Address';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.tailorInfo}>
          <Icon name="person-circle" size={40} color={Colors.warmBrownColor} />
          <View style={styles.tailorDetails}>
            <Text style={styles.tailorLabel}>Booking with</Text>
            <Text style={styles.tailorName}>{tailorName || 'Tailor'}</Text>
          </View>
        </View>

        {/* Selected Date Card - Shown above calendar */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <View style={styles.selectedDateHeader}>
              <Icon name="calendar" size={24} color={Colors.warmBrownColor} />
              <Text style={styles.selectedDateLabel}>Selected Date</Text>
            </View>
            <Text style={styles.selectedDateText}>{formatDisplayDate(selectedDate)}</Text>
          </View>
        )}

        {/* Measurement Slot Card - Shown above calendar */}
        {selectedDate && (
          <TouchableOpacity
            style={styles.slotCard}
            activeOpacity={0.8}
            onPress={() => setIsSlotModalVisible(true)}
          >
            <View style={styles.slotCardHeader}>
              <View style={styles.slotCardTitleRow}>
                <Icon name="time-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.slotCardTitle}>Select Measurement Slot</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.grey} />
            </View>
            <Text style={styles.slotCardSubtitle}>
              Choose a 2-hour slot for your measurement appointment
            </Text>
            {selectedSlotId ? (
              <View style={styles.selectedSlotPill}>
                <Icon name="checkmark-circle" size={16} color={Colors.successGreen} />
                <Text style={styles.selectedSlotPillText}>{selectedSlotId}</Text>
              </View>
            ) : (
              <Text style={styles.slotCardHint}>Tap to view available times</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.calendarContainer}>
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

          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {selectedDate && selectedSlotId && selectedMeasurementAddressId && selectedDeliveryAddressId && (
        <View style={styles.bottomAction}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Review</Text>
            <Icon name="arrow-forward" size={20} color={Colors.whiteColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Measurement Slot Modal */}
      <Modal
        visible={isSlotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSlotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Measurement Slot</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsSlotModalVisible(false)}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedDate && (
              <View style={styles.modalDateRow}>
                <Text style={styles.modalDateLabel}>Measurement Date:</Text>
                <Text style={styles.modalDateValue}>{formatDisplayDateLong(selectedDate)}</Text>
              </View>
            )}

            <Text style={styles.modalSectionTitle}>Select Measurement Slot</Text>
            <Text style={styles.modalSectionSubtitle}>
              Choose a 2-hour slot for your measurement appointment
            </Text>

            <View style={styles.slotsGrid}>
              {DEFAULT_MEASUREMENT_SLOTS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotTile,
                      slot.isAvailable ? styles.slotTileAvailable : styles.slotTileUnavailable,
                      isSelected && styles.slotTileSelected,
                    ]}
                    activeOpacity={0.85}
                    disabled={!slot.isAvailable}
                    onPress={() => {
                      setSelectedSlotId(slot.id);
                      setIsSlotModalVisible(false);
                      setAddressMode(ADDRESS_MODE.LIST);
                      setAddressModalMode(ADDRESS_MODAL_MODE.MEASUREMENT);
                      setIsAddressModalVisible(true);
                    }}
                  >
                    <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                      {slot.label}
                    </Text>
                    <View style={[styles.slotBadge, isSelected && styles.slotBadgeSelected]}>
                      <Text style={styles.slotBadgeText}>
                        {slot.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Modal (Measurement or Delivery) */}
      <Modal
        visible={isAddressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{addressModalTitle}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsAddressModalVisible(false)}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              style={styles.addressKeyboardAvoid}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.addressModalScroll}
                contentContainerStyle={styles.addressModalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.addressSectionTitle}>{addressModalTitle}</Text>
                <Text style={styles.addressSectionSubtitle}>
                  Select a saved address or add a new one
                </Text>

                {addressMode === ADDRESS_MODE.LIST ? (
                  <View>
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const typeLabel = addr.addressType === ADDRESS_TYPE.OFFICE ? ADDRESS_TYPE.OFFICE : addr.addressType;
                      const phones = addr.alternatePhone
                        ? `${addr.phoneNumber} / ${addr.alternatePhone}`
                        : addr.phoneNumber;
                      return (
                        <TouchableOpacity
                          key={addr.id}
                          activeOpacity={0.85}
                          onPress={() => setSelectedAddressId(addr.id)}
                          style={[
                            styles.addressCard,
                            isSelected && styles.addressCardSelected,
                          ]}
                        >
                          <View style={styles.addressCardTopRow}>
                            <Text style={styles.addressName}>{addr.fullName}</Text>
                            <View style={styles.addressTypePill}>
                              <Text style={styles.addressTypePillText}>{typeLabel}</Text>
                            </View>
                          </View>
                          <Text style={styles.addressPhone}>{phones}</Text>
                          <Text style={styles.addressLine}>{addr.addressLine1}</Text>
                          <Text style={styles.addressLine}>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </Text>
                          {isSelected && (
                            <Text style={styles.addressSelectedText}>✓ Selected</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      style={styles.addNewAddressButton}
                      activeOpacity={0.85}
                      onPress={() => {
                        resetAddressForm();
                        setAddressMode(ADDRESS_MODE.FORM);
                      }}
                    >
                      <Text style={styles.addNewAddressText}>＋ Add New Address</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.addressForm}>
                    <Text style={styles.formLabel}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
                    <CustomInput
                      placeholder="Full Name"
                      value={addrFullName}
                      onChangeText={(t) => {
                        setAddressErrors((p) => ({ ...p, fullName: '' }));
                        setAddrFullName(t);
                      }}
                      error={addressErrors.fullName}
                    />

                    <Text style={styles.formLabel}>Phone Number <Text style={styles.requiredStar}>*</Text></Text>
                    <CustomInput
                      placeholder="Phone Number"
                      value={addrPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      onChangeText={(t) => {
                        setAddressErrors((p) => ({ ...p, phoneNumber: '' }));
                        setAddrPhone(t);
                      }}
                      error={addressErrors.phoneNumber}
                    />

                    <Text style={styles.formLabel}>Alternate Phone (Optional)</Text>
                    <CustomInput
                      placeholder="Enter alternate phone number"
                      value={addrAltPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      onChangeText={setAddrAltPhone}
                    />

                    <Text style={styles.formLabel}>Address Line 1 <Text style={styles.requiredStar}>*</Text></Text>
                    <CustomInput
                      placeholder="House/Flat No., Building Name"
                      value={addrLine1}
                      onChangeText={(t) => {
                        setAddressErrors((p) => ({ ...p, addressLine1: '' }));
                        setAddrLine1(t);
                      }}
                      error={addressErrors.addressLine1}
                    />

                    <Text style={styles.formLabel}>Address Line 2 (Optional)</Text>
                    <CustomInput
                      placeholder="Street, Area"
                      value={addrLine2}
                      onChangeText={setAddrLine2}
                    />

                    <Text style={styles.formLabel}>Landmark (Optional)</Text>
                    <CustomInput
                      placeholder="Near Park, School, etc."
                      value={addrLandmark}
                      onChangeText={setAddrLandmark}
                    />

                    <View style={styles.twoColRow}>
                      <View style={styles.twoCol}>
                        <Text style={styles.formLabel}>City <Text style={styles.requiredStar}>*</Text></Text>
                        <CustomInput
                          placeholder="City"
                          value={addrCity}
                          onChangeText={(t) => {
                            setAddressErrors((p) => ({ ...p, city: '' }));
                            setAddrCity(t);
                          }}
                          error={addressErrors.city}
                        />
                      </View>
                      <View style={styles.twoCol}>
                        <Text style={styles.formLabel}>State <Text style={styles.requiredStar}>*</Text></Text>
                        <CustomInput
                          placeholder="State"
                          value={addrState}
                          onChangeText={(t) => {
                            setAddressErrors((p) => ({ ...p, state: '' }));
                            setAddrState(t);
                          }}
                          error={addressErrors.state}
                        />
                      </View>
                    </View>

                    <Text style={styles.formLabel}>Pincode <Text style={styles.requiredStar}>*</Text></Text>
                    <CustomInput
                      placeholder="Enter 6-digit pincode"
                      value={addrPincode}
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={(t) => {
                        setAddressErrors((p) => ({ ...p, pincode: '' }));
                        setAddrPincode(t);
                      }}
                      error={addressErrors.pincode}
                    />

                    <Text style={styles.formLabel}>Address Type</Text>
                    <View style={styles.addressTypeRow}>
                      {([ADDRESS_TYPE.HOME, ADDRESS_TYPE.OFFICE] as AddressType[]).map((t) => {
                        const isSelected = addrType === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.addressTypeCard, isSelected && styles.addressTypeCardSelected]}
                            activeOpacity={0.85}
                            onPress={() => setAddrType(t)}
                          >
                            <Icon
                              name={t === ADDRESS_TYPE.HOME ? 'home-outline' : 'briefcase-outline'}
                              size={18}
                              color={isSelected ? Colors.warmBrownColor : Colors.grey}
                            />
                            <Text style={[styles.addressTypeCardText, isSelected && styles.addressTypeCardTextSelected]}>
                              {t === ADDRESS_TYPE.OFFICE ? ADDRESS_TYPE.OFFICE : ADDRESS_TYPE.HOME}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.formLabel}>Google Map Link (Optional)</Text>
                    <CustomInput
                      placeholder="https://maps.google.com/..."
                      value={addrGmap}
                      onChangeText={setAddrGmap}
                      autoCapitalize="none"
                    />

                    <View style={styles.formBottomSpacer} />
                  </View>
                )}
              </ScrollView>

              {/* Address Modal Footer Buttons */}
              <View style={styles.addressFooterContainer}>
                {addressMode === ADDRESS_MODE.FORM && (
                  <View style={styles.addressFooterRow}>
                    <CustomButton
                      title="Back to Saved"
                      variant="outline"
                      onPress={() => setAddressMode(ADDRESS_MODE.LIST)}
                      style={styles.addressFooterHalf}
                    />
                    <CustomButton
                      title="Save Address"
                      onPress={async () => {
                        const saved = await saveNewAddress();
                        if (!saved) return;
                        setAddressMode(ADDRESS_MODE.LIST);
                      }}
                      style={styles.addressFooterHalf}
                    />
                  </View>
                )}

                <CustomButton
                  title="Continue"
                  onPress={() => {
                    if (!selectedAddressId) {
                      Alert.alert('Select Address', 'Please select an address to continue');
                      return;
                    }
                    setIsAddressModalVisible(false);
                    
                    if (addressModalMode === ADDRESS_MODAL_MODE.MEASUREMENT) {
                      setAddressMode(ADDRESS_MODE.LIST);
                      setAddressModalMode(ADDRESS_MODAL_MODE.DELIVERY);
                      setIsAddressModalVisible(true);
                    } else {
                      // Delivery address selected, navigate to confirmation
                      handleContinue();
                    }
                  }}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
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
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: Colors.warmBrownColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F9FAFB',
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FBF5EE',
    borderWidth: 1,
    borderColor: Colors.warmBrownColor + '30',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
    letterSpacing: 0.5,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
    letterSpacing: 0.3,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: '13.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
    margin: 2,
    borderRadius: 12,
  },
  dayCellInactive: {
    opacity: 0.25,
  },
  dayCellToday: {
    backgroundColor: '#FEF3E2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
  },
  dayCellSelected: {
    backgroundColor: Colors.warmBrownColor,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.warmBrownColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dayCellUnavailable: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    opacity: 0.6,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  dayTextInactive: {
    color: '#D1D5DB',
  },
  dayTextToday: {
    color: Colors.warmBrownColor,
    fontWeight: '800',
    fontFamily: GILROY_BOLD,
    fontSize: 17,
  },
  dayTextSelected: {
    color: Colors.whiteColor,
    fontWeight: '800',
    fontFamily: GILROY_BOLD,
    fontSize: 17,
  },
  dayTextUnavailable: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
    fontSize: 14,
  },
  availableDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#F9FAFB',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: -8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
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

  slotCard: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
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
  slotCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotCardTitle: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  slotCardSubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  slotCardHint: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_MEDIUM,
  },
  selectedSlotPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  selectedSlotPillText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 18,
    padding: 18,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addressModalCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 18,
    padding: 18,
    height: '86%',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addressKeyboardAvoid: {
    flex: 1,
  },
  addressModalScroll: {
    flex: 1,
    marginTop: 10,
  },
  addressModalScrollContent: {
    paddingBottom: 24,
  },
  addressSectionTitle: {
    marginTop: 6,
    fontSize: 18,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  addressSectionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 12,
  },
  addressCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 14,
    padding: 14,
    backgroundColor: Colors.whiteColor,
  },
  addressCardSelected: {
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    backgroundColor: '#FBF5EE',
  },
  addressCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    flex: 1,
    marginRight: 10,
  },
  addressTypePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
    backgroundColor: '#FBF5EE',
  },
  addressTypePillText: {
    fontSize: 12,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  addressPhone: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_MEDIUM,
  },
  addressLine: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
  },
  addressSelectedText: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
  },
  addNewAddressButton: {
    marginTop: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.warmBrownColor,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewAddressText: {
    fontSize: 14,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  addressForm: {
    marginTop: 12,
  },
  formLabel: {
    marginTop: 12,
    marginLeft: 14,
    marginBottom: 6,
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  requiredStar: {
    color: Colors.errorRed,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  twoCol: {
    flex: 1,
  },
  addressTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  addressTypeCard: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    backgroundColor: Colors.whiteColor,
  },
  addressTypeCardSelected: {
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    backgroundColor: '#FBF5EE',
  },
  addressTypeCardText: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.grey,
    fontFamily: GILROY_SEMIBOLD,
  },
  addressTypeCardTextSelected: {
    color: Colors.warmBrownColor,
  },
  formBottomSpacer: {
    height: 18,
  },
  addressFooterContainer: {
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressFooterHalf: {
    width: '48%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  modalCloseButton: {
    padding: 6,
  },
  modalDateRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalDateLabel: {
    fontSize: 12,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 4,
  },
  modalDateValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
  },
  modalSectionTitle: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  modalSectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  slotsGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotTile: {
    width: '31%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
  },
  slotTileAvailable: {
    borderColor: Colors.successGreen,
  },
  slotTileUnavailable: {
    borderColor: Colors.borderDark,
    backgroundColor: Colors.lightGrey,
    opacity: 0.6,
  },
  slotTileSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.successGreen,
  },
  slotTimeText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    lineHeight: 18,
  },
  slotTimeTextSelected: {
    color: Colors.textPrimary,
  },
  slotBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.successGreen,
  },
  slotBadgeSelected: {
    backgroundColor: Colors.successGreen,
  },
  slotBadgeText: {
    fontSize: 10,
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
    letterSpacing: 0.4,
  },
});

export default DateSelectionScreen;
