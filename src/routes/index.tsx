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
    <Stack.Navigator initialRouteName="Splash" >
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabBarNavigation"
        component={TabBarNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AuthStackNavigation"
        component={AuthStackNavigation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default AppRootNavigator;
