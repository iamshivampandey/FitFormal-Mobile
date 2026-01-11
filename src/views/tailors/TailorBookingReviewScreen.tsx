import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_MEDIUM, GILROY_REGULAR, GILROY_SEMIBOLD } from '../../utils/fonts';
import CustomButton from '../../components/CustomButton';
import StorageService from '../../services/storage.service';
import { createOrder } from '../../utils/api/createOrderApi';

type AddressType = 'Home' | 'Work' | 'Office';

type DeliveryAddress = {
  id: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType;
  googleMapLink?: string;
};

type SelectedItem = {
  TailorItemPriceId?: number;
  ItemId?: number;
  Name?: string;
  FullPrice?: number;
  DiscountPrice?: number;
  DiscountType?: string;
  DiscountValue?: number;
  EstimatedDays?: number;
  quantity: number;
};

interface Props {
  navigation: any;
  route: any;
}

const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDisplayDateLong = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const dayName = DAYS_LONG[date.getDay()];
  return `${dayName}, ${month} ${day}, ${year}`;
};

const ITEM_NAME_FALLBACK = 'Tailoring Item';

export default function TailorBookingReviewScreen({ navigation, route }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {
    businessId,
    tailorName,
    selectedItems,
    selectedDate,
    selectedSlotId,
    measurementAddressId,
    deliveryAddressId,
  } = route.params || {};

  const [measurementAddress, setMeasurementAddress] = useState<DeliveryAddress | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [items, setItems] = useState<SelectedItem[]>(Array.isArray(selectedItems) ? selectedItems : []);
  const [notes, setNotes] = useState<string>(`Order for ${tailorName || 'Tailor'}`);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await StorageService.getDeliveryAddresses();
        if (!raw) return;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const list = Array.isArray(parsed) ? parsed : [];
        const foundMeasurement = list.find((a: DeliveryAddress) => a.id === measurementAddressId);
        const foundDelivery = list.find((a: DeliveryAddress) => a.id === deliveryAddressId);
        setMeasurementAddress(foundMeasurement || null);
        setDeliveryAddress(foundDelivery || null);
      } catch (e) {
        setMeasurementAddress(null);
        setDeliveryAddress(null);
      }
    })();
  }, [measurementAddressId, deliveryAddressId]);

  const calculateFinalPrice = (item: SelectedItem): number => {
    const full = Number(item.FullPrice || 0);
    const discount = Number(item.DiscountPrice || 0);
    const type = String(item.DiscountType || '').toLowerCase();
    if (type === 'percentage') {
      return full - (full * discount) / 100;
    }
    return full - discount;
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + Number(it.FullPrice || 0) * Number(it.quantity || 0), 0);
    const finalTotal = items.reduce((sum, it) => sum + calculateFinalPrice(it) * Number(it.quantity || 0), 0);
    const totalDiscount = subtotal - finalTotal;
    return {
      subtotal,
      totalDiscount: totalDiscount > 0 ? totalDiscount : 0,
      totalAmount: finalTotal,
      totalQty: items.reduce((sum, it) => sum + Number(it.quantity || 0), 0),
    };
  }, [items]);

  const deliveryDateIso = useMemo(() => {
    if (!selectedDate) return new Date().toISOString();
    const base = new Date(selectedDate + 'T00:00:00');
    const maxDays = items.reduce((m, it) => Math.max(m, Number(it.EstimatedDays || 0)), 0) || 7;
    base.setDate(base.getDate() + maxDays);
    base.setHours(23, 59, 59, 999);
    return base.toISOString();
  }, [selectedDate, items]);

  const measurementDateIso = useMemo(() => {
    if (!selectedDate) return new Date().toISOString();
    return new Date(selectedDate + 'T00:00:00').toISOString();
  }, [selectedDate]);

  const itemCountLabel = useMemo(() => {
    const n = totals.totalQty;
    return `${n} item${n === 1 ? '' : 's'}`;
  }, [totals.totalQty]);

  const updateQty = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      const newQty = Number(current.quantity || 0) + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
        return next;
      }
      next[index] = { ...current, quantity: newQty };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getCustomerId = async (): Promise<number | null> => {
    try {
      const raw = await StorageService.getUser();
      if (!raw) return null;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const id = parsed?.user?.id ?? parsed?.id ?? parsed?.userId ?? null;
      return id ? Number(id) : null;
    } catch (e) {
      return null;
    }
  };

  const handleConfirmOrder = async () => {
    if (!measurementAddressId || !deliveryAddressId) {
      Alert.alert('Missing Address', 'Please select both measurement and delivery addresses.');
      return;
    }
    if (!items.length) {
      Alert.alert('No Items', 'Please add at least one item to continue.');
      return;
    }
    const customerId = await getCustomerId();
    if (!customerId) {
      Alert.alert('Login Required', 'Customer ID not found. Please login again.');
      return;
    }

    const payload = {
      customerId: customerId,
      orderDate: new Date().toISOString(),
      orderType: 'Tailoring',
      paymentStatus: 'Pending',
      advancePaid: 0,
      notes: `${notes}${selectedSlotId ? ` | Measurement Slot: ${selectedSlotId}` : ''}`,
      measurementAddressId: String(measurementAddressId),
      measurementAddressType: 'Measurement',
      deliveryAddressId: String(deliveryAddressId),
      deliveryAddressType: 'Delivery',
      deliveryDate: deliveryDateIso,
      totalAmount: totals.totalAmount,
      orderItems: items.map((it, idx) => ({
        itemType: 'Custom Tailoring',
        productCode: `ITEM-${it.ItemId ?? idx + 1}`,
        description: it.Name || ITEM_NAME_FALLBACK,
        shopId: null,
        tailorId: businessId ?? null,
        quantity: it.quantity,
        unit: null,
        unitPrice: calculateFinalPrice(it),
        amount: calculateFinalPrice(it) * Number(it.quantity || 0),
        status: 'Pending',
        notes: null,
        measurementDate: measurementDateIso,
        measurementSlot: selectedSlotId || null,
        stitchingDate: null,
      })),
    };

    try {
      console.log('Create order payload:', payload);
      setSubmitting(true);
      const response = await createOrder(payload);
      Alert.alert('Order Confirmed', 'Your order has been submitted successfully.');
      console.log('Create order response:', response?.data);
      navigation.popToTop();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to submit order. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Tailor</Text>
            <View style={styles.pill}>
              <Icon name="cut-outline" size={14} color={Colors.warmBrownColor} />
              <Text style={styles.pillText}>Tailoring</Text>
            </View>
          </View>
          <Text style={styles.cardValue}>{tailorName || 'Tailor'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Measurement Date</Text>
          <Text style={styles.cardValue}>{selectedDate ? formatDisplayDateLong(selectedDate) : '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Measurement Slot</Text>
          <Text style={styles.cardValue}>{selectedSlotId || '-'}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Addresses</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Measurement Address</Text>
          {measurementAddress ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.addrName}>{measurementAddress.fullName}</Text>
              <Text style={styles.addrPhone}>
                {measurementAddress.alternatePhone
                  ? `${measurementAddress.phoneNumber} / ${measurementAddress.alternatePhone}`
                  : measurementAddress.phoneNumber}
              </Text>
              <Text style={styles.addrLine}>{measurementAddress.addressLine1}</Text>
              <Text style={styles.addrLine}>
                {measurementAddress.city}, {measurementAddress.state} - {measurementAddress.pincode}
              </Text>
            </View>
          ) : (
            <Text style={styles.cardSubtle}>Address not found</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          {deliveryAddress ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.addrName}>{deliveryAddress.fullName}</Text>
              <Text style={styles.addrPhone}>
                {deliveryAddress.alternatePhone
                  ? `${deliveryAddress.phoneNumber} / ${deliveryAddress.alternatePhone}`
                  : deliveryAddress.phoneNumber}
              </Text>
              <Text style={styles.addrLine}>{deliveryAddress.addressLine1}</Text>
              <Text style={styles.addrLine}>
                {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
              </Text>
            </View>
          ) : (
            <Text style={styles.cardSubtle}>Address not found</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <Text style={styles.sectionSubtitle}>{itemCountLabel} selected • edit anytime</Text>
        </View>

        {items.map((it, idx) => {
          const name = it.Name || ITEM_NAME_FALLBACK;
          const full = Number(it.FullPrice || 0);
          const unit = calculateFinalPrice(it);
          const qty = Number(it.quantity || 0);
          const lineTotal = unit * qty;
          const hasDiscount = unit < full;
          return (
            <View key={`${it.ItemId ?? idx}`} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {name}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    <Text style={styles.itemMeta}>Code: ITEM-{it.ItemId ?? idx + 1}</Text>
                    {it.EstimatedDays ? (
                      <Text style={styles.itemMeta}>• ETA {it.EstimatedDays}d</Text>
                    ) : null}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{unit.toFixed(2)}</Text>
                    {hasDiscount && <Text style={styles.itemPriceStrike}>₹{full.toFixed(2)}</Text>}
                    {hasDiscount && (
                      <View style={styles.discountPill}>
                        <Text style={styles.discountPillText}>SAVE</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.qtyBlock}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(idx, -1)}
                      activeOpacity={0.7}
                    >
                      <Icon name="remove" size={16} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(idx, 1)}
                      activeOpacity={0.7}
                    >
                      <Icon name="add" size={16} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemLineTotal}>₹{lineTotal.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeItem(idx)}
                activeOpacity={0.7}
              >
                <Icon name="trash-outline" size={14} color={Colors.errorRed} />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{totals.subtotal.toFixed(2)}</Text>
          </View>
          {totals.totalDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.totalValue, styles.discountValue]}>
                -₹{totals.totalDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelFinal}>Total Amount</Text>
            <Text style={styles.totalValueFinal}>₹{totals.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomAction}>
        <CustomButton
          title="Confirm Order"
          onPress={handleConfirmOrder}
          loading={submitting}
          disabled={submitting || items.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  card: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
  },
  cardValue: {
    marginTop: 6,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  cardSubtle: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBF5EE',
  },
  pillText: {
    marginLeft: 4,
    fontSize: 11,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_SEMIBOLD,
  },
  addrName: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  addrPhone: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.grey,
    fontFamily: GILROY_MEDIUM,
  },
  addrLine: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_REGULAR,
  },
  itemCard: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemName: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  itemMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMeta: {
    fontSize: 11,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
    marginRight: 6,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  itemPriceStrike: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    fontFamily: GILROY_REGULAR,
  },
  discountPill: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  discountPillText: {
    fontSize: 9,
    color: Colors.whiteColor,
    fontFamily: GILROY_BOLD,
  },
  qtyBlock: {
    alignItems: 'flex-end',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  itemLineTotal: {
    marginTop: 8,
    fontSize: 15,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  removeBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  removeBtnText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.errorRed,
    fontFamily: GILROY_MEDIUM,
  },
  totalCard: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  totalValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  discountLabel: {
    color: Colors.successGreen,
  },
  discountValue: {
    color: Colors.successGreen,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  totalLabelFinal: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  totalValueFinal: {
    fontSize: 20,
    color: Colors.warmBrownColor,
    fontFamily: GILROY_BOLD,
  },
  bottomSpacer: { height: 140 },
  bottomAction: {
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 120,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});

