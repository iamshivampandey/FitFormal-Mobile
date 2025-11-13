import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Colors } from '../utils/colors';
import { GILROY_REGULAR } from '../utils/fonts';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * Simple loading overlay with ActivityIndicator
 * Use this for quick operations where custom animation is not needed
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Please wait...',
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.warmBrownColor} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 150,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: GILROY_REGULAR,
  },
});

export default LoadingOverlay;

