import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerHomeScreen from './CustomerHomeScreen';
import ShopHomeScreen from './ShopHomeScreen';
import TailorDashboard from './TailorDashboard';
import ShopTailorDashboard from './ShopTailorDashboard';
import MeasurementBoyDashboard from './MeasurementBoyDashboard';

interface HomeProps {
  navigation: any;
}

export default function Home({ navigation }: HomeProps): React.JSX.Element {
  const { userRole } = useAuth();

  // Route to appropriate home screen based on user role
  switch (userRole) {
    case 'customer':
      return <CustomerHomeScreen />;
    case 'shop':
    case 'Seller':
      return <ShopHomeScreen />;
    case 'tailor':
    case 'Tailor':
      return <TailorDashboard />;
    case 'tailor_shop':
    case 'Taylorseller':
      return <ShopTailorDashboard navigation={navigation} />;
    case 'measurement_boy':
    case 'MeasurementBoy':
      return <MeasurementBoyDashboard />;
    default:
      // Default to customer home if role is not set
      return <CustomerHomeScreen />;
  }
}
