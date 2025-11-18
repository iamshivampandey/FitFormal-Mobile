import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import * as Images from '../../utils/images';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  sold: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

interface Stats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: string;
  lowStock: number;
}

const ShopHomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Calculate tab bar height to add bottom padding
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const stats: Stats = {
    totalProducts: 156,
    activeOrders: 23,
    totalRevenue: '$12,450',
    lowStock: 8,
  };

  const recentProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton Shirt Fabric',
      price: '$24.99',
      stock: 45,
      category: 'Shirt Fabrics',
      sold: 128,
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '$89.99',
      stock: 12,
      category: 'Blazer Fabrics',
      sold: 64,
    },
    {
      id: '3',
      name: 'Formal Trouser Fabric',
      price: '$34.99',
      stock: 8,
      category: 'Trouser Fabrics',
      sold: 95,
    },
    {
      id: '4',
      name: 'Luxury Silk Blend',
      price: '$119.99',
      stock: 22,
      category: 'Premium Fabrics',
      sold: 42,
    },
  ];

  const recentOrders: Order[] = [
    {
      id: '1',
      orderNumber: '#ORD-2045',
      customerName: 'John Smith',
      amount: '$149.99',
      status: 'processing',
      date: '2 hours ago',
    },
    {
      id: '2',
      orderNumber: '#ORD-2044',
      customerName: 'Emma Johnson',
      amount: '$89.99',
      status: 'shipped',
      date: '5 hours ago',
    },
    {
      id: '3',
      orderNumber: '#ORD-2043',
      customerName: 'Michael Brown',
      amount: '$249.99',
      status: 'delivered',
      date: '1 day ago',
    },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      default:
        return Colors.grey;
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: any, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Image source={icon} style={styles.statIconImage} />
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      <Text style={styles.productCategory}>{item.category}</Text>
      <View style={styles.productFooter}>
        <View style={styles.stockInfo}>
          <Text style={[
            styles.stockText,
            item.stock < 15 && styles.lowStockText
          ]}>
            Stock: {item.stock}
          </Text>
        </View>
        <Text style={styles.soldText}>Sold: {item.sold}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderOrder = (order: Order) => (
    <TouchableOpacity key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.customerName}>{order.customerName}</Text>
        </View>
        <Text style={styles.orderAmount}>{order.amount}</Text>
      </View>
      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const openAddProduct = () => {
    const parentNavigator = navigation.getParent();

    if (parentNavigator) {
      // Navigate to Products tab and open AddEditProduct screen
      parentNavigator.navigate('Products' as never, {
        screen: 'AddEditProduct',
        params: { mode: 'add' },
      } as never);
    } else {
      // Fallback in case parent navigator is not available
      navigation.navigate('AddEditProduct' as never);
    }
  };

  const openOrdersTab = () => {
    const parentNavigator = navigation.getParent();

    if (parentNavigator) {
      parentNavigator.navigate('Orders' as never);
    }
  };

  const openAnalytics = () => {
    navigation.navigate('Analytics' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              {/* <Text style={styles.greeting}>Welcome Back!</Text> */}
              <Text style={styles.shopName}>Fit Formal</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Image source={Images.person_icon} style={styles.profileIconImage} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, orders..."
              placeholderTextColor={Colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Image source={Images.search_icon} style={styles.searchIconImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Products', stats.totalProducts, Images.shopping_bag, Colors.warmBrownColor)}
            {renderStatCard('Active Orders', stats.activeOrders, Images.shopping_cart_icon, '#2196F3')}
            {renderStatCard('Revenue', stats.totalRevenue, Images.revenue_icon, '#4CAF50')}
            {renderStatCard('Low Stock', stats.lowStock, Images.security_icon, '#FF9800')}
          </View>
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={openAddProduct}>
              <Image source={Images.add_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={openOrdersTab}>
              <Image source={Images.shopping_cart_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>View Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} onPress={openAnalytics}>
              <Image source={Images.dashboard_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Manage All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={openOrdersTab}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map(renderOrder)}
        </View>

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <Image source={Images.dashboard_icon} style={styles.insightIconImage} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Sales Trending Up</Text>
              <Text style={styles.insightText}>
                Your sales have increased by 23% this week compared to last week
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Image source={Images.shopping_bag} style={styles.insightIconImage} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Popular Category</Text>
              <Text style={styles.insightText}>
                Shirt Fabrics are your best-selling category with 45% of total sales
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: Colors.whiteColor,
  },
  profileIconImage: {
    width: 22,
    height: 22,
    tintColor: Colors.whiteColor,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: Colors.grey,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.warmBrownColor,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  statCard: {
    width: width / 2 - 25,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    margin: 5,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconImage: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: Colors.warmBrownColor,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    rowGap: 12,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    minWidth: 0,
    flexBasis: '30%',
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionIconImage: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: Colors.warmBrownColor,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  productsList: {
    paddingHorizontal: 15,
  },
  productCard: {
    width: width * 0.42,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warmBrownColor,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  lowStockText: {
    color: '#FF9800',
  },
  soldText: {
    fontSize: 12,
    color: Colors.grey,
  },
  orderCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warmBrownColor,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warmBrownColor,
  },
  insightIconImage: {
    width: 32,
    height: 32,
    marginRight: 15,
    tintColor: Colors.warmBrownColor,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default ShopHomeScreen;

