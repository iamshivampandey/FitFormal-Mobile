import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../utils/colors';
import { GILROY_REGULAR } from '../utils/fonts';

interface CustomInputProps extends TextInputProps {
  error?: string;
  containerStyle?: any;
  inputStyle?: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  error,
  containerStyle,
  inputStyle,
  placeholderTextColor = Colors.grey,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.blackColor,
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center',
    // borderWidth: 0.17,
    borderColor: Colors.inputBorderColor,
    fontSize: 14,
    fontFamily: GILROY_REGULAR,
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
