import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HomeStackNavigation from './HomeStackNavigation';
import ProfileStackNavigation from './ProfileStackNavigation';

export default function TabBarNavigation(): React.JSX.Element {
    const TabBar = createBottomTabNavigator();
  return (
    <TabBar.Navigator>
      <TabBar.Screen name="Home" component={HomeStackNavigation} />
      <TabBar.Screen name="Profile" component={ProfileStackNavigation} />
    </TabBar.Navigator>
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
