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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';

const { width } = Dimensions.get('window');

interface BookingRequest {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'accepted' | 'completed';
}

interface Order {
  id: string;
  customerName: string;
  item: string;
  status: 'in_progress' | 'ready' | 'delivered';
  deadline: string;
  amount: string;
}

const TailorDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bookings' | 'orders'>('overview');
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const todayStats = {
    appointments: 3,
    activeOrders: 5,
    earnings: '$450',
    rating: 4.8,
  };

  const bookingRequests: BookingRequest[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      service: 'Suit Measurement',
      date: 'Today',
      time: '2:00 PM',
      address: '123 Main St, Apt 4B',
      status: 'pending',
    },
    {
      id: '2',
      customerName: 'Mike Wilson',
      service: 'Shirt & Trouser Measurement',
      date: 'Tomorrow',
      time: '10:00 AM',
      address: '456 Oak Ave, House 12',
      status: 'pending',
    },
    {
      id: '3',
      customerName: 'Emily Davis',
      service: 'Blazer Measurement',
      date: 'Oct 15',
      time: '4:30 PM',
      address: '789 Pine Rd, Suite 5',
      status: 'accepted',
    },
  ];

  const activeOrders: Order[] = [
    {
      id: '1',
      customerName: 'John Smith',
      item: 'Complete Suit',
      status: 'in_progress',
      deadline: '2 days',
      amount: '$250',
    },
    {
      id: '2',
      customerName: 'Robert Brown',
      item: 'Formal Shirt',
      status: 'ready',
      deadline: 'Ready',
      amount: '$45',
    },
    {
      id: '3',
      customerName: 'David Lee',
      item: 'Blazer',
      status: 'in_progress',
      deadline: '5 days',
      amount: '$120',
    },
  ];

  const renderBookingRequest = (booking: BookingRequest) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{booking.customerName.charAt(0)}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.customerName}>{booking.customerName}</Text>
          <Text style={styles.serviceType}>{booking.service}</Text>
          <Text style={styles.bookingTime}>📅 {booking.date} at {booking.time}</Text>
          <Text style={styles.bookingAddress} numberOfLines={1}>📍 {booking.address}</Text>
        </View>
      </View>
      {/* eslint-disable-next-line react/jsx-no-literals */}
      {booking.status === 'pending' ? (
        <View style={styles.bookingActions}>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedBadgeText}>✓ Accepted</Text>
        </View>
      )}
    </View>
  );

  const renderOrder = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderCustomerName}>{order.customerName}</Text>
          <Text style={styles.orderItem}>{order.item}</Text>
        </View>
        <View style={styles.orderAmount}>
          <Text style={styles.orderAmountText}>{order.amount}</Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <View style={[
          styles.orderStatus,
          order.status === 'ready' ? styles.orderStatusReady : styles.orderStatusInProgress
        ]}>
          <Text style={[
            styles.orderStatusText,
            order.status === 'ready' ? styles.orderStatusTextReady : styles.orderStatusTextInProgress
          ]}>
            {order.status === 'ready' ? '✓ Ready' : '⏱ In Progress'}
          </Text>
        </View>
        <Text style={styles.orderDeadline}>
          {order.status === 'ready' ? 'Ready for pickup' : `Due in ${order.deadline}`}
        </Text>
      </View>
      <TouchableOpacity style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Status</Text>
      </TouchableOpacity>
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
            <Text style={styles.userName}>Tailor Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{todayStats.appointments}</Text>
            <Text style={styles.statLabel}>Today's Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✂️</Text>
            <Text style={styles.statValue}>{todayStats.activeOrders}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{todayStats.earnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{todayStats.rating}</Text>
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
            style={[styles.tab, selectedTab === 'bookings' && styles.activeTab]}
            onPress={() => setSelectedTab('bookings')}
          >
            <Text style={[styles.tabText, selectedTab === 'bookings' && styles.activeTabText]}>
              Bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'orders' && styles.activeTab]}
            onPress={() => setSelectedTab('orders')}
          >
            <Text style={[styles.tabText, selectedTab === 'orders' && styles.activeTabText]}>
              Orders
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'overview' && (
          <>
            {/* Pending Booking Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {/* eslint-disable-next-line react/jsx-no-literals */}
              {bookingRequests.filter(b => b.status === 'pending').slice(0, 2).map(renderBookingRequest)}
            </View>

            {/* Active Orders */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Orders</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {activeOrders.slice(0, 2).map(renderOrder)}
            </View>
          </>
        )}

        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'bookings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Booking Requests</Text>
            {bookingRequests.map(renderBookingRequest)}
          </View>
        )}

        {/* eslint-disable-next-line react/jsx-no-literals */}
        {selectedTab === 'orders' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Orders</Text>
            {activeOrders.map(renderOrder)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>My Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionText}>Settings</Text>
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
    fontSize: 24,
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
  bookingCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 15,
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
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 6,
  },
  bookingTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bookingAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  acceptButtonText: {
    color: Colors.whiteColor,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  rejectButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptedBadge: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  acceptedBadgeText: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCustomerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  orderItem: {
    fontSize: 14,
    color: Colors.grey,
  },
  orderAmount: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warmBrownColor,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderStatusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  orderStatusReady: {
    backgroundColor: '#E8F5E9',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderStatusTextInProgress: {
    color: '#F57C00',
  },
  orderStatusTextReady: {
    color: '#2E7D32',
  },
  orderDeadline: {
    fontSize: 12,
    color: Colors.grey,
  },
  updateButton: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warmBrownColor,
  },
  updateButtonText: {
    color: Colors.warmBrownColor,
    fontSize: 14,
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
});

export default TailorDashboard;

