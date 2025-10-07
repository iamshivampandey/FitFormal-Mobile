import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileStackNavigation(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProfileStackNavigation</Text>
      <Text style={styles.subtitle}>Your account details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
