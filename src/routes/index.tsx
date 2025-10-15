import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeStackNavigation from "./HomeStackNavigation";
import ProfileStackNavigation from "./ProfileStackNavigation";
import Splash from "../views/splash";
import TabBarNavigation from "./TabBarNavigation";
import AuthStackNavigation from "./AuthStackNavigation";

const Stack = createNativeStackNavigator();

function AppRootNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        statusBarTranslucent: true,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={Splash}
      />
      <Stack.Screen
        name="TabBarNavigation"
        component={TabBarNavigation}
      />
      <Stack.Screen
        name="AuthStackNavigation"
        component={AuthStackNavigation}
      />
    </Stack.Navigator>
  );
}

export default AppRootNavigator;
