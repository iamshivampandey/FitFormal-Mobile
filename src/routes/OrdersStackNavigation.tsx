import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OrdersScreen from '../views/orders/OrdersScreen';

const Stack = createNativeStackNavigator();

export default function OrdersStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    </Stack.Navigator>
  );
}


