import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FindTailorsScreen from '../views/tailors/FindTailorsScreen';
import TailorDetailScreen from '../views/tailors/TailorDetailScreen';
import SelectClothesScreen from '../views/tailors/SelectClothesScreen';
import DateSelectionScreen from '../views/tailors/DateSelectionScreen';
import TailorBookingReviewScreen from '../views/tailors/TailorBookingReviewScreen';

export type TailorsStackParamList = {
  FindTailors: undefined;
  TailorDetail: { businessId: number };
  SelectClothes: { businessId: number; tailorName: string; tailorItemPrices: string };
  DateSelection: { businessId: number; tailorName: string; selectedItems: any[] };
  TailorBookingReview: {
    businessId: number;
    tailorName?: string;
    selectedItems?: any[];
    selectedDate: string;
    selectedSlotId: string;
    measurementAddressId: string;
    deliveryAddressId: string;
  };
};

const Stack = createNativeStackNavigator<TailorsStackParamList>();

export default function TailorsStackNavigation(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FindTailors" component={FindTailorsScreen} />
      <Stack.Screen name="TailorDetail" component={TailorDetailScreen} />
      <Stack.Screen name="SelectClothes" component={SelectClothesScreen} />
      <Stack.Screen name="DateSelection" component={DateSelectionScreen} />
      <Stack.Screen name="TailorBookingReview" component={TailorBookingReviewScreen} />
    </Stack.Navigator>
  );
}

