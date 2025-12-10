import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: string;
  status: OrderStatus;
  date: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-2045',
    customerName: 'John Smith',
    amount: '₹14,999',
    status: 'processing',
    date: '2 hours ago',
  },
  {
    id: '2',
    orderNumber: '#ORD-2044',
    customerName: 'Emma Johnson',
    amount: '₹8,999',
    status: 'shipped',
    date: '5 hours ago',
  },
  {
    id: '3',
    orderNumber: '#ORD-2043',
    customerName: 'Michael Brown',
    amount: '₹24,999',
    status: 'delivered',
    date: '1 day ago',
  },
];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'processing':
      return '#3B82F6';
    case 'shipped':
      return '#8B5CF6';
    case 'delivered':
      return '#10B981';
    default:
      return Colors.grey;
  }
};

const OrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track and manage your customer orders</Text>
        </View>

        <View style={styles.filterRow}>
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(label => (
            <TouchableOpacity key={label} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.ordersSection}>
          {MOCK_ORDERS.map(order => {
            const color = getStatusColor(order.status);
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                  </View>
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                </View>
                <View style={styles.orderFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.statusText, { color }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.inputBackground,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
  },
  ordersSection: {
    rowGap: 10,
  },
  orderCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  customerName: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  orderAmount: {
    fontSize: 18,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontFamily: GILROY_SEMIBOLD,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
});

export default OrdersScreen;


