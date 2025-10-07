import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from '../views/auth/SignIn';
import SignUp from '../views/auth/SignUp';

const Stack = createNativeStackNavigator();

export default function AuthStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}
