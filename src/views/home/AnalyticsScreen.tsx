import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR } from '../../utils/fonts';
import * as Images from '../../utils/images';

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image source={Images.arrow_left} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today&apos;s Revenue</Text>
            <Text style={styles.summaryValue}>₹12,450</Text>
            <Text style={styles.summaryDeltaPositive}>+18% vs yesterday</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active Orders</Text>
            <Text style={styles.summaryValue}>23</Text>
            <Text style={styles.summaryDeltaNeutral}>6 pending dispatch</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Conversion Rate</Text>
            <Text style={styles.summaryValue}>4.7%</Text>
            <Text style={styles.summaryDeltaPositive}>+0.9% this week</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Repeat Customers</Text>
            <Text style={styles.summaryValue}>38%</Text>
            <Text style={styles.summaryDeltaPositive}>Growing steadily</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Trend (Last 7 days)</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartPlaceholder}>
              Chart placeholder – plug in your analytics data here
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Categories</Text>
          <View style={styles.listCard}>
            <View style={styles.listRow}>
              <Text style={styles.listLabel}>Shirt Fabrics</Text>
              <Text style={styles.listValue}>45% of sales</Text>
            </View>
            <View style={styles.listRow}>
              <Text style={styles.listLabel}>Suit Sets</Text>
              <Text style={styles.listValue}>27% of sales</Text>
            </View>
            <View style={styles.listRow}>
              <Text style={styles.listLabel}>Blazer Fabrics</Text>
              <Text style={styles.listValue}>18% of sales</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          <View style={styles.insightCard}>
            <Image source={Images.dashboard_icon} style={styles.insightIcon} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Evening peak hours</Text>
              <Text style={styles.insightText}>
                Most orders are placed between 7 pm and 10 pm. Consider running offers in this window.
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Image source={Images.shopping_bag} style={styles.insightIcon} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Best performing bundle</Text>
              <Text style={styles.insightText}>
                Navy suit + white shirt combo has a 2.4x higher conversion than other bundles.
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputBackground,
    marginRight: 12,
    transform: [{ rotate: '180deg' }],
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.textPrimary,
  },
  title: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 4,
  },
  summaryDeltaPositive: {
    fontSize: 12,
    color: Colors.successGreen,
    fontFamily: GILROY_SEMIBOLD,
  },
  summaryDeltaNeutral: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  listLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
  },
  listValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorderColor,
    marginBottom: 10,
  },
  insightIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.warmBrownColor,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    lineHeight: 18,
  },
});

export default AnalyticsScreen;


