import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import * as Images from '../../utils/images';

const { width } = Dimensions.get('window');

interface MeasurementRequest {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'accepted' | 'completed';
}

const MeasurementBoyDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'requests' | 'completed'>('overview');
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const todayStats = {
    appointments: 5,
    completed: 3,
    earnings: '$120',
    rating: 4.9,
  };

  const measurementRequests: MeasurementRequest[] = [
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
    {
      id: '4',
      customerName: 'John Smith',
      service: 'Complete Suit Measurement',
      date: 'Oct 16',
      time: '11:00 AM',
      address: '321 Elm St, Unit 8',
      status: 'completed',
    },
  ];

  const renderMeasurementRequest = (request: MeasurementRequest) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{request.customerName.charAt(0)}</Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.customerName}>{request.customerName}</Text>
          <Text style={styles.serviceType}>{request.service}</Text>
          <Text style={styles.requestTime}>📅 {request.date} at {request.time}</Text>
          <Text style={styles.requestAddress} numberOfLines={1}>📍 {request.address}</Text>
        </View>
      </View>
      {request.status === 'pending' ? (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : request.status === 'accepted' ? (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedBadgeText}>✓ Accepted - Ready to Visit</Text>
        </View>
      ) : (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✓ Completed</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.userName}>Measurement Boy Dashboard</Text>
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
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statValue}>{todayStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Image source={Images.revenue_icon} style={styles.statIconImage} />
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
            style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
            onPress={() => setSelectedTab('requests')}
          >
            <Text style={[styles.tabText, selectedTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Pending Measurement Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {measurementRequests.filter(r => r.status === 'pending').slice(0, 2).map(renderMeasurementRequest)}
            </View>

            {/* Accepted Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Accepted Requests</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {measurementRequests.filter(r => r.status === 'accepted').slice(0, 2).map(renderMeasurementRequest)}
            </View>
          </>
        )}

        {selectedTab === 'requests' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Measurement Requests</Text>
            {measurementRequests.filter(r => r.status !== 'completed').map(renderMeasurementRequest)}
          </View>
        )}

        {selectedTab === 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Measurements</Text>
            {measurementRequests.filter(r => r.status === 'completed').map(renderMeasurementRequest)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Image source={Images.revenue_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Image source={Images.gear_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Image source={Images.dashboard_icon} style={styles.quickActionIconImage} />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
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
  statIconImage: {
    width: 32,
    height: 32,
    marginBottom: 10,
    tintColor: Colors.warmBrownColor,
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
  requestCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  requestHeader: {
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
  requestInfo: {
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
  requestTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  requestAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  requestActions: {
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
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  completedBadgeText: {
    color: '#2E7D32',
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
  quickActionIconImage: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: Colors.warmBrownColor,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default MeasurementBoyDashboard;

