import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../views/home'; // This handles role-based routing
import BookMeasurementScreen from '../views/home/BookMeasurementScreen';
import ProductDetailScreen from '../views/home/ProductDetailScreen';
import ProductsListScreen from '../views/home/ProductsListScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="BookMeasurement" component={BookMeasurementScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductsList" component={ProductsListScreen} />
    </Stack.Navigator>
  );
}
