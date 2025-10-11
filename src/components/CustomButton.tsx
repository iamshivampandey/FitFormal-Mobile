import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../utils/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primary, disabled && styles.disabled];
      case 'secondary':
        return [...baseStyle, styles.secondary, disabled && styles.disabled];
      case 'outline':
        return [...baseStyle, styles.outline, disabled && styles.disabled];
      default:
        return [...baseStyle, styles.primary, disabled && styles.disabled];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        return [...baseTextStyle, styles.primaryText, disabled && styles.disabledText];
      case 'secondary':
        return [...baseTextStyle, styles.secondaryText, disabled && styles.disabledText];
      case 'outline':
        return [...baseTextStyle, styles.outlineText, disabled && styles.disabledText];
      default:
        return [...baseTextStyle, styles.primaryText, disabled && styles.disabledText];
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? Colors.warmBrownColor : Colors.whiteColor} 
          size="small" 
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '92%',
  },
  // Sizes
  small: {
    height: 40,
  },
  medium: {
    height: 51,
  },
  large: {
    height: 60,
  },
  // Variants
  primary: {
    backgroundColor: Colors.buttonBgColor,
  },
  secondary: {
    backgroundColor: Colors.lightGrey,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  disabled: {
    backgroundColor: Colors.lightGrey50,
    borderColor: Colors.lightGrey50,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: Colors.whiteColor,
  },
  secondaryText: {
    color: Colors.blackColor,
  },
  outlineText: {
    color: Colors.warmBrownColor,
  },
  disabledText: {
    color: Colors.grey,
  },
});

export default CustomButton;
