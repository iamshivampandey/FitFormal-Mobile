import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import HomeStackNavigation from './HomeStackNavigation';
import ProfileStackNavigation from './ProfileStackNavigation';
import CartStackNavigation from './CartStackNavigation';
import ShopStackNavigation from './ShopStackNavigation';
import OrdersStackNavigation from './OrdersStackNavigation';

export default function TabBarNavigation(): React.JSX.Element {
  const TabBar = createBottomTabNavigator();
  const insets = useSafeAreaInsets();
  const { userRole } = useAuth();

  // Calculate responsive tab bar height
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const commonScreenOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: Colors.whiteColor,
      borderTopWidth: 0,
      height: tabBarHeight,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
      paddingTop: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute' as 'absolute',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
    tabBarActiveTintColor: Colors.warmBrownColor,
    tabBarInactiveTintColor: Colors.blackColor,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as '600',
    },
  };

  // Customer tabs
  if (userRole === 'customer') {
    return (
      <TabBar.Navigator screenOptions={commonScreenOptions}>
        <TabBar.Screen
          name="Home"
          component={HomeStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Cart"
          component={CartStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'cart' : 'cart-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Profile"
          component={ProfileStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
      </TabBar.Navigator>
    );
  }

  // Shop Owner tabs (no tailor services)
  if (userRole === 'shop') {
    return (
      <TabBar.Navigator screenOptions={commonScreenOptions}>
        <TabBar.Screen
          name="Dashboard"
          component={HomeStackNavigation}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'grid' : 'grid-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Products"
          component={ShopStackNavigation}
          options={{
            tabBarLabel: 'Products',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'pricetags' : 'pricetags-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Orders"
          component={OrdersStackNavigation}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'receipt' : 'receipt-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Profile"
          component={ProfileStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
      </TabBar.Navigator>
    );
  }

  // Tailor tabs
  if (userRole === 'tailor') {
    return (
      <TabBar.Navigator screenOptions={commonScreenOptions}>
        <TabBar.Screen
          name="Dashboard"
          component={HomeStackNavigation}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'grid' : 'grid-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Bookings"
          component={OrdersStackNavigation}
          options={{
            tabBarLabel: 'Bookings',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'calendar' : 'calendar-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Orders"
          component={OrdersStackNavigation}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'cut' : 'cut-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Profile"
          component={ProfileStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
      </TabBar.Navigator>
    );
  }

  // Shop + Tailor tabs
  if (userRole === 'tailor_shop') {
    return (
      <TabBar.Navigator screenOptions={commonScreenOptions}>
        <TabBar.Screen
          name="Dashboard"
          component={HomeStackNavigation}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'grid' : 'grid-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Shop"
          component={ShopStackNavigation}
          options={{
            tabBarLabel: 'Shop',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'bag-handle' : 'bag-handle-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Tailoring"
          component={OrdersStackNavigation}
          options={{
            tabBarLabel: 'Tailoring',
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'cut' : 'cut-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
        <TabBar.Screen
          name="Profile"
          component={ProfileStackNavigation}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
            ),
          }}
        />
      </TabBar.Navigator>
    );
  }

  // Default to customer tabs if role is not set
  return (
    <TabBar.Navigator screenOptions={commonScreenOptions}>
      <TabBar.Screen
        name="Home"
        component={HomeStackNavigation}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
          ),
        }}
      />
      <TabBar.Screen
        name="Cart"
        component={CartStackNavigation}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Icon
              name={focused ? 'cart' : 'cart-outline'}
            size={size}
            color={focused ? Colors.warmBrownColor : Colors.grey}
          />
          ),
        }}
      />
      <TabBar.Screen
        name="Profile"
        component={ProfileStackNavigation}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={focused ? Colors.warmBrownColor : Colors.grey}
              />
          ),
        }}
      />
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
