import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../views/profile';
import BusinessInfoEdit from '../views/profile/BusinessInfoEdit';

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
      <Stack.Screen 
        name="BusinessInfoEdit" 
        component={BusinessInfoEdit}
      />
    </Stack.Navigator>
  );
}
