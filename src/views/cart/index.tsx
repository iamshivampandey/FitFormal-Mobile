import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';
import {
  GILROY_SEMIBOLD,
  GILROY_REGULAR,
  GILROY_BOLD,
  GILROY_MEDIUM,
} from '../../utils/fonts';
import CustomButton from '../../components/CustomButton';
import * as Images from '../../utils/images';

type CartItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: any;
};

// Temporary mock data – replace with real cart data when backend/state is ready
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    title: 'Premium Navy Suit Fabric',
    description: 'Super 120s wool • 3.5m • Tailor stitching included',
    price: 4999,
    originalPrice: 5499,
    quantity: 1,
    image: (Images as any).product_placeholder,
  },
  {
    id: '2',
    title: 'Classic White Shirt Fabric',
    description: 'Egyptian cotton • 2.5m • Tailor stitching',
    price: 1899,
    quantity: 2,
    image: (Images as any).product_placeholder,
  },
];

export default function Cart(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height to add bottom padding
  const tabBarHeight = Platform.OS === 'ios' ? 65 + insets.bottom : 70;

  const hasItems = MOCK_CART_ITEMS.length > 0;

  const totals = useMemo(() => {
    if (!hasItems) {
      return {
        subtotal: 0,
        delivery: 0,
        savings: 0,
        total: 0,
      };
    }

    const subtotal = MOCK_CART_ITEMS.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const originalTotal = MOCK_CART_ITEMS.reduce((sum, item) => {
      const basePrice = item.originalPrice ?? item.price;
      return sum + basePrice * item.quantity;
    }, 0);

    const savings = originalTotal - subtotal;
    const delivery = subtotal > 0 ? 99 : 0; // flat demo delivery fee

    return {
      subtotal,
      delivery,
      savings: savings > 0 ? savings : 0,
      total: subtotal + delivery,
    };
  }, [hasItems]);

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardImageWrapper}>
          {item.image ? (
            <Image source={item.image} style={styles.cardImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>FF</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <TouchableOpacity>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooterRow}>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>₹{item.price}</Text>
                {item.originalPrice && item.originalPrice > item.price && (
                  <Text style={styles.originalPriceText}>
                    ₹{item.originalPrice}
                  </Text>
                )}
              </View>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.offerText}>
                  You save ₹{item.originalPrice - item.price}
                </Text>
              )}
            </View>

            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.qtyButton}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyButton}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Text style={styles.emptyIcon}>🛒</Text>
      </View>
      <Text style={styles.emptyTitle}>Your cart is feeling light</Text>
      <Text style={styles.emptySubtitle}>
        Browse premium fabrics and formal wear, then add your favourites here to
        continue.
      </Text>
      <CustomButton
        title="Start shopping"
        onPress={() => {}}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.content, { paddingBottom: tabBarHeight + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Cart</Text>
            <Text style={styles.subtitle}>
              {hasItems
                ? `${MOCK_CART_ITEMS.length} item${
                    MOCK_CART_ITEMS.length > 1 ? 's' : ''
                  } in your cart`
                : 'No items yet – let’s find you something sharp.'}
            </Text>
          </View>
        </View>

        {/* Cart list / empty state */}
        <View style={styles.listContainer}>
          {hasItems ? (
            <FlatList
              data={MOCK_CART_ITEMS}
              keyExtractor={item => item.id}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Summary + Checkout */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totals.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {totals.delivery === 0 ? 'Free' : `₹${totals.delivery}`}
            </Text>
          </View>
          {totals.savings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.savingsLabel]}>
                Savings
              </Text>
              <Text style={[styles.summaryValue, styles.savingsValue]}>
                -₹{totals.savings}
              </Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>₹{totals.total}</Text>
          </View>

          <CustomButton
            title={hasItems ? 'Proceed to checkout' : 'Browse products'}
            onPress={() => {}}
            style={styles.checkoutButton}
          />

          <Text style={styles.summaryHint}>
            Prices include tailoring where applicable. You’ll confirm delivery
            slot and measurements in the next step.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: GILROY_BOLD,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  listContainer: {
    flex: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImageWrapper: {
    marginRight: 12,
  },
  cardImage: {
    width: 72,
    height: 90,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 72,
    height: 90,
    borderRadius: 12,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 20,
    fontFamily: GILROY_SEMIBOLD,
    color: Colors.warmBrownColor,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: GILROY_SEMIBOLD,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  removeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontFamily: GILROY_BOLD,
    color: Colors.textPrimary,
    marginRight: 6,
  },
  originalPriceText: {
    fontSize: 13,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    fontFamily: GILROY_REGULAR,
  },
  offerText: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.successGreen,
    fontFamily: GILROY_MEDIUM,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  qtyButtonText: {
    fontSize: 16,
    fontFamily: GILROY_BOLD,
    color: Colors.textPrimary,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: GILROY_SEMIBOLD,
    color: Colors.textPrimary,
  },
  itemSeparator: {
    height: 14,
  },
  summaryCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  summaryValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  savingsLabel: {
    color: Colors.successGreen,
  },
  savingsValue: {
    color: Colors.successGreen,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontFamily: GILROY_SEMIBOLD,
    color: Colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontFamily: GILROY_BOLD,
    color: Colors.warmBrownColor,
  },
  checkoutButton: {
    marginTop: 12,
    width: '100%',
    alignSelf: 'center',
  },
  summaryHint: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: GILROY_BOLD,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: GILROY_REGULAR,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    width: '100%',
  },
});
