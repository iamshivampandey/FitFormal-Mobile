import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setpassword] = useState('');
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
    console.log('onPressSignIn');
    // Sign in with selected role
    signIn(selectedRole);
    navigation.navigate('TabBarNavigation');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.subContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'customer' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('customer')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'customer' && styles.roleButtonTextActive]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'tailor' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('tailor')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'tailor' && styles.roleButtonTextActive]}>
                Tailor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'tailor_shop' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('tailor_shop')}
            >
              <Text style={[styles.roleButtonText, selectedRole === 'tailor_shop' && styles.roleButtonTextActive]}>
                Shop + Tailor
              </Text>
            </TouchableOpacity>
          </View>
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
    </View>
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
    // fontFamily: GILROY_BOLD,
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
    // fontFamily: GILROY_SEMIBOLD,
    lineHeight: 24,
  },
  HeaderTextFAQ: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    marginHorizontal: 10,
    // fontFamily: GILROY_REGULAR,
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
    // fontFamily: GILROY_REGULAR,
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
    // fontFamily: GILROY_REGULAR,
  },
  PasswordText: {
    fontWeight: '400',
    fontSize: 14,
    padding: 10,
    width: '90%',
    // fontFamily: GILROY_REGULAR,
    color: Colors.whiteColor,
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
    // fontFamily: GILROY_MEDIUM,
  },
  ForgotText: {
    textAlign: 'right',
    marginRight: 15,
    fontSize: 12,
    fontWeight: '400',
    // fontFamily: GILROY_REGULAR,
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
    // fontFamily: GILROY_REGULAR,
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
    // fontFamily: GILROY_MEDIUM,
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
    // fontFamily: GILROY_REGULAR,
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
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  roleButtonText: {
    fontSize: 12,
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
    // fontFamily: GILROY_REGULAR,
  },
  SignUp: {
    color: Colors.warmBrownColor,
    fontSize: 12,
    // fontFamily: GILROY_MEDIUM,
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
