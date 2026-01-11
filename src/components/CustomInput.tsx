import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../utils/colors';
import { GILROY_REGULAR } from '../utils/fonts';

interface CustomInputProps extends TextInputProps {
  error?: string;
  containerStyle?: any;
  inputStyle?: any;
  showPasswordToggle?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  error,
  containerStyle,
  inputStyle,
  placeholderTextColor = Colors.grey,
  showPasswordToggle = false,
  secureTextEntry,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithIcon,
            inputStyle,
          ]}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  inputContainer: {
    width: '92%',
    alignSelf: 'center',
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.blackColor,
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderColor: Colors.inputBorderColor,
    fontSize: 14,
    fontFamily: GILROY_REGULAR,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  errorText: {
    color: Colors.errorRed,
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
    fontFamily: GILROY_REGULAR,
  },
});

export default CustomInput;
