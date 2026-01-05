import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/colors';
import { GILROY_BOLD, GILROY_SEMIBOLD, GILROY_REGULAR, GILROY_MEDIUM } from '../../utils/fonts';

interface TailorItem {
  TailorItemPriceId: number;
  ItemId: number;
  Name: string;
  FullPrice: number;
  DiscountPrice: number;
  DiscountType: string;
  DiscountValue: number;
  EstimatedDays: number;
  IsAvailable: boolean;
}

interface SelectedItem extends TailorItem {
  quantity: number;
}

interface SelectClothesScreenProps {
  navigation: any;
  route: any;
}

const SelectClothesScreen: React.FC<SelectClothesScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { businessId, tailorName, tailorItemPrices } = route.params || {};
  
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(new Map());
  
  useEffect(() => {
    console.log('selectedItems size:', selectedItems.size);
    console.log('selectedItems entries:', Array.from(selectedItems.entries()));
  }, [selectedItems]);
  // Parse tailor items
  const availableItems: TailorItem[] = useMemo(() => {
    if (!tailorItemPrices) {
      console.log('No tailorItemPrices provided');
      return [];
    }
    try {
      const parsed = typeof tailorItemPrices === 'string' 
        ? JSON.parse(tailorItemPrices) 
        : tailorItemPrices;
      const items = Array.isArray(parsed) ? parsed : [];
      console.log('Parsed available items:', items.length, 'items');
      console.log('Items:', items.map(i => ({ ItemId: i.ItemId, Name: i.Name, IsAvailable: i.IsAvailable })));
      return items;
    } catch (e) {
      console.error('Error parsing tailor items:', e);
      return [];
    }
  }, [tailorItemPrices]);

  // Calculate final price after discount
  const calculateFinalPrice = (item: TailorItem): number => {
    if (item.DiscountType === 'percentage') {
      return item.FullPrice - (item.FullPrice * item.DiscountPrice / 100);
    } else {
      return item.FullPrice - item.DiscountPrice;
    }
  };

  // Toggle item selection (add or remove completely)
  const handleToggleItem = (item: TailorItem) => {
    console.log('handleToggleItem called for item:', item.Name, 'ItemId:', item.ItemId);
    const newSelected = new Map(selectedItems);
    
    if (newSelected.has(item.ItemId)) {
      // If already selected, remove it
      console.log('Removing item:', item.ItemId);
      newSelected.delete(item.ItemId);
    } else {
      // If not selected, add it with quantity 1
      console.log('Adding item:', item.ItemId);
      newSelected.set(item.ItemId, {
        ...item,
        quantity: 1,
      });
    }
    
    console.log('New selected size:', newSelected.size);
    setSelectedItems(newSelected);
  };

  // Increment quantity
  const handleIncrementQuantity = (itemId: number) => {
    const newSelected = new Map(selectedItems);
    const existing = newSelected.get(itemId);
    
    if (existing) {
      newSelected.set(itemId, {
        ...existing,
        quantity: existing.quantity + 1,
      });
      setSelectedItems(newSelected);
    }
  };

  // Decrement quantity
  const handleDecrementQuantity = (itemId: number) => {
    const newSelected = new Map(selectedItems);
    const existing = newSelected.get(itemId);
    
    if (existing && existing.quantity > 1) {
      newSelected.set(itemId, {
        ...existing,
        quantity: existing.quantity - 1,
      });
    } else {
      newSelected.delete(itemId);
    }
    
    setSelectedItems(newSelected);
  };

  // Delete item completely
  const handleDeleteItem = (itemId: number) => {
    const newSelected = new Map(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  };

  // Calculate totals
  const { subtotal, totalDiscount, totalItems } = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    selectedItems.forEach((item) => {
      const itemSubtotal = item.FullPrice * item.quantity;
      const itemFinalPrice = calculateFinalPrice(item) * item.quantity;
      subtotal += itemSubtotal;
      totalDiscount += (itemSubtotal - itemFinalPrice);
      totalItems += item.quantity;
    });

    return { subtotal, totalDiscount, totalItems };
  }, [selectedItems]);

  const platformFee = 20; // Fixed platform fee
  const totalAmount = subtotal - totalDiscount + platformFee;

  const handleContinue = () => {
    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'Business information is missing');
      return;
    }

    const items = Array.from(selectedItems.values());
    navigation.navigate('DateSelection', {
      businessId,
      tailorName,
      selectedItems: items,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Clothes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Available Items */}
        <View style={styles.availableSection}>
          {availableItems.map((item) => {
            const isSelected = selectedItems.has(item.ItemId);
            return (
              <TouchableOpacity
                key={item.ItemId}
                style={[
                  styles.availableItemCard,
                  !item.IsAvailable && styles.itemCardDisabled,
                  isSelected && styles.availableItemSelected,
                ]}
                onPress={() => item.IsAvailable && handleToggleItem(item)}
                disabled={!item.IsAvailable}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.availableItemName,
                  isSelected && styles.availableItemNameSelected
                ]}>
                  {item.Name}
                </Text>
                <View style={[
                  styles.iconCircleSmall,
                  isSelected && styles.iconCircleSelected
                ]}>
                  <Icon
                    name={isSelected ? 'checkmark' : 'add'}
                    size={20}
                    color={isSelected ? Colors.whiteColor : Colors.warmBrownColor}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Items */}
        {selectedItems.size > 0 && (
          <View style={styles.section}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedTitleContainer}>
                <View style={styles.iconCircle}>
                  <Icon name="bag-handle" size={20} color={Colors.whiteColor} />
                </View>
                <Text style={styles.sectionTitle}>
                  Selected Items ({totalItems})
                </Text>
              </View>
              <View style={styles.itemsCountBadge}>
                <Text style={styles.itemsCountText}>{totalItems} items</Text>
              </View>
            </View>

            {Array.from(selectedItems.values()).map((item) => {
              const finalPrice = calculateFinalPrice(item);
              const savings = item.FullPrice - finalPrice;
              const itemTotal = finalPrice * item.quantity;

              return (
                <View key={item.ItemId} style={styles.selectedItem}>
                  <View style={styles.selectedItemLeft}>
                    <View style={styles.itemIconContainer}>
                      <Icon name="shirt-outline" size={28} color={Colors.warmBrownColor} />
                    </View>
                    <View style={styles.selectedItemInfo}>
                      <Text style={styles.selectedItemName}>{item.Name}</Text>
                      {savings > 0 && (
                        <View style={styles.savingsTag}>
                          <Icon name="pricetag" size={12} color="#10B981" />
                          <Text style={styles.savingsText}>
                            Save ₹{savings.toFixed(2)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.priceRow}>
                        {savings > 0 && (
                          <Text style={styles.originalPrice}>
                            ₹{item.FullPrice.toFixed(2)}
                          </Text>
                        )}
                        <Text style={styles.finalPrice}>
                          ₹{finalPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.selectedItemRight}>
                    <Text style={styles.itemTotal}>
                      Total: ₹{itemTotal.toFixed(2)}
                    </Text>
                    <View style={styles.quantityControls}>
                      <Text style={styles.qtyLabel}>QTY</Text>
                      <View style={styles.quantityButtons}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleDecrementQuantity(item.ItemId)}
                        >
                          <Icon name="remove" size={16} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleIncrementQuantity(item.ItemId)}
                        >
                          <Icon name="add" size={16} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteItem(item.ItemId)}
                        >
                          <Icon name="close" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Price Details */}
        {selectedItems.size > 0 && (
          <View style={styles.section}>
            <View style={styles.priceDetailsHeader}>
              <View style={styles.iconCircle}>
                <Icon name="receipt" size={20} color={Colors.whiteColor} />
              </View>
              <Text style={styles.sectionTitle}>Price Details</Text>
            </View>

            <View style={styles.priceDetailRow}>
              <View style={styles.priceRowLeft}>
                <Icon name="receipt-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.priceLabel}>Price ({totalItems} items)</Text>
              </View>
              <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.priceDetailRow}>
              <View style={styles.priceRowLeft}>
                <Icon name="pricetag-outline" size={18} color="#10B981" />
                <Text style={[styles.priceLabel, styles.discountLabel]}>
                  Discount
                </Text>
              </View>
              <Text style={[styles.priceValue, styles.discountValue]}>
                -₹{totalDiscount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceDetailRow}>
              <View style={styles.priceRowLeft}>
                <Icon name="business-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.priceLabel}>Platform Fee</Text>
              </View>
              <Text style={styles.priceValue}>₹{platformFee.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Total Amount and Savings in ScrollView */}
        {selectedItems.size > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.totalSummary}>
              <Text style={styles.totalAmountLabel}>Total Amount</Text>
              <Text style={styles.totalAmountValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.savingsMessage}>
                <Icon name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.savingsMessageText}>
                  You will save ₹{totalDiscount.toFixed(2)} on this order
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Buttons - Fixed */}
      {selectedItems.size !== 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.backActionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  availableSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  availableItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.whiteColor,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  itemCardDisabled: {
    opacity: 0.4,
    backgroundColor: '#F9FAFB',
  },
  availableItemSelected: {
    borderColor: Colors.warmBrownColor,
    backgroundColor: '#FEF3E2',
    borderWidth: 2,
  },
  availableItemName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  availableItemNameSelected: {
    color: Colors.warmBrownColor,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
  },
  iconCircleSelected: {
    backgroundColor: Colors.warmBrownColor,
    borderColor: Colors.warmBrownColor,
  },
  section: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warmBrownColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemsCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: GILROY_SEMIBOLD,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 6,
  },
  savingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: GILROY_SEMIBOLD,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 13,
    color: Colors.grey,
    fontFamily: GILROY_REGULAR,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  selectedItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginBottom: 8,
  },
  quantityControls: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: GILROY_MEDIUM,
    marginBottom: 6,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginLeft: 8,
  },
  priceDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  priceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: GILROY_REGULAR,
    marginLeft: 8,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: GILROY_SEMIBOLD,
  },
  discountLabel: {
    color: '#10B981',
  },
  discountValue: {
    color: '#10B981',
  },
  bottomSpacer: {
    height: 150,
  },
  summarySection: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  totalSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  totalAmountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: GILROY_BOLD,
  },
  savingsMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  savingsMessageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: GILROY_SEMIBOLD,
    marginLeft: 8,
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 65,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  backActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
    borderWidth: 2,
    borderColor: Colors.warmBrownColor,
    marginRight: 12,
  },
  backButtonText: {
    color: Colors.warmBrownColor,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
  continueButton: {
    flex: 2,
    backgroundColor: Colors.warmBrownColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  continueButtonText: {
    color: Colors.whiteColor,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: GILROY_BOLD,
  },
});

export default SelectClothesScreen;
