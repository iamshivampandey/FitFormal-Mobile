import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import FastImage from 'react-native-fast-image';
import { palceholders, strings } from '../../utils/string/strings';
import { Colors } from '../../utils/colors';
import en from '../../utils/string/en';
import {
  GILROY_BOLD,
  GILROY_MEDIUM,
  GILROY_REGULAR,
  GILROY_SEMIBOLD,
} from '../../utils/fonts';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
  initialWindowMetrics,
  useSafeAreaFrame,
  SafeAreaListener,
  SafeAreaView,
} from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { google_icon } from '../../utils/images';
import { useAuth, UserRole } from '../../context/AuthContext';
import { signInWithEmailAndPassword } from '../../utils/authApi';
import StorageService from '../../services/storage.service';
import { getBackendRoleName } from '../../utils/constants/roles';
import LoadingOverlay from '../../components/LoadingOverlay';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('Itsshivampandey551@gmail.com');
  const [password, setpassword] = useState('Topbox@012');
  const [passwordHide, setpasswordHide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const { signIn } = useAuth();

  const isValid = () => {
    if (email === '' || password === '') {
      return false;
    }
    return true;
  };

  const onPressSignIn = async () => {
    // Validate inputs
    let valid = true;
    
    if (email.trim() === '') {
      setEmailError('Email is required');
      valid = false;
    } else {
      setEmailError('');
    }
    
    if (password.trim() === '') {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    
    if (!valid) {
      return;
    }
    
    setLoading(true);
    
    try {
      const loginData = {
        email: email.trim(),
        password: password,
      };

      console.log('Attempting login with email:', loginData.email);
      
      const response = await signInWithEmailAndPassword(loginData);
      
      console.log('✅ Login API Response:', JSON.stringify(response.data));
      
      if (response.data && response.data.data) {
        const { token, user, roles, expiresIn } = response.data.data;
        
        console.log('📦 Full Response Data:', {
          user,
          roles,
          token: token ? 'Token received' : 'No token',
          expiresIn
        });
        
        // Validate user data
        if (!user || !user.email || !user.firstName) {
          setLoading(false);
          Alert.alert('Error', 'Invalid user data received from server');
          console.error('❌ Invalid user data:', user);
          return;
        }
        
        // Save token
        if (token) {
          await StorageService.saveToken(token);
          console.log('✓ Token saved');
        }
        
        // Save complete user data (save the inner data object with user, roles, token)
        await StorageService.saveUser(JSON.stringify(response.data.data));
        console.log('✓ User data saved:', {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber
        });
        
        // Determine user role from roles array
        let userRole: UserRole = 'customer'; // Default
        let primaryRole = null;
        
        // roles is an ARRAY - get the first role
        if (roles && Array.isArray(roles) && roles.length > 0) {
          primaryRole = roles[0]; // Get first role
          console.log('📋 Primary Role from API:', primaryRole);
          console.log('📋 Role Name:', primaryRole.name);
          console.log('📋 Role ID:', primaryRole.id);
          
          // Map capitalized role names to frontend role types
          const roleName = primaryRole.name;
          
          if (roleName === 'Seller') {
            userRole = 'shop';
          } else if (roleName === 'Customer') {
            userRole = 'customer';
          } else if (roleName === 'Tailor') {
            userRole = 'tailor';
          } else if (roleName === 'Taylorseller' || roleName === 'TailorSeller') {
            userRole = 'tailor_shop';
          } else {
            // Try lowercase conversion as fallback
            userRole = roleName.toLowerCase() as UserRole;
          }
          
          console.log('✓ Mapped to frontend role:', userRole);
        } else {
          console.warn('⚠️ No roles found in response, using default: customer');
        }
        
        // Save role to storage
        await StorageService.saveRole(userRole);
        console.log('✓ Role saved to storage:', userRole);
        
        // Sign in with the user's role - THIS IS REQUIRED FOR NAVIGATION!
        signIn(userRole);
        console.log('✓ AuthContext updated with role:', userRole);
        
        setLoading(false);
        
        // Navigate based on role
        const displayName = `${user?.firstName} ${user?.lastName}`;
        const roleDisplay = primaryRole?.name || userRole;
        
        Alert.alert(
          `Welcome ${displayName}!`,
          `Logged in as ${roleDisplay}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                console.log('🚀 Navigating to TabBarNavigation...');
                // Navigate to parent navigator (AppRootNavigator) and reset to TabBarNavigation
                const parentNavigator = navigation.getParent();
                if (parentNavigator) {
                  parentNavigator.reset({
                    index: 0,
                    routes: [{ name: 'TabBarNavigation' }],
                  });
                } else {
                  // Fallback: Just navigate without reset
                  navigation.navigate('TabBarNavigation' as never);
                }
              }
            }
          ]
        );
      } else {
        setLoading(false);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (e: any) {
      setLoading(false);
      console.error('❌ Login Error:', e);
      const errorMessage = e.response?.data?.message || e.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.subContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.Header}>
          <Text style={styles.HeaderBigText}>
            {strings.WELCOME}
            <Text style={styles.appName}> {strings.APP_NAME}</Text>
          </Text>
        </View>
        <View style={styles.HeaderSmallText}>
          <Text style={styles.FirstTextColor}>
            {strings.LOREM_IPSUM}
            <Text style={styles.HeaderTextFAQ} onPress={() => {}}>
              {strings.FAQ}
            </Text>
            {strings.ABOUT_APP_NAME}
          </Text>
        </View>

        {/* Role Selector for Testing */}
        <View style={styles.roleSelector}>
          <Text style={styles.roleSelectorLabel}>Select Role (Testing):</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleButtons}
          >
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'customer' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('customer')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'customer' && styles.roleButtonTextActive]}>
                👔 Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'shop' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('shop')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'shop' && styles.roleButtonTextActive]}>
                🏬 Shop Owner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'tailor' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('tailor')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'tailor' && styles.roleButtonTextActive]}>
                ✂️ Tailor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'tailor_shop' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('tailor_shop')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'tailor_shop' && styles.roleButtonTextActive]}>
                🏪 Shop + Tailor
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.EmailInput}></View>

        <CustomInput
          placeholder={palceholders.EMAIL_NUMBER}
          value={email}
          onChangeText={newText => {
            setEmailError('');
            setEmail(newText);
          }}
          error={emailError}
        />
        <TouchableOpacity style={styles.PasswordInput}>
          <TextInput
          value={password}
            style={styles.PasswordText}
            secureTextEntry={!passwordHide}
            placeholder={palceholders.PASSWORD}
            placeholderTextColor={Colors.grey}
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically
            onChangeText={text => {
              setpassword(text);
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setpasswordHide(!passwordHide);
            }}
          >
            {/* {passwordHide ? (
              <VectorImage
                source={hide}
                style={styles.ViewImg}
                tintColor={"black"}
              />
            ) : (
              <VectorImage source={eye_view} style={styles.ViewImg} />
            )} */}
          </TouchableOpacity>
        </TouchableOpacity>
        <CustomButton
          title={strings.LOGIN}
          onPress={onPressSignIn}
          style={styles.button}
          loading={loading}
        />

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ForgotScreen');
          }}
          style={{
            alignItems: 'flex-end',
            justifyContent: 'center',
            margin: 5,
            padding: 4,
            width: '50%',
            alignSelf: 'flex-end',
          }}
        >
          <Text style={styles.ForgotText}>{strings.FORGOT_PASSWORD}</Text>
        </TouchableOpacity>
        <View style={styles.Divider}>
          <View style={styles.DividerLine} />
          <Text style={styles.DividerText}>{strings.LOGIN_WITH}</Text>
          <View style={styles.DividerLine} />
        </View>
        <View style={styles.LoginWithGoogleInput}>
          <TouchableOpacity style={styles.LoginWithGoogle} onPress={() => {}}>
            <View style={styles.LoginWithAppleInput}>
              <FastImage 
                source={google_icon} 
                style={styles.GoogleImage}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={styles.LoginWithGoogleText}>
                {strings.LOGIN_WITH_GOOGLE}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.TextByLogging}>
          <Text style={styles.TextByLoginColor}>
            {strings.AGREEMENT}
            <Text style={styles.TermsText} onPress={() => {}}>
              {strings.TERMS_CONDITIONS}
            </Text>
            <Text> {strings.AND} </Text>
            <Text style={styles.PrivacyText} onPress={() => {}}>
              {strings.PRICACY_POLICY}
            </Text>
          </Text>
        </View>
        <View style={styles.Bottom}>
          <Text style={styles.BottomText}>
            {strings.CREATE_ACCOUNT}
            <Text
              style={styles.SignUp}
              onPress={() => {
                navigation.navigate('RoleSelection');
              }}
            >
              {strings.SING_UP}
            </Text>
          </Text>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} message="Signing in..." />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: '20%',
  },
  subContainer: {
    flex: 1,
  },
  Header: {
    marginTop: 30,
  },
  HeaderBigText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: GILROY_BOLD,
    lineHeight: 44,
  },
  appName: {
    color: Colors.warmBrownColor,
  },
  HeaderSmallText: {
    marginTop: 15,
    marginHorizontal: 40,
    alignSelf: 'center',
  },
  FirstTextColor: {
    textAlign: 'center',
    color: Colors.grey,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
    lineHeight: 24,
  },
  HeaderTextFAQ: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    marginHorizontal: 10,
    fontFamily: GILROY_REGULAR,
  },
  EmailInput: {
    alignItems: 'center',
    marginTop: 45,
    borderWidth: 0.09,
  },
  EmailText: {
    fontWeight: '400',
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    height: 56,
    width: '92%',
    borderRadius: 24,
    fontSize: 14,
    padding: 10,
    backgroundColor: Colors.inputBackground,
    paddingStart: 20,
    fontFamily: GILROY_REGULAR,
    color: Colors.whiteColor,
  },
  PasswordInput: {
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    borderWidth: 0.09,
    height: 56,
    borderRadius: 24,
    padding: 10,
    backgroundColor: Colors.inputBackground,
    width: '92%',
    alignSelf: 'center',
    fontWeight: '400',
    borderColor: Colors.inputBorderColor,
    fontSize: 14,
    paddingStart: 20,
    fontFamily: GILROY_REGULAR,
  },
  PasswordText: {
    fontWeight: '400',
    fontSize: 14,
    padding: 10,
    width: '90%',
    fontFamily: GILROY_REGULAR,
    color: Colors.blackColor,
  },
  ViewImg: {
    width: 25,
    height: 19,
  },
  Login: {
    alignItems: 'center',
    marginTop: 20,
  },
  LoginInput: {
    borderRadius: 24,
    borderWidth: 0.09,
    width: '92%',
    height: 51,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
  },
  LoginText: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: GILROY_MEDIUM,
  },
  ForgotText: {
    textAlign: 'right',
    marginRight: 15,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: GILROY_REGULAR,
    color: Colors.textPrimary,
  },
  Divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
  },
  DividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  DividerText: {
    textAlign: 'center',
    marginHorizontal: 10,
    color: Colors.grey,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    fontFamily: GILROY_REGULAR,
  },
  Next: {
    alignItems: 'center',
    marginTop: 30,
  },
  LoginWithGoogle: {
    borderRadius: 24,
    borderWidth: 0,
    height: 51,
    backgroundColor: Colors.whiteColor,
    width: '92%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  LoginWithGoogleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  GoogleImage: {
    width: 25,
    height: 25,
    marginRight: 15,
  },
  LoginWithGoogleText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: GILROY_MEDIUM,
    color: Colors.blackColor,
  },
  BetweenAppleGoogle: {
    alignItems: 'center',
    marginTop: 30,
  },

  LoginWithAppleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  TextByLogging: {
    alignItems: 'center',
    marginTop: '25%',
    marginHorizontal: 30,
  },
  TextByLoginColor: {
    textAlign: 'center',
    lineHeight: 22,
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: GILROY_REGULAR,
  },
  roleSelector: {
    marginTop: 20,
    marginBottom: 10,
  },
  roleSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    minWidth: 120,
  },
  roleButtonActive: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  roleButtonTextActive: {
    color: Colors.whiteColor,
  },
  TermsText: {
    fontWeight: '400',
    color: 'black',
    fontSize: 13,
  },
  PrivacyText: {
    fontWeight: '400',
    color: 'black',
    fontSize: 13,
  },
  Bottom: {
    marginTop: 25,
    marginBottom: 30,
    alignItems: 'center',
  },
  BottomText: {
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: GILROY_REGULAR,
  },
  SignUp: {
    color: Colors.warmBrownColor,
    fontSize: 12,
    fontFamily: GILROY_MEDIUM,
  },
  button: {
    marginTop: 20,
    height: 51,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center',
  },
});
