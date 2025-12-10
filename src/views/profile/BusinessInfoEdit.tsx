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
  const [ownerName, setOwnerName] = useState(initialBusinessInfo?.ownerName || '');
  const [businessName, setBusinessName] = useState(initialBusinessInfo?.businessName || '');
  const [businessDescription, setBusinessDescription] = useState(initialBusinessInfo?.businessDescription || '');
  const [logoUri, setLogoUri] = useState<string | null>(initialBusinessInfo?.businessLogo || null);
  const [logoBase64, setLogoBase64] = useState<string>(initialBusinessInfo?.businessLogo || '');

  // Contact & Location
  const [email, setEmail] = useState(initialBusinessInfo?.businessEmail || '');
  const [mobileNumber, setMobileNumber] = useState(initialBusinessInfo?.businessPhone || '');
  const [alternateNumber, setAlternateNumber] = useState(initialBusinessInfo?.alternateNumber || '');
  const [shopAddress, setShopAddress] = useState(initialBusinessInfo?.address || '');
  const [googleMapLink, setGoogleMapLink] = useState(initialBusinessInfo?.googleMapLink || '');
  const [gpsLatitude, setGpsLatitude] = useState(initialBusinessInfo?.gpsLatitude || '');
  const [gpsLongitude, setGpsLongitude] = useState(initialBusinessInfo?.gpsLongitude || '');
  const [workingCity, setWorkingCity] = useState(initialBusinessInfo?.city || '');
  const [state, setState] = useState(initialBusinessInfo?.state || '');
  const [country, setCountry] = useState(initialBusinessInfo?.country || '');
  const [zipCode, setZipCode] = useState(initialBusinessInfo?.zipCode || '');
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
  const [yearsOfExperience, setYearsOfExperience] = useState(initialBusinessInfo?.yearsOfExperience || '');
  const [portfolioPhotos, setPortfolioPhotos] = useState(initialBusinessInfo?.portfolioPhotos || '');
  const [certifications, setCertifications] = useState(initialBusinessInfo?.certifications || '');

  // Business Hours
  const [openingTime, setOpeningTime] = useState(initialBusinessInfo?.openingTime || '');
  const [closingTime, setClosingTime] = useState(initialBusinessInfo?.closingTime || '');
  const [weeklyOff, setWeeklyOff] = useState(initialBusinessInfo?.weeklyOff || '');

  // Form state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    // Load services if available
    if (initialBusinessInfo?.serviceTypes) {
      try {
        const services = typeof initialBusinessInfo.serviceTypes === 'string' 
          ? JSON.parse(initialBusinessInfo.serviceTypes)
          : initialBusinessInfo.serviceTypes;
        if (Array.isArray(services)) {
          setSelectedServices(services);
        }
      } catch (e) {
        console.error('Error parsing serviceTypes:', e);
      }
    }

    // Load tailoring categories if available
    if (initialBusinessInfo?.tailoringCategories) {
      try {
        const categories = typeof initialBusinessInfo.tailoringCategories === 'string'
          ? JSON.parse(initialBusinessInfo.tailoringCategories)
          : initialBusinessInfo.tailoringCategories;
        if (Array.isArray(categories)) {
          setSelectedTailoringCategories(categories);
        }
      } catch (e) {
        console.error('Error parsing tailoringCategories:', e);
      }
    }

    // Fetch tailor categories and prices
    if (isTailorRole) {
      fetchTailoringCategories();
    }
  }, [isTailorRole, initialBusinessInfo]);

  // Load tailor item prices after categories are loaded
  useEffect(() => {
    if (isTailorRole && tailoringCategoryObjects.length > 0 && initialBusinessInfo?.id && selectedTailoringCategories.length > 0) {
      loadTailorItemPrices();
    }
  }, [tailoringCategoryObjects.length, initialBusinessInfo?.id, isTailorRole]);

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
    if (!initialBusinessInfo?.id) return;

    try {
      const response = await getTailorItemPrices(initialBusinessInfo.id);
      const data = response.data?.data || response.data?.itemPrices || response.data?.items || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Loaded tailor item prices:', data.length);
        
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
        console.log('✅ Preloaded category details:', Object.keys(detailsMap).length);
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
        openingTime: openingTime.trim(),
        closingTime: closingTime.trim(),
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

      const businessId = initialBusinessInfo?.id || initialBusinessInfo?.businessId;
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
                <TextInput
                  value={openingTime}
                  onChangeText={setOpeningTime}
                  style={styles.input}
                  placeholder="e.g., 10:00 AM"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>Closing Time</Text>
                <TextInput
                  value={closingTime}
                  onChangeText={setClosingTime}
                  style={styles.input}
                  placeholder="e.g., 9:00 PM"
                  placeholderTextColor={Colors.inputPlaceholder}
                />
              </View>
            </View>

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
          </View>
        </ScrollView>

        {/* Bottom actions */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <CustomButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </View>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.whiteColor,
  },
  saveButton: {
    backgroundColor: Colors.warmBrownColor,
  },
});

export default BusinessInfoEdit;
