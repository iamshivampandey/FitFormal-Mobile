import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import CustomButton from '../../components/CustomButton';
import { updateBusinessInfo } from '../../utils/api/businessApi';
import { showSuccessMessage, showErrorMessage } from '../../utils/flashMessage';
import { getTailorItems, getTailorItemPrices, saveTailorItemPricesBatch, saveTailorItemPrice } from '../../utils/api/tailorApi';
// @ts-ignore - react-native-vector-icons types may not be available
import Icon from 'react-native-vector-icons/Ionicons';
import StorageService from '../../services/storage.service';
import { useAuth } from '../../context/AuthContext';

interface CategoryDetail {
  ItemId: number | null;
  FullPrice: string;
  DiscountPrice: string;
  DiscountType: string;
  DiscountValue: string;
  EstimatedDays: string;
  IsAvailable: boolean;
  Notes: string;
}

const SERVICE_OPTIONS = [
  'Custom Tailoring',
  'Alterations',
  'Formal Suits',
  'Wedding Attire',
  'Party Wear',
  'Fabric Sales',
  'Measurements at Home',
  'Express Service',
];

const BusinessInfoEdit: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userRole } = useAuth();

  const { businessInfo: initialBusinessInfo } = route.params || {};
  
  // Determine if tailor role
  const isTailorRole = userRole === 'tailor' || userRole === 'tailor_shop';

  // Basic Information
  const [ownerName, setOwnerName] = useState(initialBusinessInfo?.ownerName || initialBusinessInfo?.OwnerName || '');
  const [businessName, setBusinessName] = useState(initialBusinessInfo?.businessName || initialBusinessInfo?.BusinessName || '');
  const [businessDescription, setBusinessDescription] = useState(initialBusinessInfo?.businessDescription || initialBusinessInfo?.BusinessDescription || '');
  const [logoUri, setLogoUri] = useState<string | null>(initialBusinessInfo?.businessLogo || initialBusinessInfo?.BusinessLogo || null);
  const [logoBase64, setLogoBase64] = useState<string>(initialBusinessInfo?.businessLogo || initialBusinessInfo?.BusinessLogo || '');

  // Contact & Location
  const [email, setEmail] = useState(initialBusinessInfo?.businessEmail || initialBusinessInfo?.Email || '');
  const [mobileNumber, setMobileNumber] = useState(initialBusinessInfo?.businessPhone || initialBusinessInfo?.mobileNumber || '');
  const [alternateNumber, setAlternateNumber] = useState(initialBusinessInfo?.alternateNumber || '');
  const [shopAddress, setShopAddress] = useState(initialBusinessInfo?.address || initialBusinessInfo?.shopAddress || '');
  const [googleMapLink, setGoogleMapLink] = useState(initialBusinessInfo?.googleMapLink || '');
  const [gpsLatitude, setGpsLatitude] = useState(initialBusinessInfo?.gpsLatitude?.toString() || '');
  const [gpsLongitude, setGpsLongitude] = useState(initialBusinessInfo?.gpsLongitude?.toString() || '');
  const [workingCity, setWorkingCity] = useState(initialBusinessInfo?.city || initialBusinessInfo?.workingCity || '');
  const [state, setState] = useState(initialBusinessInfo?.state || '');
  const [country, setCountry] = useState(initialBusinessInfo?.country || '');
  const [zipCode, setZipCode] = useState(initialBusinessInfo?.zipCode?.toString() || '');
  const [gstNumber, setGstNumber] = useState(initialBusinessInfo?.gstNumber || '');
  const [panNumber, setPanNumber] = useState(initialBusinessInfo?.panNumber || '');

  // Services (for Tailor roles)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [tailoringCategoryOptions, setTailoringCategoryOptions] = useState<string[]>([]);
  const [tailoringCategoryObjects, setTailoringCategoryObjects] = useState<any[]>([]);
  const [selectedTailoringCategories, setSelectedTailoringCategories] = useState<string[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, CategoryDetail>>({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Experience
  const [specialization, setSpecialization] = useState(initialBusinessInfo?.specialization || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(initialBusinessInfo?.yearsOfExperience?.toString() || '');
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialBusinessInfo?.portfolioPhotos || '');
  const [certifications, setCertifications] = useState(initialBusinessInfo?.certifications || '');

  // Business Hours
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [weeklyOff, setWeeklyOff] = useState(initialBusinessInfo?.weeklyoff || initialBusinessInfo?.weeklyOff || initialBusinessInfo?.WeeklyOff || '');
  const [showOpeningTimePicker, setShowOpeningTimePicker] = useState(false);
  const [showClosingTimePicker, setShowClosingTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(9);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [pickerIsAM, setPickerIsAM] = useState(true);

  // Form state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to decode HTML entities
  const decodeHtmlEntities = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");
  };

  // Helper function to convert ISO time to readable format
  const formatTimeFromISO = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      
      let hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return '';
    }
  };

  // Helper function to convert readable time to ISO format for backend
  const convertTimeToISO = (timeStr: string): string => {
    if (!timeStr) return '';
    try {
      // Parse format like "10:00 AM" or "9:00 PM"
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return timeStr; // Return as-is if format doesn't match
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      // Create a date with the time (using epoch date as base)
      const date = new Date('1970-01-01T00:00:00.000Z');
      date.setUTCHours(hours, minutes, 0, 0);
      return date.toISOString();
    } catch (e) {
      console.error('Error converting time to ISO:', e);
      return timeStr;
    }
  };

  // Load initial data
  useEffect(() => {
    // Load services if available - handle HTML entities
    if (initialBusinessInfo?.serviceTypes) {
      try {
        let serviceTypesStr = initialBusinessInfo.serviceTypes;
        
        // Decode HTML entities
        serviceTypesStr = decodeHtmlEntities(serviceTypesStr);
        
        // Parse JSON
        const services = typeof serviceTypesStr === 'string' 
          ? JSON.parse(serviceTypesStr)
          : serviceTypesStr;
        
        if (Array.isArray(services)) {
          // Trim whitespace from service names
          const trimmedServices = services.map((s: string) => s.trim()).filter((s: string) => s);
          setSelectedServices(trimmedServices);
          console.log('✅ Loaded services:', trimmedServices);
        }
      } catch (e) {
        console.error('Error parsing serviceTypes:', e, initialBusinessInfo.serviceTypes);
      }
    }

    // Load tailoring categories if available
    // Categories might come from tailorItemPrices array in the response
    if (initialBusinessInfo?.tailoringCategories) {
      try {
        let categoriesStr = initialBusinessInfo.tailoringCategories;
        
        // Decode HTML entities if needed
        categoriesStr = decodeHtmlEntities(categoriesStr);
        
        const categories = typeof categoriesStr === 'string'
          ? JSON.parse(categoriesStr)
          : categoriesStr;
        
        if (Array.isArray(categories)) {
          const trimmedCategories = categories.map((c: string) => c.trim()).filter((c: string) => c);
          setSelectedTailoringCategories(trimmedCategories);
          console.log('✅ Loaded tailoring categories from tailoringCategories field:', trimmedCategories);
        }
      } catch (e) {
        console.error('Error parsing tailoringCategories:', e, initialBusinessInfo.tailoringCategories);
      }
    }
    
    // Also check if categories can be extracted from tailorItemPrices
    if (initialBusinessInfo?.tailorItemPrices && Array.isArray(initialBusinessInfo.tailorItemPrices)) {
      try {
        // Categories will be loaded when tailorItemPrices are processed in loadTailorItemPrices
        console.log('✅ Found tailorItemPrices array, will load categories from there');
      } catch (e) {
        console.error('Error processing tailorItemPrices:', e);
      }
    }

    // Format and load times
    if (initialBusinessInfo?.openingTime) {
      const formattedTime = formatTimeFromISO(initialBusinessInfo.openingTime);
      setOpeningTime(formattedTime);
      console.log('✅ Loaded opening time:', formattedTime);
    }
    
    if (initialBusinessInfo?.closingTime) {
      const formattedTime = formatTimeFromISO(initialBusinessInfo.closingTime);
      setClosingTime(formattedTime);
      console.log('✅ Loaded closing time:', formattedTime);
    }

    // Fetch tailor categories and prices
    if (isTailorRole) {
      fetchTailoringCategories();
    }
  }, [isTailorRole, initialBusinessInfo]);

  // Load tailor item prices after categories are loaded
  useEffect(() => {
    if (isTailorRole && tailoringCategoryObjects.length > 0) {
      const businessId = initialBusinessInfo?.id || initialBusinessInfo?.businessId;
      if (businessId) {
        // Load prices if we have selected categories, or if we have tailorItemPrices in response
        if (selectedTailoringCategories.length > 0 || initialBusinessInfo?.tailorItemPrices) {
          loadTailorItemPrices();
        }
      }
    }
  }, [tailoringCategoryObjects.length, initialBusinessInfo?.id, initialBusinessInfo?.businessId, isTailorRole]);

  const fetchTailoringCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getTailorItems();
      const data = response.data;
      
      const categories = data?.data || data?.items || data?.categories || data || [];
      
      if (Array.isArray(categories) && categories.length > 0) {
        setTailoringCategoryObjects(categories);
        const categoryNames = categories.map((cat: any) => {
          if (typeof cat === 'string') return cat;
          return cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
        });
        setTailoringCategoryOptions(categoryNames);
        console.log('✅ Loaded tailoring categories:', categoryNames.length);
      }
    } catch (error: any) {
      console.error('Error fetching tailoring categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTailorItemPrices = async () => {
    const businessId = initialBusinessInfo?.id || initialBusinessInfo?.businessId;
    if (!businessId) return;

    try {
      // First check if we have tailorItemPrices in the initial response
      if (initialBusinessInfo?.tailorItemPrices && Array.isArray(initialBusinessInfo.tailorItemPrices)) {
        const data = initialBusinessInfo.tailorItemPrices;
        console.log('✅ Using tailorItemPrices from initial response:', data.length);
        
        // Map prices to category details
        const detailsMap: Record<string, CategoryDetail> = {};
        const categoriesToSelect: string[] = [];
        
        data.forEach((itemPrice: any) => {
          // Find category name from ItemId
          const categoryObj = tailoringCategoryObjects.find((cat) => {
            const catId = cat.ItemId || cat.itemId || cat.id;
            return catId === itemPrice.ItemId || catId === itemPrice.itemId;
          });
          
          if (categoryObj) {
            const categoryName = categoryObj.Name || categoryObj.name || categoryObj.categoryName || categoryObj.itemName || String(categoryObj);
            
            detailsMap[categoryName] = {
              ItemId: itemPrice.ItemId || itemPrice.itemId || categoryObj.ItemId || categoryObj.itemId || categoryObj.id || null,
              FullPrice: itemPrice.FullPrice?.toString() || itemPrice.fullPrice?.toString() || '',
              DiscountPrice: itemPrice.DiscountPrice?.toString() || itemPrice.discountPrice?.toString() || '',
              DiscountType: itemPrice.DiscountType || itemPrice.discountType || '',
              DiscountValue: itemPrice.DiscountValue?.toString() || itemPrice.discountValue?.toString() || '',
              EstimatedDays: itemPrice.EstimatedDays?.toString() || itemPrice.estimatedDays?.toString() || '',
              IsAvailable: itemPrice.IsAvailable !== false && itemPrice.isAvailable !== false,
              Notes: itemPrice.Notes || itemPrice.notes || '',
            };
            
            if (!categoriesToSelect.includes(categoryName)) {
              categoriesToSelect.push(categoryName);
            }
          }
        });
        
        // Update selected categories if not already set
        if (categoriesToSelect.length > 0 && selectedTailoringCategories.length === 0) {
          setSelectedTailoringCategories(categoriesToSelect);
        }
        
        setCategoryDetails(detailsMap);
        console.log('✅ Preloaded category details from response:', Object.keys(detailsMap).length);
        return;
      }
      
      // Fallback: fetch from API
      const response = await getTailorItemPrices(businessId);
      const data = response.data?.data || response.data?.itemPrices || response.data?.items || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Loaded tailor item prices from API:', data.length);
        
        // Map prices to category details
        const detailsMap: Record<string, CategoryDetail> = {};
        
        data.forEach((itemPrice: any) => {
          // Find category name from ItemId
          const categoryObj = tailoringCategoryObjects.find((cat) => {
            const catId = cat.ItemId || cat.itemId || cat.id;
            return catId === itemPrice.ItemId || catId === itemPrice.itemId;
          });
          
          if (categoryObj) {
            const categoryName = categoryObj.Name || categoryObj.name || categoryObj.categoryName || categoryObj.itemName || String(categoryObj);
            
            detailsMap[categoryName] = {
              ItemId: itemPrice.ItemId || itemPrice.itemId || categoryObj.ItemId || categoryObj.itemId || categoryObj.id || null,
              FullPrice: itemPrice.FullPrice?.toString() || itemPrice.fullPrice?.toString() || '',
              DiscountPrice: itemPrice.DiscountPrice?.toString() || itemPrice.discountPrice?.toString() || '',
              DiscountType: itemPrice.DiscountType || itemPrice.discountType || '',
              DiscountValue: itemPrice.DiscountValue?.toString() || itemPrice.discountValue?.toString() || '',
              EstimatedDays: itemPrice.EstimatedDays?.toString() || itemPrice.estimatedDays?.toString() || '',
              IsAvailable: itemPrice.IsAvailable !== false && itemPrice.isAvailable !== false,
              Notes: itemPrice.Notes || itemPrice.notes || '',
            };
            
            // Ensure category is selected
            if (!selectedTailoringCategories.includes(categoryName)) {
              setSelectedTailoringCategories((prev) => [...prev, categoryName]);
            }
          }
        });
        
        setCategoryDetails(detailsMap);
        console.log('✅ Preloaded category details from API:', Object.keys(detailsMap).length);
      }
    } catch (error: any) {
      console.error('Error loading tailor item prices:', error);
      // Don't show error - it's okay if there are no prices yet
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleCategoryToggle = (category: string) => {
    const isSelected = selectedTailoringCategories.includes(category);
    
    if (isSelected) {
      setSelectedTailoringCategories((prev) => prev.filter((c) => c !== category));
      setCategoryDetails((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
      setExpandedCategories((prev) => {
        const updated = new Set(prev);
        updated.delete(category);
        return updated;
      });
    } else {
      setSelectedTailoringCategories((prev) => [...prev, category]);
      
      const categoryObj = tailoringCategoryObjects.find((cat) => {
        const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
        return catName === category;
      });
      
      setCategoryDetails((prev) => ({
        ...prev,
        [category]: {
          ItemId: categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
          FullPrice: prev[category]?.FullPrice || '',
          DiscountPrice: prev[category]?.DiscountPrice || '',
          DiscountType: prev[category]?.DiscountType || '',
          DiscountValue: prev[category]?.DiscountValue || '',
          EstimatedDays: prev[category]?.EstimatedDays || '',
          IsAvailable: prev[category]?.IsAvailable !== false,
          Notes: prev[category]?.Notes || '',
        },
      }));
      setExpandedCategories((prev) => new Set(prev).add(category));
    }
  };

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(category)) {
        updated.delete(category);
      } else {
        updated.add(category);
      }
      return updated;
    });
  };

  const handleCategoryDetailChange = (category: string, field: keyof CategoryDetail, value: any) => {
    setCategoryDetails((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  // Time picker handlers
  const handleTimeSelect = (hours: number, minutes: number, isOpening: boolean) => {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${minutesStr} ${ampm}`;
    
    if (isOpening) {
      setOpeningTime(timeStr);
      setShowOpeningTimePicker(false);
    } else {
      setClosingTime(timeStr);
      setShowClosingTimePicker(false);
    }
  };

  // Initialize picker values when opening
  useEffect(() => {
    if (showOpeningTimePicker || showClosingTimePicker) {
      const timeStr = showOpeningTimePicker ? openingTime : closingTime;
      if (timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hour = parseInt(match[1], 10);
          const minute = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          
          setPickerIsAM(ampm === 'AM');
          if (ampm === 'PM' && hour !== 12) hour -= 12;
          if (ampm === 'AM' && hour === 12) hour = 12;
          setPickerHour(hour);
          setPickerMinute(minute);
        }
      }
    }
  }, [showOpeningTimePicker, showClosingTimePicker]);

  // Simple time picker component
  const renderTimePicker = (isOpening: boolean) => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i).filter((m) => m % 5 === 0);

    return (
      <Modal
        visible={isOpening ? showOpeningTimePicker : showClosingTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (isOpening) setShowOpeningTimePicker(false);
          else setShowClosingTimePicker(false);
        }}
      >
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                Select {isOpening ? 'Opening' : 'Closing'} Time
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (isOpening) setShowOpeningTimePicker(false);
                  else setShowClosingTimePicker(false);
                }}
              >
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContent}>
              {/* Hour Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView 
                  style={styles.pickerScroll} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setPickerHour(hour)}
                      style={[
                        styles.pickerItem,
                        pickerHour === hour && styles.pickerItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView 
                  style={styles.pickerScroll} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setPickerMinute(minute)}
                      style={[
                        styles.pickerItem,
                        pickerMinute === minute && styles.pickerItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {minute < 10 ? `0${minute}` : minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM Toggle */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Period</Text>
                <View style={styles.ampmContainer}>
                  <TouchableOpacity
                    onPress={() => setPickerIsAM(true)}
                    style={[
                      styles.ampmButton,
                      pickerIsAM && styles.ampmButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ampmButtonText,
                        pickerIsAM && styles.ampmButtonTextSelected,
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPickerIsAM(false)}
                    style={[
                      styles.ampmButton,
                      !pickerIsAM && styles.ampmButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ampmButtonText,
                        !pickerIsAM && styles.ampmButtonTextSelected,
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.timePickerFooter}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={() => {
                  if (isOpening) setShowOpeningTimePicker(false);
                  else setShowClosingTimePicker(false);
                }}
              >
                <Text style={styles.timePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={() => {
                  const hours24 = pickerIsAM 
                    ? (pickerHour === 12 ? 0 : pickerHour) 
                    : (pickerHour === 12 ? 12 : pickerHour + 12);
                  handleTimeSelect(hours24, pickerMinute, isOpening);
                }}
              >
                <Text style={styles.timePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleLogoPick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.didCancel) return;
        
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick image');
          return;
        }
        
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setLogoUri(asset.uri || null);
          setLogoBase64(asset.uri || '');
        }
      }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }
    if (!workingCity.trim()) {
      newErrors.workingCity = 'Working city is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (isTailorRole) {
      if (selectedServices.length === 0) {
        newErrors.serviceTypes = 'Please select at least one service';
      }
      if (selectedTailoringCategories.length === 0) {
        newErrors.tailoringCategories = 'Please select at least one tailoring category';
      }
      
      selectedTailoringCategories.forEach((category) => {
        const details = categoryDetails[category];
        if (!details?.FullPrice || details.FullPrice === '') {
          newErrors[`category_${category}_FullPrice`] = `${category}: Full Price is required`;
        }
        if (!details?.EstimatedDays || details.EstimatedDays === '') {
          newErrors[`category_${category}_EstimatedDays`] = `${category}: Estimated Days is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorMessage('Validation Error', 'Please fix the errors before continuing');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        businessName: businessName.trim(),
        businessEmail: email.trim() || '',
        businessPhone: mobileNumber.trim(),
        gstNumber: gstNumber.trim() || '',
        panNumber: panNumber.trim() || '',
        address: shopAddress.trim() || '',
        city: workingCity.trim() || '',
        state: state.trim() || '',
        country: country.trim() || '',
        zipCode: zipCode.trim() || '',
        businessType: userRole || '',
        ownerName: ownerName.trim(),
        businessDescription: businessDescription.trim(),
        alternateNumber: alternateNumber.trim(),
        googleMapLink: googleMapLink.trim(),
        gpsLatitude: gpsLatitude.trim(),
        gpsLongitude: gpsLongitude.trim(),
        openingTime: convertTimeToISO(openingTime.trim()),
        closingTime: convertTimeToISO(closingTime.trim()),
        weeklyOff: weeklyOff.trim(),
        businessLogo: logoBase64 || logoUri || '',
        specialization: specialization.trim(),
        yearsOfExperience: yearsOfExperience.trim(),
        portfolioPhotos: portfolioPhotos.trim(),
        certifications: certifications.trim(),
      };

      if (isTailorRole) {
        payload.serviceTypes = JSON.stringify(selectedServices);
        payload.tailoringCategories = JSON.stringify(selectedTailoringCategories);
      }
console.log('initialBusinessInfo', initialBusinessInfo);
      const businessId = initialBusinessInfo?.id || initialBusinessInfo?.businessId || initialBusinessInfo?.BusinessId;
      const response = await updateBusinessInfo(payload, businessId);
      console.log('✅ Business info updated:', response?.data);

      // Save tailor item prices if tailor role
      if (isTailorRole && businessId && selectedTailoringCategories.length > 0) {
        try {
          const itemPricesData = selectedTailoringCategories.map((categoryName) => {
            const details = categoryDetails[categoryName] || {};
            const categoryObj = tailoringCategoryObjects.find((cat) => {
              const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
              return catName === categoryName;
            });
            
            return {
              BusinessId: businessId,
              ItemId: details.ItemId || categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
              FullPrice: details.FullPrice ? parseFloat(details.FullPrice) : null,
              DiscountPrice: details.DiscountPrice ? parseFloat(details.DiscountPrice) : null,
              DiscountType: details.DiscountType || null,
              DiscountValue: details.DiscountValue ? parseFloat(details.DiscountValue) : null,
              EstimatedDays: details.EstimatedDays ? parseInt(details.EstimatedDays) : null,
              IsAvailable: details.IsAvailable !== false,
              Notes: details.Notes || null,
            };
          });

          // Try batch endpoint first
          try {
            await saveTailorItemPricesBatch({
              businessId: businessId,
              itemPrices: itemPricesData,
            });
            console.log('✅ Tailor item prices saved');
          } catch (batchError) {
            // Fallback to individual saves
            await Promise.allSettled(
              itemPricesData.map((itemPrice: any) => saveTailorItemPrice(itemPrice))
            );
            console.log('✅ Tailor item prices saved (individual)');
          }
        } catch (priceError) {
          console.error('Error saving tailor item prices:', priceError);
          // Don't fail the update if prices fail
        }
      }

      showSuccessMessage('Success', 'Business information updated successfully!');
      
      // Navigate back and refresh
      navigation.goBack();
    } catch (error: any) {
      console.error('❌ Update failed:', error?.response?.data || error?.message || error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to update business information. Please try again.';
      showErrorMessage('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={[styles.header, { paddingTop: 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Business Info</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.fieldLabel}>Business Name *</Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              style={[styles.input, errors.businessName && styles.inputError]}
              placeholder="Enter business name"
              placeholderTextColor={Colors.inputPlaceholder}
            />
            {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}

            <Text style={styles.fieldLabel}>Owner Name</Text>
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              style={styles.input}
              placeholder="Enter owner name"
              placeholderTextColor={Colors.inputPlaceholder}
            />

            <Text style={styles.fieldLabel}>Business Logo</Text>
            {logoUri ? (
              <View style={styles.logoPreviewContainer}>
                <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                <TouchableOpacity onPress={() => { setLogoUri(null); setLogoBase64(''); }} style={styles.removeLogoBtn}>
                  <Text style={styles.removeLogoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleLogoPick} style={styles.logoPickerBtn}>
                <Icon name="image-outline" size={24} color={Colors.warmBrownColor} />
                <Text style={styles.logoPickerText}>Choose logo image</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.fieldLabel}>Business Description</Text>
            <TextInput
              value={businessDescription}
              onChangeText={setBusinessDescription}
              style={[styles.input, styles.textArea]}
              placeholder="Describe your business"
              placeholderTextColor={Colors.inputPlaceholder}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Contact & Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact & Location</Text>
            
            <Text style={styles.fieldLabel}>Business Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Business email"
              keyboardType="email-address"
              placeholderTextColor={Colors.inputPlaceholder}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.fieldLabel}>Primary Mobile Number *</Text>
            <TextInput
              value={mobileNumber}
              onChangeText={setMobileNumber}
              style={[styles.input, errors.mobileNumber && styles.inputError]}
              placeholder="Main phone number"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.inputPlaceholder}
              maxLength={10}
            />
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

            <Text style={styles.fieldLabel}>Alternate Number</Text>
            <TextInput
              value={alternateNumber}
              onChangeText={setAlternateNumber}
              style={styles.input}
              placeholder="Alternate contact number"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.inputPlaceholder}
              maxLength={10}
            />

            <Text style={styles.fieldLabel}>Working City *</Text>
            <TextInput
              value={workingCity}
              onChangeText={setWorkingCity}
              style={[styles.input, errors.workingCity && styles.inputError]}
              placeholder="City where you operate"
              placeholderTextColor={Colors.inputPlaceholder}
            />
            {errors.workingCity && <Text style={styles.errorText}>{errors.workingCity}</Text>}

            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              value={shopAddress}
              onChangeText={setShopAddress}
              style={[styles.input, styles.textArea]}
              placeholder="Shop/business address"
              placeholderTextColor={Colors.inputPlaceholder}
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>ZIP Code</Text>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  style={styles.input}
                  placeholder="ZIP code"
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              style={styles.input}
              placeholder="Country"
              placeholderTextColor={Colors.inputPlaceholder}
            />

            <Text style={styles.fieldLabel}>Google Maps Link</Text>
            <TextInput
              value={googleMapLink}
              onChangeText={setGoogleMapLink}
              style={styles.input}
              placeholder="Google Maps location link"
              placeholderTextColor={Colors.inputPlaceholder}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>GPS Latitude</Text>
                <TextInput
                  value={gpsLatitude}
                  onChangeText={setGpsLatitude}
                  style={styles.input}
                  placeholder="Latitude"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>GPS Longitude</Text>
                <TextInput
                  value={gpsLongitude}
                  onChangeText={setGpsLongitude}
                  style={styles.input}
                  placeholder="Longitude"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>GST Number</Text>
                <TextInput
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  style={styles.input}
                  placeholder="GST number"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>PAN Number</Text>
                <TextInput
                  value={panNumber}
                  onChangeText={setPanNumber}
                  style={styles.input}
                  placeholder="PAN number"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
            </View>
          </View>

          {/* Services & Categories (for Tailor roles) */}
          {isTailorRole && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services & Categories</Text>
              
              <Text style={styles.fieldLabel}>Service Types *</Text>
              <View style={styles.chipsContainer}>
                {SERVICE_OPTIONS.map((service) => (
                  <TouchableOpacity
                    key={service}
                    onPress={() => handleServiceToggle(service)}
                    style={[
                      styles.chip,
                      selectedServices.includes(service) && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedServices.includes(service) && styles.chipTextSelected,
                      ]}
                    >
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.serviceTypes && <Text style={styles.errorText}>{errors.serviceTypes}</Text>}

              <Text style={styles.fieldLabel}>Tailoring Categories *</Text>
              {loadingCategories ? (
                <Text style={styles.loadingText}>Loading categories...</Text>
              ) : (
                <View style={styles.chipsContainer}>
                  {tailoringCategoryOptions.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => handleCategoryToggle(category)}
                      style={[
                        styles.chip,
                        selectedTailoringCategories.includes(category) && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedTailoringCategories.includes(category) && styles.chipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.tailoringCategories && <Text style={styles.errorText}>{errors.tailoringCategories}</Text>}

              {/* Category Details */}
              {selectedTailoringCategories.length > 0 && (
                <View style={styles.categoryDetailsContainer}>
                  <Text style={styles.fieldLabel}>Category Details *</Text>
                  {[...selectedTailoringCategories].reverse().map((categoryName) => {
                    const details = categoryDetails[categoryName] || {};
                    const isExpanded = expandedCategories.has(categoryName);
                    
                    return (
                      <View key={categoryName} style={styles.categoryCard}>
                        <View style={styles.categoryCardHeader}>
                          <Text style={styles.categoryCardTitle}>{categoryName}</Text>
                          <TouchableOpacity
                            onPress={() => toggleCategoryExpand(categoryName)}
                            style={styles.expandButton}
                          >
                            <Text style={styles.expandButtonText}>
                              {isExpanded ? 'Hide detail' : 'Show detail'}
                            </Text>
                            <Icon
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color={Colors.warmBrownColor}
                            />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Always show essential fields */}
                        <View style={styles.row}>
                          <View style={styles.rowItem}>
                            <Text style={styles.detailLabel}>Full Price *</Text>
                            <TextInput
                              value={details.FullPrice || ''}
                              onChangeText={(value) => handleCategoryDetailChange(categoryName, 'FullPrice', value)}
                              style={[
                                styles.input,
                                errors[`category_${categoryName}_FullPrice`] && styles.inputError,
                              ]}
                              placeholder="Enter full price"
                              keyboardType="decimal-pad"
                              placeholderTextColor={Colors.inputPlaceholder}
                            />
                            {errors[`category_${categoryName}_FullPrice`] && (
                              <Text style={styles.errorText}>{errors[`category_${categoryName}_FullPrice`]}</Text>
                            )}
                          </View>
                          <View style={styles.rowItem}>
                            <Text style={styles.detailLabel}>Estimated Days *</Text>
                            <TextInput
                              value={details.EstimatedDays || ''}
                              onChangeText={(value) => handleCategoryDetailChange(categoryName, 'EstimatedDays', value)}
                              style={[
                                styles.input,
                                errors[`category_${categoryName}_EstimatedDays`] && styles.inputError,
                              ]}
                              placeholder="Enter estimated days"
                              keyboardType="number-pad"
                              placeholderTextColor={Colors.inputPlaceholder}
                            />
                            {errors[`category_${categoryName}_EstimatedDays`] && (
                              <Text style={styles.errorText}>{errors[`category_${categoryName}_EstimatedDays`]}</Text>
                            )}
                          </View>
                        </View>

                        {/* Show additional fields only when expanded */}
                        {isExpanded && (
                          <>
                            <View style={styles.row}>
                              <View style={styles.rowItem}>
                                <Text style={styles.detailLabel}>Discount Price</Text>
                                <TextInput
                                  value={details.DiscountPrice || ''}
                                  onChangeText={(value) => handleCategoryDetailChange(categoryName, 'DiscountPrice', value)}
                                  style={styles.input}
                                  placeholder="Enter discount price"
                                  keyboardType="decimal-pad"
                                  placeholderTextColor={Colors.inputPlaceholder}
                                />
                              </View>
                              <View style={styles.rowItem}>
                                <Text style={styles.detailLabel}>Discount Type</Text>
                                <TextInput
                                  value={details.DiscountType || ''}
                                  onChangeText={(value) => handleCategoryDetailChange(categoryName, 'DiscountType', value)}
                                  style={styles.input}
                                  placeholder="Percentage or Fixed"
                                  placeholderTextColor={Colors.inputPlaceholder}
                                />
                              </View>
                            </View>

                            <View style={styles.row}>
                              <View style={styles.rowItem}>
                                <Text style={styles.detailLabel}>Discount Value</Text>
                                <TextInput
                                  value={details.DiscountValue || ''}
                                  onChangeText={(value) => handleCategoryDetailChange(categoryName, 'DiscountValue', value)}
                                  style={styles.input}
                                  placeholder="Enter discount value"
                                  keyboardType="decimal-pad"
                                  placeholderTextColor={Colors.inputPlaceholder}
                                />
                              </View>
                              <View style={styles.rowItem}>
                                <Text style={styles.detailLabel}>Available</Text>
                                <View style={styles.switchContainer}>
                                  <Switch
                                    value={details.IsAvailable !== false}
                                    onValueChange={(value) => handleCategoryDetailChange(categoryName, 'IsAvailable', value)}
                                    trackColor={{ false: Colors.borderMedium, true: Colors.warmBrownColor }}
                                    thumbColor={Colors.whiteColor}
                                  />
                                </View>
                              </View>
                            </View>

                            <Text style={styles.detailLabel}>Notes</Text>
                            <TextInput
                              value={details.Notes || ''}
                              onChangeText={(value) => handleCategoryDetailChange(categoryName, 'Notes', value)}
                              style={[styles.input, styles.textArea]}
                              placeholder="Additional notes about this category"
                              placeholderTextColor={Colors.inputPlaceholder}
                              multiline
                              numberOfLines={2}
                            />
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Business Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Hours</Text>
            
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>Opening Time</Text>
                <TouchableOpacity
                  onPress={() => setShowOpeningTimePicker(true)}
                  style={styles.timeInputButton}
                >
                  <Text style={[styles.timeInputText, !openingTime && styles.timeInputPlaceholder]}>
                    {openingTime || 'e.g., 10:00 AM'}
                  </Text>
                  <Icon name="time-outline" size={20} color={Colors.warmBrownColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>Closing Time</Text>
                <TouchableOpacity
                  onPress={() => setShowClosingTimePicker(true)}
                  style={styles.timeInputButton}
                >
                  <Text style={[styles.timeInputText, !closingTime && styles.timeInputPlaceholder]}>
                    {closingTime || 'e.g., 9:00 PM'}
                  </Text>
                  <Icon name="time-outline" size={20} color={Colors.warmBrownColor} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Time Pickers */}
            {renderTimePicker(true)}
            {renderTimePicker(false)}

            <Text style={styles.fieldLabel}>Weekly Off</Text>
            <TextInput
              value={weeklyOff}
              onChangeText={setWeeklyOff}
              style={styles.input}
              placeholder="e.g., Sunday"
              placeholderTextColor={Colors.inputPlaceholder}
            />
          </View>

          {/* Experience (for all business types) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience & Portfolio</Text>
            
            <Text style={styles.fieldLabel}>Specialization</Text>
            <TextInput
              value={specialization}
              onChangeText={setSpecialization}
              style={styles.input}
              placeholder="e.g., Wedding Suits, Corporate Wear"
              placeholderTextColor={Colors.inputPlaceholder}
            />

            <Text style={styles.fieldLabel}>Years of Experience</Text>
            <TextInput
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              style={styles.input}
              placeholder="Total years in business"
              keyboardType="number-pad"
              placeholderTextColor={Colors.inputPlaceholder}
            />

            <Text style={styles.fieldLabel}>Portfolio Photos (links)</Text>
            <TextInput
              value={portfolioPhotos}
              onChangeText={setPortfolioPhotos}
              style={[styles.input, styles.textArea]}
              placeholder="Links to your work/gallery"
              placeholderTextColor={Colors.inputPlaceholder}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Certifications / Awards</Text>
            <TextInput
              value={certifications}
              onChangeText={setCertifications}
              style={[styles.input, styles.textArea]}
              placeholder="List certifications or awards"
              placeholderTextColor={Colors.inputPlaceholder}
              multiline
              numberOfLines={3}
            />
              <View style={styles.saveButtonContainer}>
            <CustomButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
              size="large"
            />
          </View>
          </View>

        
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputBackground,
  },
  backButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Padding at bottom for comfortable scrolling
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 10,
  },
  inputError: {
    borderColor: Colors.errorRed,
    backgroundColor: '#fff5f5',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: Colors.errorRed,
    fontFamily: GILROY_REGULAR,
    marginTop: -8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    backgroundColor: Colors.whiteColor,
  },
  chipSelected: {
    backgroundColor: Colors.warmBrownColor,
  },
  chipText: {
    fontSize: 13,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  chipTextSelected: {
    color: Colors.whiteColor,
  },
  categoryDetailsContainer: {
    marginTop: 16,
  },
  categoryCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryCardTitle: {
    fontSize: 15,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
    flex: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expandButtonText: {
    fontSize: 13,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginBottom: 4,
  },
  switchContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    textAlign: 'center',
    padding: 16,
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeLogoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.errorRed,
    borderRadius: 8,
  },
  removeLogoText: {
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
    fontSize: 13,
  },
  logoPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    borderStyle: 'dashed',
    backgroundColor: Colors.inputBackground,
    marginBottom: 10,
  },
  logoPickerText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  saveButtonContainer: {
    marginTop: 32,
    marginBottom: 70,
    paddingHorizontal: 0,
  },
  saveButton: {
    backgroundColor: Colors.warmBrownColor,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
  },
  timeInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  timeInputText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
    flex: 1,
  },
  timeInputPlaceholder: {
    color: Colors.inputPlaceholder,
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: Colors.whiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  timePickerContent: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginBottom: 10,
  },
  pickerScroll: {
    maxHeight: 200,
    width: '100%',
  },
  pickerScrollContent: {
    alignItems: 'center',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: Colors.warmBrownColor,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
  },
  pickerItemTextSelected: {
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  ampmContainer: {
    gap: 8,
  },
  ampmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.whiteColor,
    alignItems: 'center',
  },
  ampmButtonSelected: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  ampmButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  ampmButtonTextSelected: {
    color: Colors.whiteColor,
  },
  timePickerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 10,
  },
  timePickerCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.whiteColor,
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  timePickerConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: GILROY_SEMIBOLD,
  },
});

export default BusinessInfoEdit;
