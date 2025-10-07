import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SignUp(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text>Create your FitFormal account</Text>
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
    fontWeight: '700',
    marginBottom: 16,
  },
});
