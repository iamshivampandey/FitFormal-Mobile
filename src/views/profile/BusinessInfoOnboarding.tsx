import React, { useMemo, useState, useEffect } from 'react';
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
import { signUpWithEmailAndPassword } from '../../utils/authApi';
import { showSuccessMessage, showErrorMessage } from '../../utils/flashMessage';
import { getTailorItems, saveTailorItemPricesBatch, saveTailorItemPrice } from '../../utils/api/tailorApi';
// @ts-ignore - react-native-vector-icons types may not be available
import Icon from 'react-native-vector-icons/Ionicons';

type BusinessRole = 'shop' | 'tailor' | 'tailor_shop';

interface RouteParams {
  role: BusinessRole;
  signUpData?: {
    email?: string;
    name?: string;
    userName?: string;
    age?: string;
    userRole?: BusinessRole | 'customer';
    phoneNumber?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
}

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

const steps = [
  {
    key: 'owner',
    title: 'Owner & Business Basics',
    subtitle: 'Tell us who you are and what your business is called.',
  },
  {
    key: 'contact',
    title: 'Contact & Location',
    subtitle: 'How can customers reach you and where do you operate?',
  },
  {
    key: 'services',
    title: 'Services & Experience',
    subtitle: 'Share what you offer and your experience.',
  },
  {
    key: 'branding',
    title: 'Brand & Schedule',
    subtitle: 'Help customers recognise your brand and know when you are open.',
  },
];

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

// Note: Categories are now fetched from API only
// Use the SQL script in database/tailor_items_insert.sql to populate the database

const BusinessInfoOnboarding: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { role, signUpData } = (route.params || {}) as RouteParams;
  const isTailorRole = role === 'tailor' || role === 'tailor_shop';

  // Basic Information
  const [ownerName, setOwnerName] = useState(signUpData?.name || '');
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Contact & Location
  const [email, setEmail] = useState(signUpData?.email || '');
  const [mobileNumber, setMobileNumber] = useState(signUpData?.phoneNumber || '');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState('');
  const [gpsLongitude, setGpsLongitude] = useState('');
  const [workingCity, setWorkingCity] = useState('');

