import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../views/profile';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ProfileScreen" 
        component={Profile}
      />
    </Stack.Navigator>
  );
}
