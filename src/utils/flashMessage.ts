import { showMessage } from 'react-native-flash-message';
import { Colors } from './colors';

export const showSuccessMessage = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'success',
    backgroundColor: Colors.successGreen,
    color: Colors.whiteColor,
    icon: 'success',
    duration: 2500,
  });
};

export const showErrorMessage = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'danger',
    backgroundColor: Colors.errorRed,
    color: Colors.whiteColor,
    icon: 'danger',
    duration: 3000,
  });
};

export const showInfoMessage = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'info',
    backgroundColor: Colors.infoBlue,
    color: Colors.whiteColor,
    icon: 'info',
    duration: 2500,
  });
};


