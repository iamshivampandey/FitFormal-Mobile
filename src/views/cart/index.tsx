import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';

export default function Cart(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height to add bottom padding
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.content, { paddingBottom: tabBarHeight + 16 }]}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.subtitle}>Your shopping cart</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
});

