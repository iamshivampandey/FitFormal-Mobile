import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Cart from '../views/cart';

const Stack = createNativeStackNavigator();

export default function CartStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={Cart} />
    </Stack.Navigator>
  );
}

