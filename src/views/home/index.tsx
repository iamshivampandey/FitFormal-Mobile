import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerHomeScreen from './CustomerHomeScreen';
import ShopHomeScreen from './ShopHomeScreen';
import TailorDashboard from './TailorDashboard';
import ShopTailorDashboard from './ShopTailorDashboard';

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
      return <ShopHomeScreen />;
    case 'tailor':
      return <TailorDashboard />;
    case 'tailor_shop':
      return <ShopTailorDashboard navigation={navigation} />;
    default:
      // Default to customer home if role is not set
      return <CustomerHomeScreen />;
  }
}
