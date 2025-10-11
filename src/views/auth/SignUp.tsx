import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "../../utils/colors";
import { palceholders, strings } from "../../utils/string/strings";
import en from "../../utils/string/en";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";

const SignUpScreen = ({ navigation, route }: any) => {
  const { userRole, roleData } = route.params || {};
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [nameError, setNameError] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [ageError, setAgeError] = useState("");

  const handleSignUp = async () => {
    let valid = true;

    if (name === "") {
      setNameError("Name is required");
      valid = false;
    } else {
      setNameError("");
    }
    if (userName.trim() === "") {
      setUserNameError("Username is required");
      valid = false;
    } else {
      setUserNameError("");
    }

    if (email.trim() === "") {
      setEmailError("Email or phone is required");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (age.trim() === "") {
      setAgeError("Age is required");
      valid = false;
    } else {
      setAgeError("");
    }
    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (valid) {
      if (!isSelected) {
        Alert.alert("Terms required", "You must agree to the Terms & Privacy");
        return;
      } else {
        setCheckboxError("");
      }
      try {
        // Simulate successful signup
        Alert.alert("Success", `Account created successfully as ${roleData?.title || 'User'}! Please verify your OTP.`);
        navigation.navigate("OtpVerification", {
          data: { email, name, userName, age, userRole },
          type: 'signUp'
        });
      } catch (e: any) {
        Alert.alert("Error", e?.message || en.InternalServerError);
      }
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.subContainer} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.signText}>{strings.SING_UP}</Text>
          {roleData && (
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Registering as: {roleData.title}</Text>
              <Text style={styles.roleDescription}>{roleData.description}</Text>
            </View>
          )}
          <Text style={styles.subText}>
            {strings.LOREM_IPSUM}
            <Text style={styles.colorText}>{strings.FAQ}</Text>
            {strings.ABOUT_APP_NAME}
          </Text>
        </View>
        <View style={{ gap: 16 }}>
          <CustomInput
            placeholder={palceholders.NAME}
            value={name}
            onChangeText={(newText) => {
              setNameError("");
              setName(newText);
            }}
            error={nameError}
          />
          
          <CustomInput
            placeholder={palceholders.USERNAME}
            value={userName}
            onChangeText={(newText) => {
              setUserNameError("");
              setUserName(newText);
            }}
            error={userNameError}
          />
          
          <CustomInput
            placeholder={palceholders.AGE}
            value={age}
            onChangeText={(newText) => {
              setAgeError("");
              setAge(newText);
            }}
            error={ageError}
          />
          
          <CustomInput
            placeholder={palceholders.EMAIL_NUMBER}
            value={email}
            onChangeText={(newText) => {
              setEmailError("");
              setEmail(newText);
            }}
            error={emailError}
            autoCapitalize="none"
          />
          
          <CustomInput
            placeholder={palceholders.PASSWORD}
            value={password}
            onChangeText={(newText) => {
              setPasswordError("");
              setPassword(newText);
            }}
            error={passwordError}
            secureTextEntry={true}
          />

          <View style={styles.checkbox}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsSelected(!isSelected)}
              style={[styles.checkBoxIcon, isSelected && { backgroundColor: Colors.warmBrownColor }]}
            />
            <Text style={styles.checkText}>
              I agree to {strings.TERMS_CONDITIONS} {strings.AND} {strings.PRICACY_POLICY}
            </Text>
          </View>
        </View>
        <CustomButton
          title="Sign Up"
          onPress={handleSignUp}
          style={styles.button}
        />
        <View style={styles.noteViwe}>
          <Text style={styles.noteText}>
            {strings.AGREEMENT}
            <Text style={styles.boldNotetext}>{strings.TERMS_CONDITIONS}</Text>
            {strings.AND}
          </Text>
          <Text style={styles.boldNotetext}>{strings.PRICACY_POLICY}</Text>
        </View>
        <View style={styles.signUpBtn}>
          <Text style={styles.signUpText}>{strings.CREATE_ACCOUNT} </Text>
          <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: "SignIn" }] })}>
            <Text style={styles.colorText}>{strings.SIGN_IN}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
    paddingTop:'20%'
  },
  subContainer: {
    marginTop: 15,
    flex: 1,
  },
  signText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.warmBrownColor,
    textAlign: "center",
  },
  subText: {
    textAlign: "center",
    marginHorizontal: 30,
    marginTop: 15,
    lineHeight: 25.2,
    fontSize: 14,
    color: "#757575",
  },
  colorText: {
    color: Colors.warmBrownColor,
    fontSize: 12,
    fontWeight: "400",
  },
  container: {
    marginBottom: 20,
  },
  roleInfo: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    width:'92%',
    alignSelf:'center'
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warmBrownColor,
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inpputColor: {
    backgroundColor: Colors.inputBackground,
    color:Colors.whiteColor,
    marginVertical: 1,
    height: 56,
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    width:'92%',
    alignSelf:'center'
  },
  checkbox: {
    flexDirection: "row",
    gap: 10,
    width: "90%",
    alignSelf: "center",
    marginBottom: 30,
    marginTop: 5,
    alignItems: 'center',
    // backgroundColor:'red'
  },
  checkText: {
    color: Colors.grey,
    fontSize: 12,
    fontWeight: "400",
    width: "80%",
  },
  button: {
    backgroundColor: Colors.buttonBgColor,
    marginTop: 20,
    height: 51,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center'
  },
  textstyle: {
    color: Colors.whiteColor,
    fontSize: 16,
    fontWeight: '600'
  },
  noteViwe: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  noteText: {
    color: Colors.grey,
    lineHeight: 35,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "400",
  },
  boldNotetext: {
    fontWeight: "500",
    color: "black",
    textAlign: "center",
    marginBottom: 5,
    fontSize: 12,
  },
  boldNotetextPolicy: {
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  signUpBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signUpText: {
    color: Colors.grey,
    fontSize: 12,
    fontWeight: "400",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginLeft: 30,
    marginTop: 2,
  },
  checkBoxIcon: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
});
