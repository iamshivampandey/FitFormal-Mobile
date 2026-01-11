import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../utils/fonts';
import CustomButton from './CustomButton';

const { width } = Dimensions.get('window');

export interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface ModalProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  buttons?: ModalButton[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

const AppModal: React.FC<ModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons,
  onClose,
  showCloseButton = true,
}) => {
  const insets = useSafeAreaInsets();

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: Colors.successGreen,
          bgColor: '#E8F5E9',
        };
      case 'error':
        return {
          name: 'close-circle',
          color: Colors.errorRed,
          bgColor: '#FFEBEE',
        };
      case 'warning':
        return {
          name: 'warning',
          color: Colors.warningOrange,
          bgColor: '#FFF3E0',
        };
      case 'confirm':
        return {
          name: 'help-circle',
          color: Colors.warmBrownColor,
          bgColor: Colors.lightBrownColor,
        };
      default:
        return {
          name: 'information-circle',
          color: Colors.infoBlue,
          bgColor: '#E3F2FD',
        };
    }
  };

  const iconConfig = getIconConfig();

  const defaultButtons: ModalButton[] = buttons || [
    {
      text: 'OK',
      onPress: () => onClose?.(),
      style: 'default',
    },
  ];

  const handleBackdropPress = () => {
    if (type !== 'confirm') {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { marginBottom: insets.bottom }]}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
                <Icon name={iconConfig.name} size={48} color={iconConfig.color} />
              </View>

              {/* Close Button */}
              {showCloseButton && onClose && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color={Colors.grey} />
                </TouchableOpacity>
              )}

              {/* Content */}
              <View style={styles.content}>
                {title && (
                  <Text style={styles.title}>{title}</Text>
                )}
                <Text style={styles.message}>{message}</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {defaultButtons.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        defaultButtons.length === 1 && styles.singleButton,
                        isDestructive && styles.destructiveButton,
                        isCancel && styles.cancelButton,
                        !isCancel && !isDestructive && styles.primaryButton,
                      ]}
                      onPress={button.onPress}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isDestructive && styles.destructiveButtonText,
                          isCancel && styles.cancelButtonText,
                          !isCancel && !isDestructive && styles.primaryButtonText,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 24,
    width: width - 40,
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: GILROY_BOLD,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: GILROY_REGULAR,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    maxWidth: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.warmBrownColor,
  },
  cancelButton: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  destructiveButton: {
    backgroundColor: Colors.errorRed,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: GILROY_SEMIBOLD,
  },
  primaryButtonText: {
    color: Colors.whiteColor,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
  },
  destructiveButtonText: {
    color: Colors.whiteColor,
  },
});

export default AppModal;

