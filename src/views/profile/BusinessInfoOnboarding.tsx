import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';
import CustomButton from '../../components/CustomButton';
import { saveBusinessInfo } from '../../utils/api/businessApi';
import { showSuccessMessage, showErrorMessage } from '../../utils/flashMessage';

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
  };
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

const BusinessInfoOnboarding: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { role, signUpData } = (route.params || {}) as RouteParams;

  // Field states
  const [ownerName, setOwnerName] = useState(signUpData?.name || '');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState(signUpData?.email || '');
  const [mobileNumber, setMobileNumber] = useState(signUpData?.phoneNumber || '');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState('');
  const [gpsLongitude, setGpsLongitude] = useState('');
  const [workingCity, setWorkingCity] = useState('');
  const [serviceTypes, setServiceTypes] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState('');
  const [certifications, setCertifications] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [weeklyOff, setWeeklyOff] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const totalSteps = steps.length;
  const activeStep = steps[currentStep];

  const progress = useMemo(
    () => (totalSteps > 0 ? (currentStep + 1) / totalSteps : 0),
    [currentStep],
  );

  const isLastStep = currentStep === totalSteps - 1;

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
    setSaving(true);
    try {
      const payload = {
        ownerName,
        businessName,
        email,
        mobileNumber,
        alternateNumber,
        shopAddress,
        googleMapLink,
        gpsLatitude,
        gpsLongitude,
        workingCity,
        serviceTypes,
        specialization,
        yearsOfExperience,
        portfolioPhotos,
        certifications,
        openingTime,
        closingTime,
        weeklyOff,
        businessLogo,
        businessDescription,
        role,
      };

      console.log('Saving business info:', payload);
      const response = await saveBusinessInfo(payload);
      console.log('Business info save response:', response?.data);

      showSuccessMessage('Business profile saved', 'You can update these details from Profile anytime.');

      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error: any) {
      console.error('Failed to save business info:', error?.response?.data || error?.message || error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to save business info. Please try again.';
      showErrorMessage('Error saving business info', errorMessage);
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
        style={styles.input}
        placeholder="Enter owner full name"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Business name</Text>
      <TextInput
        value={businessName}
        onChangeText={setBusinessName}
        style={styles.input}
        placeholder="Shop or brand name customers will see"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Business description</Text>
      <TextInput
        value={businessDescription}
        onChangeText={setBusinessDescription}
        style={[styles.input, styles.textArea]}
        placeholder="Short intro about your shop or services"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
      />
    </View>
  );

  const renderContactStep = () => (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>Business email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Contact email for customers"
        keyboardType="email-address"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Primary mobile number</Text>
      <TextInput
        value={mobileNumber}
        onChangeText={setMobileNumber}
        style={styles.input}
        placeholder="Main phone number"
        keyboardType="phone-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Alternate number</Text>
      <TextInput
        value={alternateNumber}
        onChangeText={setAlternateNumber}
        style={styles.input}
        placeholder="Optional alternate contact number"
        keyboardType="phone-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Shop address</Text>
      <TextInput
        value={shopAddress}
        onChangeText={setShopAddress}
        style={[styles.input, styles.textArea]}
        placeholder="Flat / Street / Area / Landmark"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
      />

      <Text style={styles.fieldLabel}>Working city</Text>
      <TextInput
        value={workingCity}
        onChangeText={setWorkingCity}
        style={styles.input}
        placeholder="City where you mainly serve customers"
        placeholderTextColor={Colors.inputPlaceholder}
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
            style={styles.input}
            placeholder="e.g., 19.0760"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.inputPlaceholder}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>GPS longitude</Text>
          <TextInput
            value={gpsLongitude}
            onChangeText={setGpsLongitude}
            style={styles.input}
            placeholder="e.g., 72.8777"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.inputPlaceholder}
          />
        </View>
      </View>
    </View>
  );

  const renderServicesStep = () => (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>Service types</Text>
      <TextInput
        value={serviceTypes}
        onChangeText={setServiceTypes}
        style={styles.input}
        placeholder="e.g., fabric sales, stitching, home measurements"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Specialization</Text>
      <TextInput
        value={specialization}
        onChangeText={setSpecialization}
        style={styles.input}
        placeholder="e.g., formal suits, office wear, wedding tailoring"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Years of experience</Text>
      <TextInput
        value={yearsOfExperience}
        onChangeText={setYearsOfExperience}
        style={styles.input}
        placeholder="Total years in this business"
        keyboardType="number-pad"
        placeholderTextColor={Colors.inputPlaceholder}
      />

      <Text style={styles.fieldLabel}>Portfolio photos (links)</Text>
      <TextInput
        value={portfolioPhotos}
        onChangeText={setPortfolioPhotos}
        style={[styles.input, styles.textArea]}
        placeholder="Optional links to your best work or gallery"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
      />

      <Text style={styles.fieldLabel}>Certifications / awards</Text>
      <TextInput
        value={certifications}
        onChangeText={setCertifications}
        style={[styles.input, styles.textArea]}
        placeholder="List any training, certificates or awards"
        placeholderTextColor={Colors.inputPlaceholder}
        multiline
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

      <Text style={styles.fieldLabel}>Business logo (link)</Text>
      <TextInput
        value={businessLogo}
        onChangeText={setBusinessLogo}
        style={styles.input}
        placeholder="Link to your logo image (optional)"
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 4 : 12 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
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
    </SafeAreaView>
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
  backIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
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


