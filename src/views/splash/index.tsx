import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function Splash(): React.JSX.Element {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          { name: (isAuthenticated ? 'TabBarNavigation' : 'AuthStackNavigation') as never },
        ],
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.title}>FitFormal</Text>
      <Text style={styles.subtitle}>Preparing your experience...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
});
