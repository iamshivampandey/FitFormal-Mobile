/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppRootNavigator from './src/routes';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ModalProvider } from './src/context/ModalContext';
import FlashMessage from 'react-native-flash-message';

function App() {
  return (
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <AuthProvider>
        <ModalProvider>
          <NavigationContainer>
            <AppRootNavigator />
          </NavigationContainer>
          <FlashMessage position="top" />
        </ModalProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