  // Services (for Tailor roles)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [tailoringCategoryOptions, setTailoringCategoryOptions] = useState<string[]>([]);
  const [tailoringCategoryObjects, setTailoringCategoryObjects] = useState<any[]>([]);
  const [selectedTailoringCategories, setSelectedTailoringCategories] = useState<string[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, CategoryDetail>>({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [initiallyLoadedCategories, setInitiallyLoadedCategories] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Experience
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState('');
  const [certifications, setCertifications] = useState('');

  // Business Hours
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [weeklyOff, setWeeklyOff] = useState('');

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const progress = useMemo(() => (totalSteps > 0 ? (currentStep + 1) / totalSteps : 0), [currentStep]);
  const isLastStep = currentStep === totalSteps - 1;

  // Fetch tailoring categories for tailor roles
  useEffect(() => {
    if (isTailorRole) {
      fetchTailoringCategories();
    }
  }, [isTailorRole]);

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
        console.log('✅ Loaded tailoring categories from API:', categoryNames.length);
      } else {
        console.warn('⚠️ No categories returned from API, but continuing without fallback');
        setTailoringCategoryOptions([]);
        setTailoringCategoryObjects([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching tailoring categories:', error);
      // Don't use fallback - let user know API is unavailable
      setTailoringCategoryOptions([]);
      setTailoringCategoryObjects([]);
      // Optionally show error message to user
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        showErrorMessage('Error', 'Failed to load tailoring categories. Please try again later.');
      }
    } finally {
      setLoadingCategories(false);
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
      // Remove category
      setSelectedTailoringCategories((prev) => prev.filter((c) => c !== category));
      setCategoryDetails((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
      // Remove from expanded set
      setExpandedCategories((prev) => {
        const updated = new Set(prev);
        updated.delete(category);
        return updated;
      });
    } else {
      // Add category
      setSelectedTailoringCategories((prev) => [...prev, category]);
      
      // Find ItemId for this category
      const categoryObj = tailoringCategoryObjects.find((cat) => {
        const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
        return catName === category;
      });
      
      setCategoryDetails((prev) => ({
        ...prev,
        [category]: {
          ItemId: categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
          FullPrice: '',
          DiscountPrice: '',
          DiscountType: '',
          DiscountValue: '',
          EstimatedDays: '',
          IsAvailable: true,
          Notes: '',
        },
      }));
      // Auto-expand when adding a new category
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
          // For now, store URI. In production, you'd upload to server and get URL
          setLogoBase64(asset.uri || '');
        }
      }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
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

    // Tailor-specific validation
    if (isTailorRole) {
      if (selectedServices.length === 0) {
        newErrors.serviceTypes = 'Please select at least one service';
      }
      if (selectedTailoringCategories.length === 0) {
        newErrors.tailoringCategories = 'Please select at least one tailoring category';
      }
      
      // Validate category details
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

    // GPS validation
    if (gpsLatitude && (isNaN(Number(gpsLatitude)) || Number(gpsLatitude) < -90 || Number(gpsLatitude) > 90)) {
      newErrors.gpsLatitude = 'Latitude must be between -90 and 90';
    }
    if (gpsLongitude && (isNaN(Number(gpsLongitude)) || Number(gpsLongitude) < -180 || Number(gpsLongitude) > 180)) {
      newErrors.gpsLongitude = 'Longitude must be between -180 and 180';
    }

    // Years of experience validation
    if (yearsOfExperience && (isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)) {
      newErrors.yearsOfExperience = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorMessage('Validation Error', 'Please fix the errors before continuing');
      return;
    }

    setSaving(true);
    try {
      // Prepare business info payload
      const businessInfo: any = {
        businessName: businessName.trim(),
        businessEmail: email.trim() || signUpData?.email || '',
        businessPhone: mobileNumber.trim(),
        gstNumber: '',
        panNumber: '',
        address: shopAddress.trim() || '',
        city: workingCity.trim() || '',
        state: '',
        country: '',
        zipCode: '',
        businessType: role || '',
      };

      // Add tailor-specific data
      if (isTailorRole) {
        businessInfo.serviceTypes = JSON.stringify(selectedServices);
        businessInfo.tailoringCategories = JSON.stringify(selectedTailoringCategories);
        businessInfo.specialization = specialization.trim();
        businessInfo.yearsOfExperience = yearsOfExperience.trim();
        businessInfo.portfolioPhotos = portfolioPhotos.trim();
        businessInfo.certifications = certifications.trim();
        
        // Prepare tailoring categories with details
        const tailoringCategoriesWithDetails = selectedTailoringCategories.map((categoryName) => {
          const details = categoryDetails[categoryName] || {};
          const categoryObj = tailoringCategoryObjects.find((cat) => {
            const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
            return catName === categoryName;
          });
          
          return {
            categoryName: categoryName,
            ItemId: details.ItemId || categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
            FullPrice: details.FullPrice || null,
            DiscountPrice: details.DiscountPrice || null,
            DiscountType: details.DiscountType || null,
            DiscountValue: details.DiscountValue || null,
            EstimatedDays: details.EstimatedDays || null,
            IsAvailable: details.IsAvailable !== false,
            Notes: details.Notes || null,
          };
        });
        
        businessInfo.tailoringCategoriesDetails = tailoringCategoriesWithDetails;
      }

      // Add other fields
      businessInfo.ownerName = ownerName.trim();
      businessInfo.businessDescription = businessDescription.trim();
      businessInfo.alternateNumber = alternateNumber.trim();
      businessInfo.googleMapLink = googleMapLink.trim();
      businessInfo.gpsLatitude = gpsLatitude.trim();
      businessInfo.gpsLongitude = gpsLongitude.trim();
      businessInfo.openingTime = openingTime.trim();
      businessInfo.closingTime = closingTime.trim();
      businessInfo.weeklyOff = weeklyOff.trim();
      businessInfo.businessLogo = logoBase64 || logoUri || '';

      // Prepare signup payload
      const nameParts = (signUpData?.name || ownerName || '').trim().split(' ');
      const firstName = nameParts[0] || signUpData?.firstName || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || signUpData?.lastName || '';

      const signupPayload = {
        email: signUpData?.email || email.trim(),
        password: signUpData?.password || '',
        firstName: firstName,
        lastName: lastName,
        phoneNumber: signUpData?.phoneNumber || mobileNumber.trim(),
        age: signUpData?.age || '',
        roleName: role || signUpData?.userRole || 'customer',
        businessInfo: businessInfo,
      };

      console.log('🚀 Calling signup API with business info');
      console.log('📦 Signup payload:', { ...signupPayload, password: '***' });
      console.log('🏢 Business info keys:', Object.keys(businessInfo));

      const response = await signUpWithEmailAndPassword(signupPayload);
      console.log('✅ Signup response:', response?.data);

      // If tailor role and we have businessId, save tailor item prices
      if (isTailorRole && selectedTailoringCategories.length > 0) {
        // Prepare tailoring categories with details for saving prices
        const tailoringCategoriesWithDetails = selectedTailoringCategories.map((categoryName) => {
          const details = categoryDetails[categoryName] || {};
          const categoryObj = tailoringCategoryObjects.find((cat) => {
            const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
            return catName === categoryName;
          });
          
          return {
            categoryName: categoryName,
            ItemId: details.ItemId || categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
            FullPrice: details.FullPrice || null,
            DiscountPrice: details.DiscountPrice || null,
            DiscountType: details.DiscountType || null,
            DiscountValue: details.DiscountValue || null,
            EstimatedDays: details.EstimatedDays || null,
            IsAvailable: details.IsAvailable !== false,
            Notes: details.Notes || null,
          };
        });

        try {
          const businessId = response.data?.businessId || response.data?.data?.businessId || response.data?.data?.id;
          if (businessId) {
            const itemPricesData = tailoringCategoriesWithDetails.map((category: any) => ({
              BusinessId: businessId,
              ItemId: category.ItemId,
              FullPrice: category.FullPrice ? parseFloat(category.FullPrice) : null,
              DiscountPrice: category.DiscountPrice ? parseFloat(category.DiscountPrice) : null,
              DiscountType: category.DiscountType || null,
              DiscountValue: category.DiscountValue ? parseFloat(category.DiscountValue) : null,
              EstimatedDays: category.EstimatedDays ? parseInt(category.EstimatedDays) : null,
              IsAvailable: category.IsAvailable !== false,
              Notes: category.Notes || null,
            }));

            // Try batch endpoint first
            try {
              await saveTailorItemPricesBatch({
                businessId: businessId,
                itemPrices: itemPricesData,
              });
            } catch (batchError) {
              // Fallback to individual saves
              await Promise.allSettled(
                itemPricesData.map((itemPrice: any) => saveTailorItemPrice(itemPrice))
              );
            }
          }
        } catch (priceError) {
          console.error('Error saving tailor item prices:', priceError);
          // Don't fail the signup if prices fail
        }
      }

      showSuccessMessage('Account Created', 'Your business account has been created successfully! Please verify your OTP.');

      // Navigate to OTP verification
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'OtpVerification',
            params: {
              data: {
                email: signUpData?.email || email.trim(),
                name: signUpData?.name || ownerName,
                userName: signUpData?.userName || '',
                age: signUpData?.age || '',
                userRole: role || signUpData?.userRole || 'customer',
              },
              type: 'signUp',
            },
          },
        ],
      });
    } catch (error: any) {
      console.error('❌ Signup failed:', error?.response?.data || error?.message || error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create account. Please try again.';
      showErrorMessage('Signup Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderOwnerStep = () => (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>Owner name</Text>
      <TextInput
        value={ownerName}
        onChangeText={setOwnerName}
        style={[styles.input, errors.ownerName && styles.inputError]}
        placeholder="Enter owner full name"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}

      <Text style={styles.fieldLabel}>Business name *</Text>
      <TextInput
        value={businessName}
        onChangeText={setBusinessName}
        style={[styles.input, errors.businessName && styles.inputError]}
        placeholder="Shop or brand name customers will see"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}

      <Text style={styles.fieldLabel}>Business logo</Text>
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

      <Text style={styles.fieldLabel}>Business description</Text>
      <TextInput
        value={businessDescription}
        onChangeText={setBusinessDescription}
        style={[styles.input, styles.textArea]}
        placeholder="Short intro about your shop or services"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderContactStep = () => (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>Business email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Contact email for customers"
        keyboardType="email-address"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.fieldLabel}>Primary mobile number *</Text>
      <TextInput
        value={mobileNumber}
        onChangeText={setMobileNumber}
        style={[styles.input, errors.mobileNumber && styles.inputError]}
        placeholder="Main phone number"
        keyboardType="phone-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

      <Text style={styles.fieldLabel}>Alternate number</Text>
      <TextInput
        value={alternateNumber}
        onChangeText={setAlternateNumber}
        style={styles.input}
        placeholder="Optional alternate contact number"
        keyboardType="phone-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Working city *</Text>
      <TextInput
        value={workingCity}
        onChangeText={setWorkingCity}
        style={[styles.input, errors.workingCity && styles.inputError]}
        placeholder="City where you mainly serve customers"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.workingCity && <Text style={styles.errorText}>{errors.workingCity}</Text>}

      <Text style={styles.fieldLabel}>Shop address</Text>
      <TextInput
        value={shopAddress}
        onChangeText={setShopAddress}
        style={[styles.input, styles.textArea]}
        placeholder="Flat / Street / Area / Landmark"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Google Maps link</Text>
      <TextInput
        value={googleMapLink}
        onChangeText={setGoogleMapLink}
        style={styles.input}
        placeholder="Paste your Google Maps location link"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>GPS latitude</Text>
          <TextInput
            value={gpsLatitude}
            onChangeText={setGpsLatitude}
            style={[styles.input, errors.gpsLatitude && styles.inputError]}
            placeholder="e.g., 19.0760"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.inputPlaceholder}
          />
          {errors.gpsLatitude && <Text style={styles.errorText}>{errors.gpsLatitude}</Text>}
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>GPS longitude</Text>
          <TextInput
            value={gpsLongitude}
            onChangeText={setGpsLongitude}
            style={[styles.input, errors.gpsLongitude && styles.inputError]}
            placeholder="e.g., 72.8777"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.inputPlaceholder}
          />
          {errors.gpsLongitude && <Text style={styles.errorText}>{errors.gpsLongitude}</Text>}
        </View>
      </View>
    </View>
  );

  const renderServicesStep = () => (
    <View style={styles.section}>
      {isTailorRole && (
        <>
          <Text style={styles.fieldLabel}>Service types *</Text>
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

          <Text style={styles.fieldLabel}>Tailoring categories *</Text>
          {loadingCategories ? (
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : tailoringCategoryOptions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No categories available. Please ensure the database is populated with tailor items.
              </Text>
            </View>
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
              <Text style={styles.fieldLabel}>Category details *</Text>
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
        </>
      )}

      <Text style={styles.fieldLabel}>Specialization</Text>
      <TextInput
        value={specialization}
        onChangeText={setSpecialization}
        style={styles.input}
        placeholder="e.g., Wedding Suits, Corporate Wear"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Years of experience</Text>
      <TextInput
        value={yearsOfExperience}
        onChangeText={setYearsOfExperience}
        style={[styles.input, errors.yearsOfExperience && styles.inputError]}
        placeholder="Total years in this business"
        keyboardType="number-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />
      {errors.yearsOfExperience && <Text style={styles.errorText}>{errors.yearsOfExperience}</Text>}

      <Text style={styles.fieldLabel}>Portfolio photos (links)</Text>
      <TextInput
        value={portfolioPhotos}
        onChangeText={setPortfolioPhotos}
        style={[styles.input, styles.textArea]}
        placeholder="Optional links to your best work or gallery"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Certifications / awards</Text>
      <TextInput
        value={certifications}
        onChangeText={setCertifications}
        style={[styles.input, styles.textArea]}
        placeholder="List any training, certificates or awards"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderBrandingStep = () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>Opening time</Text>
          <TextInput
            value={openingTime}
            onChangeText={setOpeningTime}
            style={styles.input}
            placeholder="e.g., 10:00 AM"
            placeholderTextColor={Colors.inputPlaceholder}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>Closing time</Text>
          <TextInput
            value={closingTime}
            onChangeText={setClosingTime}
            style={styles.input}
            placeholder="e.g., 9:00 PM"
            placeholderTextColor={Colors.inputPlaceholder}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Weekly off</Text>
      <TextInput
        value={weeklyOff}
        onChangeText={setWeeklyOff}
        style={styles.input}
        placeholder="e.g., Sunday"
        placeholderTextColor={Colors.inputPlaceholder}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (activeStep.key) {
      case 'owner':
        return renderOwnerStep();
      case 'contact':
        return renderContactStep();
      case 'services':
        return renderServicesStep();
      case 'branding':
        return renderBrandingStep();
      default:
        return null;
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business setup</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {totalSteps}
          </Text>
        </View>

        {/* Info tile */}
        <View style={styles.infoTile}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>🏪</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{activeStep.title}</Text>
            <Text style={styles.infoSubtitle}>{activeStep.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Bottom actions */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBack} disabled={saving}>
              <Text style={styles.secondaryButtonText}>
                {currentStep === 0 ? 'Skip for now' : 'Back'}
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={isLastStep ? 'Save & Continue' : 'Next'}
              onPress={isLastStep ? handleSave : handleNext}
              loading={saving}
              style={styles.primaryButton}
            />
          </View>
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warmBrownColor,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  infoTile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.whiteColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
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
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    textAlign: 'center',
    padding: 16,
  },
  emptyStateContainer: {
    padding: 16,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.whiteColor,
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  primaryButton: {
    flex: 1.2,
  },
});

export default BusinessInfoOnboarding;
