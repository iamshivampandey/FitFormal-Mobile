import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { productImages } from '../../utils/images';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  sold: number;
  image: ImageSourcePropType;
}

interface ShopOrder {
  id: string;
  customerName: string;
  items: number;
  amount: string;
  status: 'pending' | 'processing' | 'shipped';
}

interface TailoringOrder {
  id: string;
  customerName: string;
  item: string;
  status: 'measurement_pending' | 'in_progress' | 'ready';
  deadline: string;
  amount: string;
}

interface ShopTailorDashboardProps {
  navigation?: any;
}

const ShopTailorDashboard: React.FC<ShopTailorDashboardProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'shop' | 'tailoring'>('overview');
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const stats = {
    shopOrders: 12,
    tailoringOrders: 8,
    totalEarnings: '$1,240',
    rating: 4.9,
  };

  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Cotton Shirt Fabric',
      price: '$24.99',
      stock: 45,
      sold: 120,
      image: productImages.shirt1,
    },
    {
      id: '2',
      name: 'Wool Blend Blazer Fabric',
      price: '$89.99',
      stock: 12,
      sold: 56,
      image: productImages.shirt2,
    },
    {
      id: '3',
      name: 'Formal Trouser Fabric',
      price: '$34.99',
      stock: 28,
      sold: 98,
      image: productImages.shirt3,
    },
  ];

  const shopOrders: ShopOrder[] = [
    {
      id: '1',
      customerName: 'Alice Brown',
      items: 3,
      amount: '$159.97',
      status: 'pending',
    },
    {
      id: '2',
      customerName: 'Tom Harris',
      items: 1,
      amount: '$89.99',
      status: 'processing',
    },
    {
      id: '3',
      customerName: 'Emma Wilson',
      items: 2,
      amount: '$124.98',
      status: 'shipped',
    },
  ];

  const tailoringOrders: TailoringOrder[] = [
    {
      id: '1',
      customerName: 'James Martin',
      item: 'Complete Suit',
      status: 'in_progress',
      deadline: '3 days',
      amount: '$280',
    },
    {
      id: '2',
      customerName: 'Lisa Anderson',
      item: 'Blazer Alteration',
      status: 'ready',
      deadline: 'Ready',
      amount: '$65',
    },
    {
      id: '3',
      customerName: 'Chris Taylor',
      item: 'Shirt + Trouser',
      status: 'measurement_pending',
      deadline: '5 days',
      amount: '$145',
    },
  ];

  const renderProduct = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={product.image} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        <View style={styles.productStats}>
          <Text style={styles.productStock}>Stock: {product.stock}</Text>
          <Text style={styles.productSold}>Sold: {product.sold}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShopOrder = (order: ShopOrder) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{order.customerName.charAt(0)}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderCustomerName}>{order.customerName}</Text>
          <Text style={styles.orderItems}>{order.items} items</Text>
          <View style={[
            styles.orderStatus,
            order.status === 'pending' && styles.statusPending,
            order.status === 'processing' && styles.statusProcessing,
            order.status === 'shipped' && styles.statusShipped,
          ]}>
            <Text style={styles.orderStatusText}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.orderAmount}>
          <Text style={styles.orderAmountText}>{order.amount}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTailoringOrder = (order: TailoringOrder) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{order.customerName.charAt(0)}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderCustomerName}>{order.customerName}</Text>
          <Text style={styles.orderItems}>{order.item}</Text>
          <View style={[
            styles.orderStatus,
            order.status === 'measurement_pending' && styles.statusPending,
            order.status === 'in_progress' && styles.statusProcessing,
            order.status === 'ready' && styles.statusShipped,
          ]}>
            <Text style={styles.orderStatusText}>
              {order.status === 'measurement_pending' ? 'Measurement Pending' :
               order.status === 'in_progress' ? 'In Progress' : 'Ready'}
            </Text>
          </View>
        </View>
        <View style={styles.orderAmount}>
          <Text style={styles.orderAmountText}>{order.amount}</Text>
        </View>
      </View>
      <View style={styles.tailoringFooter}>
        <Text style={styles.deadlineText}>
          {order.status === 'ready' ? '✓ Ready for pickup' : `📅 Due in ${order.deadline}`}
        </Text>
        <TouchableOpacity style={styles.updateStatusButton}>
          <Text style={styles.updateStatusText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.userName}>Shop + Tailor Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏪</Text>
            <Text style={styles.statValue}>{stats.shopOrders}</Text>
            <Text style={styles.statLabel}>Shop Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✂️</Text>
            <Text style={styles.statValue}>{stats.tailoringOrders}</Text>
            <Text style={styles.statLabel}>Tailoring Orders</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{stats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'shop' && styles.activeTab]}
            onPress={() => setSelectedTab('shop')}
          >
            <Text style={[styles.tabText, selectedTab === 'shop' && styles.activeTabText]}>
              Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'tailoring' && styles.activeTab]}
            onPress={() => setSelectedTab('tailoring')}
          >
            <Text style={[styles.tabText, selectedTab === 'tailoring' && styles.activeTabText]}>
              Tailoring
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'overview' && (
          <>
            {/* Recent Shop Orders */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Shop Orders</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {shopOrders.slice(0, 2).map(renderShopOrder)}
            </View>

            {/* Recent Tailoring Orders */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Tailoring Orders</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {tailoringOrders.slice(0, 2).map(renderTailoringOrder)}
            </View>
          </>
        )}

        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'shop' && (
          <>
            {/* Products */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Products</Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Shop', { screen: 'ProductManagement' })}
                >
                  <Text style={styles.addText}>View All →</Text>
                </TouchableOpacity>
              </View>
              {products.slice(0, 3).map(renderProduct)}
              
              <TouchableOpacity
                style={styles.manageProductsButton}
                onPress={() => navigation?.navigate('Shop', { screen: 'ProductManagement' })}
              >
                <Text style={styles.manageProductsText}>📦 Manage All Products</Text>
              </TouchableOpacity>
            </View>

            {/* Shop Orders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Shop Orders</Text>
              {shopOrders.map(renderShopOrder)}
            </View>
          </>
        )}

        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'tailoring' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Tailoring Orders</Text>
            {tailoringOrders.map(renderTailoringOrder)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation?.navigate('Shop', { screen: 'AddEditProduct', params: { mode: 'add' } })}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation?.navigate('Shop', { screen: 'ProductManagement' })}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.errorRed,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: Colors.whiteColor,
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.inputBorderColor,
  },
  activeTab: {
    borderBottomColor: Colors.warmBrownColor,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey,
  },
  activeTabText: {
    color: Colors.warmBrownColor,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.warmBrownColor,
    fontWeight: '600',
  },
  addText: {
    fontSize: 14,
    color: Colors.warmBrownColor,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warmBrownColor,
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productStock: {
    fontSize: 12,
    color: Colors.grey,
  },
  productSold: {
    fontSize: 12,
    color: Colors.grey,
  },
  editButton: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorderColor,
  },
  editButtonText: {
    color: Colors.warmBrownColor,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.whiteColor,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 8,
  },
  orderStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusProcessing: {
    backgroundColor: '#E3F2FD',
  },
  statusShipped: {
    backgroundColor: '#E8F5E9',
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  orderAmountText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warmBrownColor,
  },
  actionButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.whiteColor,
    fontSize: 14,
    fontWeight: '600',
  },
  tailoringFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.grey,
  },
  updateStatusButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  updateStatusText: {
    color: Colors.warmBrownColor,
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  manageProductsButton: {
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
  },
  manageProductsText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.whiteColor,
  },
});

export default ShopTailorDashboard;

