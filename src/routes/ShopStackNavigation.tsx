import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ProductManagement from '../views/shop/ProductManagement';
import AddEditProduct from '../views/shop/AddEditProduct';

export default function ShopStackNavigation(): React.JSX.Element {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductManagement" component={ProductManagement} />
      <Stack.Screen name="AddEditProduct" component={AddEditProduct} />
    </Stack.Navigator>
  );
}

